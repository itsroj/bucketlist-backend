import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import multer from "multer";
import path from "path";

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create the uploads directory if it doesn't exist
if (!fs.existsSync("uploads/")) {
  fs.mkdirSync("uploads/");
}

// Configure upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload image to Cloudinary
export const uploadImage = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated (middleware should handle this)
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "bucket-list-app",
      use_filename: true,
      unique_filename: true,
    });

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    // Return the Cloudinary URL
    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
};
