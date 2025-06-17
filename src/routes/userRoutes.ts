import express, { Request, Response } from "express";
import User from "../models/userModel";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, firstName, lastName, roles } = req.body;

        if (!username || !email || !password || !firstName || !lastName) {
          res.status(400).json({ error: "All fields are required" });
        }

        const newUser = new User({ 
            username, 
            email, 
            firstName, 
            lastName,
            roles: roles && Array.isArray(roles) ? roles : ["user"],
        });

        const registeredUser = await User.register(newUser, password);

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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
