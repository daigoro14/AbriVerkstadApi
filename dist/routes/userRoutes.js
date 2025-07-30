"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userModel_1 = __importDefault(require("../models/userModel"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, roles } = req.body;
        if (!username || !email || !password || !firstName || !lastName) {
            res.status(400).json({ error: "All fields are required" });
        }
        const newUser = new userModel_1.default({
            username,
            email,
            firstName,
            lastName,
            roles: roles && Array.isArray(roles) ? roles : ["user"],
        });
        const registeredUser = await userModel_1.default.register(newUser, password);
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: registeredUser._id,
                username: registeredUser.username,
                email: registeredUser.email,
                firstName: registeredUser.firstName,
                lastName: registeredUser.lastName,
                roles: registeredUser.roles
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["superAdmin"]), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const query = {};
        if (search) {
            const regex = new RegExp(search.toString(), "i");
            query.$or = [
                { username: regex },
                { email: regex },
                { firstName: regex },
                { lastName: regex },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const total = await userModel_1.default.countDocuments(query);
        const users = await userModel_1.default.find(query)
            .skip(skip)
            .limit(Number(limit))
            .select("-hash -salt") // Exclude password hash if using passport-local-mongoose
            .lean();
        res.json({
            users,
            total,
            page: Number(page),
            limit: Number(limit),
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/:id", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["admin", "superAdmin"]), async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userModel_1.default.findById(userId)
            .select("-hash -salt") // Exclude sensitive fields
            .lean();
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put("/:id", authMiddleware_1.authenticateJWT, (0, authMiddleware_1.authorizeRoles)(["admin", "superAdmin"]), async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, firstName, lastName, roles } = req.body;
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Update fields
        if (username)
            user.username = username;
        if (email)
            user.email = email;
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (roles && Array.isArray(roles))
            user.roles = roles;
        await user.save();
        res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
