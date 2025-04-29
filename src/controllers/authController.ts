import { Request, Response } from "express";
import * as UserModel from "../models/User.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET =
  process.env.JWT_SECRET || "default_secret_change_in_production";

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, email, password } = req.body;

    // Validate input
    if (!firstName || !email || !password) {
      return res
        .status(400)
        .json({ error: "First name, email, and password are required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.getUserByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create new user
    const newUser = await UserModel.createUser(firstName, email, password);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user info without password and token
    return res.status(201).json({
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await UserModel.verifyPassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user info without password and token
    return res.status(200).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ error: "Failed to login" });
  }
};

// Verify token and get user data
export const verifyToken = async (req: Request, res: Response) => {
  try {
    // Authentication middleware already verified the token
    // and attached the user data to the request
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch user from database to confirm they still exist
    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return user data (without sensitive information)
    return res.status(200).json({
      user: {
        id: user.id,
        firstName: user.firstName,
        email: user.email,
        createdAt: user.createdAt,
      },
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ error: "Failed to verify token" });
  }
};
