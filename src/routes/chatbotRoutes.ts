import express from "express";
import { authenticateToken } from "../middleware/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatMessageModel from "../models/ChatMessage.model";

const router = express.Router();

// Interface for the request with authenticated user
interface AuthRequest extends express.Request {
  user?: {
    id: string;
    email: string;
  };
}

// Middleware to ensure user is authenticated
const isAuthenticated = (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  // Check if user exists in the request (set by authenticateToken)
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// System prompt to guide the AI's responses
const SYSTEM_PROMPT = `You are an enthusiastic and helpful Bucket List Assistant for the Burn The Bucket bucket list application. Your purpose is to assist users with the app's functionality and provide bucket list suggestions.

ABOUT THE APP'S FUNCTIONALITY:

1. Creating Bucket List Entries:
   - Users can click the prominent "Create an entry" button in the center of the dashboard
   - When creating an entry, users can fill in these fields:
     * Title (required): What they want to do
     * Description: Details about the bucket list item
     * Location: Where they want to do this activity (defaults to "Anywhere")
     * Image URL: Link to an image related to the activity
     * Upload Image: Upload an image related to the activity

2. Managing Entries:
   - Check/Uncheck: Users can click the large checkbox on the left side of any entry to mark it as completed
   - Edit: Using the "Edit" button on an entry to modify any of its details
   - Delete: Using the "Delete" button to remove an entry permanently

3. Progress Tracking:
   - The progress bar at the top right shows the percentage of completed bucket list items
   - It displays "X of Y tasks" to show completion status
   - The app provides motivational messages based on completion percentage
   - The more items checked off, the more the progress bar fills

4. User Settings (accessible via the settings icon in the top right):
   - Edit First Name: Change your display name
   - Change Password: Update your login password
   - Delete Account: Permanently remove your account and all data
   - Logout: Sign out of the application

5. Entry Organization:
   - Users can sort entries by creation date using the sort button (Oldest to Newest or Newest to Oldest)
   - Completed entries show a "DONE!" overlay and the date it was completed.

PROVIDING BUCKET LIST SUGGESTIONS:
When users ask about bucket list ideas or specific activities:
- Suggest meaningful and diverse bucket list ideas across categories like travel, adventure, learning, etc.
- For specific activities (e.g., "Tell me about skydiving"), provide information about:
  * What the experience is like
  * How to prepare or get started
  * Approximate costs
  * Best locations or ways to experience it
  * Tips for beginners
- Be encouraging and motivational about completing bucket list items
- Provide practical advice for planning and achieving bucket list goals

Keep your responses friendly, concise, and focused on the user's specific question. When suggesting bucket list ideas, be thoughtful and varied, considering different interests, budgets, and accessibility needs.

Remember, you're here to inspire users to create meaningful life experiences and help them effectively use the application to track their progress.`;

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "YOUR_API_KEY"
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Apply authenticateToken middleware to all routes
router.use(authenticateToken);

// Get chat history for a user
router.get("/history", isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const chatHistory = await ChatMessageModel.getChatHistory(userId);

    // Return in chronological order, so reverse the results
    return res.status(200).json([...chatHistory].reverse());
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ message: "Failed to fetch chat history" });
  }
});

// Send a message to the chatbot
router.post("/message", isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Message is required" });
    }

    // Save the user's message to the database
    const userMessage = await ChatMessageModel.createChatMessage(
      userId,
      message,
      true
    );

    // Get recent chat history for context (last 10 messages)
    const chatHistory = await ChatMessageModel.getChatHistory(userId, 10);

    // Format chat history for Gemini
    const formattedHistory = [...chatHistory]
      .reverse() // Get messages in chronological order
      .map((msg: any) => ({
        role: msg.isUserMessage ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    // Add current message if not already in history
    // (This happens if the user has no previous messages)
    if (
      formattedHistory.length === 0 ||
      formattedHistory[formattedHistory.length - 1].parts[0].text !== message
    ) {
      formattedHistory.push({
        role: "user",
        parts: [{ text: message }],
      });
    }

    // Prepare system message to be included in the chat
    const systemMessage = {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }],
    };

    // Create a new chat session with the system prompt
    const chat = model.startChat({
      // Add system prompt as the first message for guidance
      history: [systemMessage, ...formattedHistory],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Get response from Gemini to the user's message
    const result = await chat.sendMessage(message);
    const botResponse = result.response.text();

    // Save the AI response to the database
    const aiMessage = await ChatMessageModel.createChatMessage(
      userId,
      botResponse,
      false
    );

    return res.status(200).json({
      message: botResponse,
      userMessageId: userMessage.id,
      aiMessageId: aiMessage.id,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).json({ message: "Failed to process message" });
  }
});

// Delete all chat history for a user
router.delete("/history", isAuthenticated, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    await ChatMessageModel.deleteChatHistory(userId);

    return res
      .status(200)
      .json({ message: "Chat history deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return res.status(500).json({ message: "Failed to delete chat history" });
  }
});

export default router;
