// bucketlist-backend/src/routes/profileRoutes.ts
import express, { Request, Response } from "express";
import * as UserModel from "../models/User.model";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authenticateToken);

// Get user profile
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user stats
    const stats = await UserModel.getUserStats(userId);

    return res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      createdAt: user.createdAt,
      stats,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

// Update user profile (first name)
router.put("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { firstName, currentPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!firstName || !currentPassword) {
      return res
        .status(400)
        .json({ error: "First name and current password are required" });
    }

    // Verify current password
    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await UserModel.verifyPassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Update first name
    const updatedUser = await UserModel.updateUserName(userId, firstName);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      email: updatedUser.email,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.put("/password", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    // Verify current password
    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await UserModel.verifyPassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Update password
    await UserModel.updateUserPassword(userId, newPassword);

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
});

// Delete account
router.delete("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Verify password
    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await UserModel.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Delete user
    await UserModel.deleteUser(userId);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
