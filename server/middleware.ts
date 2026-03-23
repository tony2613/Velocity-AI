import { storage } from "./storage";

export const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized" });
};

/** Only allows requests from users with isAdmin = true */
export const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user?.isAdmin === true) {
        return next();
    }
    res.status(403).json({ error: "Forbidden: Admin access required" });
};

/** Expire paid subscription and downgrade user back to free */
async function expireSubscriptionIfNeeded(user: any): Promise<string> {
    const now = new Date();
    if (
        user.subscriptionTier !== 'free' &&
        user.subscriptionExpiresAt &&
        new Date(user.subscriptionExpiresAt) < now
    ) {
        await storage.updateUserTier(user.id, 'free');
        return 'free';
    }
    return user.subscriptionTier || 'free';
}

// Rate limiting middleware
export const checkUsageLimit = async (req: any, res: any, next: any) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const user = await storage.getUser(req.user.id);
        if (!user) return res.status(401).json({ error: "User not found" });

        // Auto-expire subscription if past due
        const tier = await expireSubscriptionIfNeeded(user);

        const today = new Date();
        const lastUpload = user.lastUploadDate ? new Date(user.lastUploadDate) : new Date(0);

        // Check if it's a new day (UTC)
        const isNewDay = today.getUTCDate() !== lastUpload.getUTCDate() ||
            today.getUTCMonth() !== lastUpload.getUTCMonth() ||
            today.getUTCFullYear() !== lastUpload.getUTCFullYear();

        if (isNewDay) {
            await storage.resetDailyUsage(user.id);
            req.user.dailyUploadCount = 0;
        }

        // Define limits based on tier
        const limits: Record<string, number> = {
            'free': 5,
            'pro': 50,
            'elite': 200
        };

        const limit = limits[tier] || 5;

        if (user.dailyUploadCount >= limit) {
            return res.status(429).json({
                error: `Daily usage limit reached for ${tier} plan. Upgrade for more.`,
                limit,
                tier
            });
        }

        next();
    } catch (error) {
        console.error("Usage check error:", error);
        next(error);
    }
};

export const checkSearchLimit = async (req: any, res: any, next: any) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        const user = await storage.getUser(req.user.id);
        if (!user) return res.status(401).json({ error: "User not found" });

        // Auto-expire subscription if past due
        const tier = await expireSubscriptionIfNeeded(user);

        const today = new Date();
        const lastSearch = user.lastSearchDate ? new Date(user.lastSearchDate) : new Date(0);

        // Check if it's a new day (UTC)
        const isNewDay = today.getUTCDate() !== lastSearch.getUTCDate() ||
            today.getUTCMonth() !== lastSearch.getUTCMonth() ||
            today.getUTCFullYear() !== lastSearch.getUTCFullYear();

        if (isNewDay) {
            await storage.resetDailySearch(user.id);
            req.user.dailySearchCount = 0;
        }

        // Define search limits
        const searchLimits: Record<string, number> = {
            'free': 0,
            'pro': 10,
            'elite': 100
        };

        const limit = searchLimits[tier] || 0;

        if (limit === 0) {
            return res.status(403).json({
                error: "Research Mode is only available for Pro and Elite users.",
                tier
            });
        }

        if (user.dailySearchCount >= limit) {
            return res.status(429).json({
                error: `Daily search limit reached for ${tier} plan. Upgrade to Elite for more.`,
                limit,
                tier
            });
        }

        next();
    } catch (error) {
        console.error("Search limit check error:", error);
        next(error);
    }
};
