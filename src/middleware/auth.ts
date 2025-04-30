import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as UserModel from "../models/User.model";

dotenv.config();

const JWT_SECRET =
  process.env.JWT_SECRET || "default_secret_change_in_production";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    // Check if user exists in the database
    const user = await UserModel.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach user info to request
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ error: "Token expired" });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};
