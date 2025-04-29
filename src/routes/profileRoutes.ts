import express from "express";
import * as profileController from "../controllers/profileController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authenticateToken);

// Get user profile
router.get("/", (req, res) => {
  void profileController.getProfile(req, res);
});

// Update user profile
router.put("/", (req, res) => {
  void profileController.updateProfile(req, res);
});

// Change password
router.put("/password", (req, res) => {
  void profileController.changePassword(req, res);
});

// Delete account
router.delete("/", (req, res) => {
  void profileController.deleteAccount(req, res);
});

export default router;
