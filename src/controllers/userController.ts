import { Request, Response } from "express";
import * as UserModel from "../models/User.model";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Get all users - Implement directly using prisma since getUsers isn't available
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        email: true,
        createdAt: true,
      },
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers controller:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get a single user
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await UserModel.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById controller:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res
        .status(400)
        .json({ error: "First name, email, and password are required" });
    }

    const newUser = await UserModel.createUser(firstName, email, password);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error("Error in createUser controller:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update a user - Implement using updateUserName
export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { firstName } = req.body;
    if (!firstName) {
      return res
        .status(400)
        .json({ error: "First name is required to update" });
    }

    const updatedUser = await UserModel.updateUserName(userId, firstName);
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const deleted = await UserModel.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
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
};

// Update user profile (first name)
export const updateProfile = async (req: Request, res: Response) => {
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
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
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
};

// Delete account
export const deleteAccount = async (req: Request, res: Response) => {
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
};

// Helper function to get completion message based on percentage
const getCompletionMessage = (percentage: number): string => {
  if (percentage === 0) {
    return "You haven't done any of bucket list items yet, Time to get started.";
  } else if (percentage >= 1 && percentage <= 24) {
    return "You have started, but you should get more done.";
  } else if (percentage >= 25 && percentage <= 49) {
    return "You are getting something done, but you still have more to do.";
  } else if (percentage === 50) {
    return "You are half-way there! Keep going!";
  } else if (percentage >= 51 && percentage <= 74) {
    return "Nice! You have completed more than half of your list!";
  } else if (percentage >= 75 && percentage <= 89) {
    return "Well done! You have completed at least three quarters of your list!";
  } else if (percentage >= 90 && percentage <= 99) {
    return "Most of it is done. Finish what is left!";
  } else {
    return "Great job! You did it! Now maybe think if there are more things you want to do and add them.";
  }
};
