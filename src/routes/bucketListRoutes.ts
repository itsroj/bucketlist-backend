// bucketlist-backend/src/routes/bucketListRoutes.ts
import express, { Request, Response } from "express";
import * as BucketListEntryModel from "../models/BucketListEntry.model";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all entries
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get sort direction from query params
    const sortOrder = req.query.order === "newest" ? "desc" : "asc";

    const entries = await BucketListEntryModel.getAllEntries(
      userId,
      sortOrder as "asc" | "desc"
    );

    return res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching bucket list entries:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch bucket list entries" });
  }
});

// Get a single entry
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const entryId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const entry = await BucketListEntryModel.getEntryById(entryId, userId);

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching bucket list entry:", error);
    return res.status(500).json({ error: "Failed to fetch bucket list entry" });
  }
});

// Create a new entry
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, description, location, imageUrl } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newEntry = await BucketListEntryModel.createEntry({
      title,
      description,
      location,
      imageUrl,
      userId,
    });

    return res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating bucket list entry:", error);
    return res
      .status(500)
      .json({ error: "Failed to create bucket list entry" });
  }
});

// Update an entry
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const entryId = req.params.id;
    const { title, description, location, imageUrl, completed, completedOn } =
      req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedEntry = await BucketListEntryModel.updateEntry(
      entryId,
      userId,
      {
        title,
        description,
        location,
        imageUrl,
        completed,
        completedOn: completedOn ? new Date(completedOn) : null,
      }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating bucket list entry:", error);
    return res
      .status(500)
      .json({ error: "Failed to update bucket list entry" });
  }
});

// Toggle completion status
router.patch("/:id/toggle", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const entryId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedEntry = await BucketListEntryModel.toggleCompletion(
      entryId,
      userId
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error toggling completion status:", error);
    return res
      .status(500)
      .json({ error: "Failed to toggle completion status" });
  }
});

// Delete an entry
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const entryId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await BucketListEntryModel.deleteEntry(entryId, userId);

    if (!result) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting bucket list entry:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete bucket list entry" });
  }
});

export default router;
