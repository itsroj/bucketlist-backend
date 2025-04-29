import prisma from "../config/prisma";

// Get chat messages for a user, with most recent first
export const getChatHistory = async (userId: string, limit: number = 20) => {
  try {
    return await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error(`Error fetching chat history for user ${userId}:`, error);
    throw error;
  }
};

// Create a new chat message
export const createChatMessage = async (
  userId: string,
  content: string,
  isUserMessage: boolean
) => {
  try {
    return await prisma.chatMessage.create({
      data: {
        userId,
        content,
        isUserMessage,
      },
    });
  } catch (error) {
    console.error(`Error creating chat message for user ${userId}:`, error);
    throw error;
  }
};

// Delete all chat messages for a user
export const deleteChatHistory = async (userId: string) => {
  try {
    return await prisma.chatMessage.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error(`Error deleting chat history for user ${userId}:`, error);
    throw error;
  }
};

export default {
  getChatHistory,
  createChatMessage,
  deleteChatHistory,
};
