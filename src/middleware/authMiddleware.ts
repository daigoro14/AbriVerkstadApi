import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            email: string;
            roles: string[];
        };
    }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey") as { id: string; email: string; roles: string[] };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
        return;
    }
};

export const authorizeRoles = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !Array.isArray(req.user.roles)) {
            res.status(403).json({ error: "Access denied. User roles not found." });
            return; 
        }

        const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

        if (!hasRequiredRole) {
            res.status(403).json({ error: "Access denied. Insufficient permissions." });
            return;
        }

        next(); 
    };
};

