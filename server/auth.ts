import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { type Express } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { pool } from "./db";
import { type User } from "@shared/schema";
import { PLAN_LIMITS } from "../shared/plans";
import { sendEmail, getWelcomeEmailHtml, getPasswordResetEmailHtml } from "./email";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function sanitizeUser(user: any) {
    if (!user) return user;
    const { password, passwordResetToken, passwordResetExpires, ...safeUser } = user;
    return safeUser;
}

export function setupAuth(app: Express) {
    const PgStore = pgSession(session);
    const sessionSettings: session.SessionOptions = {
        store: new PgStore({ pool, tableName: 'session' }),
        secret: process.env.SESSION_SECRET || "super secret session key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            secure: app.get("env") === "production",
            sameSite: "lax",
        },
    };

    app.set("trust proxy", 1);
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                if (!user) {
                    return done(null, false, { message: "Invalid username or password" });
                }
                if (!user.password) {
                    return done(null, false, { message: "This account logs in via Google. Please use Google Sign-in." });
                }
                const passwordMatch = await comparePasswords(password, user.password);
                if (!passwordMatch) {
                    return done(null, false, { message: "Invalid username or password" });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }),
    );

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        let callbackURL = (process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback").replace("://www.", "://");
        if (process.env.NODE_ENV === "production" && !callbackURL.startsWith("http")) {
            callbackURL = "https://velocityaisoftware.app/api/auth/google/callback";
        }
        console.log(`[Passport] Initializing GoogleStrategy with callbackURL: ${callbackURL}`);

        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL,
                    passReqToCallback: true,
                },
                async (_req, _accessToken, _refreshToken, profile, done) => {
                    try {
                        const email = profile.emails?.[0]?.value;
                        if (!email) {
                            return done(new Error("No email found in Google profile"));
                        }

                        // 1. Check if user already exists by Google ID
                        let user = await storage.getUserByGoogleId(profile.id);
                        if (user) {
                            return done(null, user);
                        }

                        // 2. Check if user already exists by email
                        user = await storage.getUserByEmail(email);
                        if (user) {
                            // Link Google ID to existing account
                            user = await storage.updateUserGoogleId(user.id, profile.id);
                            return done(null, user);
                        }

                        // 3. Create a new user with Google details
                        const displayName = profile.displayName || profile.name?.givenName || email.split("@")[0];
                        
                        // Ensure unique username
                        let username = displayName;
                        let count = 1;
                        while (await storage.getUserByUsername(username)) {
                            username = `${displayName}${count++}`;
                        }

                        user = await storage.createUser({
                            username,
                            email,
                            googleId: profile.id,
                            isVerified: true,
                        });

                        return done(null, user);
                    } catch (err) {
                        return done(err);
                    }
                }
            )
        );
    } else {
        console.warn("[Passport] Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
    }

    passport.serializeUser((user, done) => done(null, (user as User).id));
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.get("/api/auth/google/config", (_req, res) => {
        const enabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
        return res.json({
            enabled,
            clientId: process.env.GOOGLE_CLIENT_ID || null,
        });
    });

    app.post("/api/auth/google/credential", async (req, res) => {
        try {
            const { credential, deviceId: rawDeviceId } = req.body;
            if (!credential) {
                return res.status(400).json({ error: "Missing Google credential token" });
            }
            if (!process.env.GOOGLE_CLIENT_ID) {
                return res.status(500).json({ error: "Google Sign-In is not configured on this server" });
            }

            // Verify Google ID token via Google official tokeninfo API
            const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
            if (!tokenRes.ok) {
                const errData = await tokenRes.json().catch(() => ({}));
                console.error("[Passport] Google tokeninfo verification failed:", errData);
                return res.status(401).json({ error: "Google verification failed. Invalid token." });
            }

            const payload: any = await tokenRes.json();

            // Verify audience and issuer
            if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
                console.error("[Passport] Google token audience mismatch:", payload.aud, "expected:", process.env.GOOGLE_CLIENT_ID);
                return res.status(401).json({ error: "Google verification failed. Audience mismatch." });
            }

            const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
            if (!validIssuers.includes(payload.iss)) {
                console.error("[Passport] Google token invalid issuer:", payload.iss);
                return res.status(401).json({ error: "Google verification failed. Invalid token issuer." });
            }

            const email = payload.email;
            if (!email) {
                return res.status(400).json({ error: "No email address found in Google account." });
            }

            const googleId = payload.sub;

            // 1. Check if user already exists by Google ID
            let user = await storage.getUserByGoogleId(googleId);
            if (!user) {
                // 2. Check if user already exists by email
                user = await storage.getUserByEmail(email);
                if (user) {
                    user = await storage.updateUserGoogleId(user.id, googleId);
                } else {
                    // 3. Create new user with Google details
                    const displayName = payload.name || payload.given_name || email.split("@")[0];
                    let cleanUsername = displayName.replace(/[^a-zA-Z0-9_-]/g, "");
                    if (!cleanUsername) cleanUsername = "user";
                    let candidate = cleanUsername;
                    let count = 1;
                    while (await storage.getUserByUsername(candidate)) {
                        candidate = `${cleanUsername}${count++}`;
                    }
                    user = await storage.createUser({
                        username: candidate,
                        email,
                        googleId,
                        isVerified: true,
                    });
                }
            }

            req.logIn(user, async (loginErr) => {
                if (loginErr) {
                    console.error("[Passport] Google GIS req.logIn error:", loginErr);
                    return res.status(500).json({ error: "Session creation failed" });
                }

                try {
                    const deviceId = rawDeviceId || "google-gis";
                    const tier = (user.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
                    const planLimit = PLAN_LIMITS[tier]?.deviceLimit;
                    const allowedLimit = planLimit !== undefined ? planLimit : 1;

                    if (allowedLimit !== null) {
                        try {
                            const activeSessions = await storage.getActiveSessions(user.id);
                            const isDeviceAlreadyActive = activeSessions.some(s => s.deviceId === deviceId);

                            if (!isDeviceAlreadyActive && activeSessions.length >= allowedLimit) {
                                const overflowCount = activeSessions.length - allowedLimit + 1;
                                const sessionsToDestroy = activeSessions.slice(0, overflowCount);

                                for (const s of sessionsToDestroy) {
                                    await storage.deleteActiveSessionBySessionId(s.sessionId);
                                    if (req.sessionStore && typeof req.sessionStore.destroy === 'function') {
                                        req.sessionStore.destroy(s.sessionId, () => {});
                                    }
                                }
                            }
                        } catch (sessionErr) {
                            console.error("[Passport] Session cleanup error:", sessionErr);
                        }
                    }

                    try {
                        await storage.registerActiveSession(user.id, deviceId, req.sessionID, req.headers['user-agent'] || null);
                    } catch (regErr) {
                        console.error("[Passport] registerActiveSession error:", regErr);
                    }

                    try {
                        storage.logUsage({
                            userId: user.id,
                            action: "LOGIN",
                            tokensInput: 0,
                            tokensOutput: 0,
                            cost: 0,
                            metadata: JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'], provider: "google-gis" }),
                        });
                    } catch (logErr) {
                        console.error("[Passport] logUsage error:", logErr);
                    }

                    req.session.save((saveErr) => {
                        if (saveErr) {
                            console.error("[Passport] Session save error:", saveErr);
                            return res.status(500).json({ error: "Session save failed" });
                        }
                        return res.json({ ok: true, user: sanitizeUser(user) });
                    });
                } catch (err: any) {
                    console.error("[Passport] Post-login registration error:", err);
                    return res.json({ ok: true, user: sanitizeUser(user) });
                }
            });
        } catch (err: any) {
            console.error("[Passport] /api/auth/google/credential error:", err);
            return res.status(500).json({ error: err.message || "Authentication error" });
        }
    });

    app.get("/api/auth/google", (req, res, next) => {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            console.warn("[Passport] Google OAuth is not configured. Redirecting to /auth?error=google_oauth_not_configured");
            return res.redirect("/auth?error=google_oauth_not_configured");
        }

        const isPopup = req.query.popup === "1" || req.query.popup === "true";
        if (isPopup) {
            (req.session as any).isPopupAuth = true;
        } else {
            delete (req.session as any).isPopupAuth;
        }

        passport.authenticate("google", {
            scope: ["profile", "email"],
            state: isPopup ? "popup" : undefined,
        })(req, res, next);
    });

    app.get(
        "/api/auth/google/callback",
        (req, res, next) => {
            if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
                return res.redirect("/auth?error=google_oauth_not_configured");
            }

            const isPopup = req.query.state === "popup" || (req.session as any)?.isPopupAuth === true;
            delete (req.session as any)?.isPopupAuth;

            passport.authenticate("google", (err: any, user: User | false, info: any) => {
                if (err) {
                    console.error("[Passport] Google OAuth authentication error:", err);
                    const errMsg = err.message || "google_auth_failed";
                    if (isPopup) {
                        return res.send(`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Authentication Alert</title></head><body style="background:#09090b;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p style="font-size:14px;color:#ef4444;">Authentication failed. Closing...</p>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "VELOCITY_GOOGLE_AUTH_ERROR", error: ${JSON.stringify(errMsg)} }, "*");
        setTimeout(() => { window.close(); }, 500);
      } else {
        window.location.replace("/auth?error=" + encodeURIComponent(${JSON.stringify(errMsg)}));
      }
    } catch(e) {
      window.location.replace("/auth?error=" + encodeURIComponent(${JSON.stringify(errMsg)}));
    }
  </script>
</body></html>
                        `.trim());
                    }
                    return res.redirect(`/auth?error=${encodeURIComponent(errMsg)}`);
                }
                if (!user) {
                    console.warn("[Passport] Google OAuth user not found / denied:", info);
                    const errMsg = "Google account access denied.";
                    if (isPopup) {
                        return res.send(`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Authentication Alert</title></head><body style="background:#09090b;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p style="font-size:14px;color:#ef4444;">Access denied. Closing...</p>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "VELOCITY_GOOGLE_AUTH_ERROR", error: ${JSON.stringify(errMsg)} }, "*");
        setTimeout(() => { window.close(); }, 500);
      } else {
        window.location.replace("/auth?error=google_auth_failed");
      }
    } catch(e) {
      window.location.replace("/auth?error=google_auth_failed");
    }
  </script>
</body></html>
                        `.trim());
                    }
                    return res.redirect("/auth?error=google_auth_failed");
                }
                req.logIn(user, async (loginErr) => {
                    if (loginErr) {
                        console.error("[Passport] Google OAuth req.logIn error:", loginErr);
                        const errMsg = "Session creation failed.";
                        if (isPopup) {
                            return res.send(`
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Login Alert</title></head><body style="background:#09090b;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p style="font-size:14px;color:#ef4444;">Login failed. Closing...</p>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "VELOCITY_GOOGLE_AUTH_ERROR", error: ${JSON.stringify(errMsg)} }, "*");
        setTimeout(() => { window.close(); }, 500);
      } else {
        window.location.replace("/auth?error=login_failed");
      }
    } catch(e) {
      window.location.replace("/auth?error=login_failed");
    }
  </script>
</body></html>
                            `.trim());
                        }
                        return res.redirect("/auth?error=login_failed");
                    }

                    try {
                        const deviceId = "google-oauth";
                        const tier = (user.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
                        const planLimit = PLAN_LIMITS[tier]?.deviceLimit;
                        const allowedLimit = planLimit !== undefined ? planLimit : 1;

                        if (allowedLimit !== null) {
                            try {
                                const activeSessions = await storage.getActiveSessions(user.id);
                                const isDeviceAlreadyActive = activeSessions.some(s => s.deviceId === deviceId);

                                if (!isDeviceAlreadyActive && activeSessions.length >= allowedLimit) {
                                    const overflowCount = activeSessions.length - allowedLimit + 1;
                                    const sessionsToDestroy = activeSessions.slice(0, overflowCount);

                                    for (const s of sessionsToDestroy) {
                                        await storage.deleteActiveSessionBySessionId(s.sessionId);
                                        if (req.sessionStore && typeof req.sessionStore.destroy === 'function') {
                                            req.sessionStore.destroy(s.sessionId, () => {});
                                        }
                                    }
                                }
                            } catch (sessionErr) {
                                console.error("[Passport] Session cleanup error:", sessionErr);
                            }
                        }

                        try {
                            await storage.registerActiveSession(user.id, deviceId, req.sessionID, req.headers['user-agent'] || null);
                        } catch (regErr) {
                            console.error("[Passport] registerActiveSession error:", regErr);
                        }

                        try {
                            storage.logUsage({
                                userId: user.id,
                                action: "LOGIN",
                                tokensInput: 0,
                                tokensOutput: 0,
                                cost: 0,
                                metadata: JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'], provider: "google" }),
                            });
                        } catch (logErr) {
                            console.error("[Passport] logUsage error:", logErr);
                        }

                        req.session.save((saveErr) => {
                            if (saveErr) {
                                console.error("[Passport] Session save error:", saveErr);
                            }
                            if (isPopup) {
                                return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Signed In - VelocityAI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #09090b;
      color: #fafafa;
    }
    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 12px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p style="font-size: 14px; color: #a1a1aa;">Sign-in complete! Returning to VelocityAI...</p>
  <script>
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "VELOCITY_GOOGLE_AUTH_SUCCESS" }, "*");
        setTimeout(() => { window.close(); }, 300);
      } else {
        window.location.replace("/dashboard");
      }
    } catch (e) {
      window.location.replace("/dashboard");
    }
  </script>
</body>
</html>
                                `.trim());
                            }
                            return res.redirect("/dashboard");
                        });
                    } catch (err) {
                        console.error("[Passport] Google callback post-login error:", err);
                        if (isPopup) {
                            return res.send(`
<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="background:#09090b;color:#fafafa;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
<script>
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: "VELOCITY_GOOGLE_AUTH_SUCCESS" }, "*");
      setTimeout(() => { window.close(); }, 300);
    } else {
      window.location.replace("/dashboard");
    }
  } catch(e) {
    window.location.replace("/dashboard");
  }
</script>
</body></html>
                            `.trim());
                        }
                        return res.redirect("/dashboard");
                    }
                });
            })(req, res, next);
        }
    );

    app.post("/api/register", async (req, res, next) => {
        try {
            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            if (req.body.email) {
                const existingEmail = await storage.getUserByEmail(req.body.email);
                if (existingEmail) {
                    return res.status(400).send("Email already exists");
                }
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.createUser({
                ...req.body,
                password: hashedPassword,
            });

            req.login(user, async (err) => {
                if (err) return next(err);

                try {
                    const deviceId = req.body.deviceId || "unknown-device";
                    await storage.registerActiveSession(user.id, deviceId, req.sessionID, req.headers['user-agent'] || null);
                } catch (sessionErr) {
                    console.error("Device registration error during registration:", sessionErr);
                }

                // Send welcome email asynchronously
                if (user.email) {
                    const emailHtml = getWelcomeEmailHtml(user.username);
                    sendEmail({
                        to: user.email,
                        subject: "Welcome to Velocity AI!",
                        html: emailHtml
                    }).catch((err: unknown) => console.error("Failed to send welcome email:", err));
                }

                res.status(201).json(sanitizeUser(user));
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/forgot-password", async (req, res, next) => {
        try {
            const { email } = req.body;
            const user = await storage.getUserByEmail(email);

            if (!user) {
                // Return 200 even if user not found to prevent enumeration
                return res.status(200).send("If an account exists, a reset email has been sent.");
            }

            const token = randomBytes(32).toString("hex");
            const expiry = new Date(Date.now() + 3600000); // 1 hour

            await storage.setPasswordResetToken(user.id, token, expiry);

            const resetLink = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;
            const emailHtml = getPasswordResetEmailHtml(user.username, resetLink);

            sendEmail({
                to: user.email!,
                subject: "Reset Your Password - Velocity AI",
                html: emailHtml
            }).catch((err: unknown) => console.error("Failed to send reset email:", err));

            // Log the reset link to the console for testing purposes during development
            console.log("\n==============================================");
            console.log(" PASSWORD RESET LINK GENERATED");
            console.log(" Click here ->", resetLink);
            console.log("==============================================\n");

            res.status(200).send("If an account exists, a reset email has been sent.");
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/reset-password", async (req, res, next) => {
        try {
            const { token, newPassword } = req.body;
            const user = await storage.getUserByResetToken(token);

            if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
                return res.status(400).send("Invalid or expired token");
            }

            const hashedPassword = await hashPassword(newPassword);
            await storage.updateUserPassword(user.id, hashedPassword);

            res.status(200).send("Password updated successfully");
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).json({ message: info?.message || "Invalid credentials" });
            }

            req.login(user, async (loginErr) => {
                if (loginErr) return next(loginErr);
                
                try {
                    const deviceId = req.body.deviceId || "unknown-device";
                    const tier = (user.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
                    const planLimit = PLAN_LIMITS[tier]?.deviceLimit;
                    const allowedLimit = planLimit !== undefined ? planLimit : 1;

                    if (allowedLimit !== null) {
                        // Get currently active sessions
                        const activeSessions = await storage.getActiveSessions(user.id);
                        const isDeviceAlreadyActive = activeSessions.some(s => s.deviceId === deviceId);

                        if (!isDeviceAlreadyActive && activeSessions.length >= allowedLimit) {
                            // We need to free up slots. Destroy the oldest session(s)
                            const overflowCount = activeSessions.length - allowedLimit + 1;
                            const sessionsToDestroy = activeSessions.slice(0, overflowCount);

                            for (const s of sessionsToDestroy) {
                                await storage.deleteActiveSessionBySessionId(s.sessionId);
                                // Safely call sessionStore.destroy
                                if (req.sessionStore && typeof req.sessionStore.destroy === 'function') {
                                    req.sessionStore.destroy(s.sessionId, (destroyErr) => {
                                        if (destroyErr) {
                                            console.error(`Failed to destroy session ${s.sessionId}:`, destroyErr);
                                        }
                                    });
                                }
                            }
                        }
                    }

                    // Register this new session
                    await storage.registerActiveSession(user.id, deviceId, req.sessionID, req.headers['user-agent'] || null);
                } catch (sessionErr) {
                    console.error("Device limit enforcement error during login:", sessionErr);
                }

                // Log Login
                storage.logUsage({
                    userId: user.id,
                    action: "LOGIN",
                    tokensInput: 0,
                    tokensOutput: 0,
                    cost: 0,
                    metadata: JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] }),
                });
                res.status(200).json(sanitizeUser(user));
            });
        })(req, res, next);
    });

    app.post("/api/logout", async (req, res, next) => {
        const sessionId = req.sessionID;
        if (sessionId) {
            try {
                await storage.deleteActiveSessionBySessionId(sessionId);
            } catch (err) {
                console.error("Failed to delete session mapping on logout:", err);
            }
        }
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.json(null);
        res.json(sanitizeUser(req.user));
    });
}
