import express, { Request, Response } from "express";
import User from "../models/userModel";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";

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
            roles: roles && Array.isArray(roles) ? roles : ["admin"],
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

router.get("/", authenticateJWT,authorizeRoles(["superAdmin"]), async (req: Request, res: Response): Promise<void> => {
      try {
        const { page = 1, limit = 10, search = "" } = req.query;
  
        const query: any = {};
  
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
        const total = await User.countDocuments(query);
  
        const users = await User.find(query)
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
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
);
  
router.get("/:id", authenticateJWT, authorizeRoles(["admin", "superAdmin"]), async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
  
      const user = await User.findById(userId)
        .select("-hash -salt") // Exclude sensitive fields
        .lean();
  
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      res.status(200).json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
});
  
router.put("/:id", authenticateJWT, authorizeRoles(["admin", "superAdmin"]), async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;
      const { username, email, firstName, lastName, roles } = req.body;
  
      const user = await User.findById(userId);
  
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      // Update fields
      if (username) user.username = username;
      if (email) user.email = email;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (roles && Array.isArray(roles)) user.roles = roles;
  
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  

export default router;
