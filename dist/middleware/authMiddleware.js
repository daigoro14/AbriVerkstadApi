"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "supersecretkey");
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
        return;
    }
};
exports.authenticateJWT = authenticateJWT;
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
