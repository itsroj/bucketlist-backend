import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Register a new user
router.post("/register", (req, res) => {
  void authController.register(req, res);
});

// Login user
router.post("/login", (req, res) => {
  void authController.login(req, res);
});

// Verify token (requires authentication)
router.get("/verify", authenticateToken, (req, res) => {
  void authController.verifyToken(req, res);
});

export default router;
