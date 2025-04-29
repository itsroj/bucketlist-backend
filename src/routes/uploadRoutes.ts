import express from "express";
import { uploadImage, upload } from "../controllers/uploadController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Upload image to Cloudinary
router.post("/image", upload.single("image"), (req, res) => {
  void uploadImage(req, res);
});

export default router;
