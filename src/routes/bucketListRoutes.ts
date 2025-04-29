import express from "express";
import * as bucketListController from "../controllers/bucketListController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all entries
router.get("/", (req, res) => {
  void bucketListController.getAllEntries(req, res);
});

// Get a single entry
router.get("/:id", (req, res) => {
  void bucketListController.getEntryById(req, res);
});

// Create a new entry
router.post("/", (req, res) => {
  void bucketListController.createEntry(req, res);
});

// Update an entry
router.put("/:id", (req, res) => {
  void bucketListController.updateEntry(req, res);
});

// Toggle completion status
router.patch("/:id/toggle", (req, res) => {
  void bucketListController.toggleCompletion(req, res);
});

// Delete an entry
router.delete("/:id", (req, res) => {
  void bucketListController.deleteEntry(req, res);
});

export default router;
