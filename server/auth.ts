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
            sameSite: app.get("env") === "production" ? "none" : "lax",
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
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
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

    // ... inside setupAuth ...
    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
        "/api/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/auth" }),
        async (req, res, next) => {
            const user = req.user as User;
            if (!user) {
                return res.redirect("/auth");
            }

            try {
                // Register active session for Google OAuth user
                const deviceId = "google-oauth";
                const tier = (user.subscriptionTier || 'free') as 'free' | 'pro' | 'elite';
                const planLimit = PLAN_LIMITS[tier]?.deviceLimit;
                const allowedLimit = planLimit !== undefined ? planLimit : 1;

                if (allowedLimit !== null) {
                    const activeSessions = await storage.getActiveSessions(user.id);
                    const isDeviceAlreadyActive = activeSessions.some(s => s.deviceId === deviceId);

                    if (!isDeviceAlreadyActive && activeSessions.length >= allowedLimit) {
                        const overflowCount = activeSessions.length - allowedLimit + 1;
                        const sessionsToDestroy = activeSessions.slice(0, overflowCount);

                        for (const s of sessionsToDestroy) {
                            await storage.deleteActiveSessionBySessionId(s.sessionId);
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

                await storage.registerActiveSession(user.id, deviceId, req.sessionID, req.headers['user-agent'] || null);

                // Log Usage
                storage.logUsage({
                    userId: user.id,
                    action: "LOGIN",
                    tokensInput: 0,
                    tokensOutput: 0,
                    cost: 0,
                    metadata: JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'], provider: "google" }),
                });

                res.redirect("/dashboard");
            } catch (err) {
                next(err);
            }
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

                res.status(201).json(user);
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
                res.status(200).json(user);
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
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });
}
