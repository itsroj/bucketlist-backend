import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import {
  authRoutes,
  userRoutes,
  bucketListRoutes,
  profileRoutes,
  chatbotRoutes,
} from "./routes";
import uploadRoutes from "./routes/uploadRoutes";

// Load environment variables
dotenv.config();

// Initialize express app
const app: Application = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Bucket List API" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bucket-list", bucketListRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/upload", uploadRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
