import prisma from "../config/prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Get user by ID
export const getUserById = async (id: string): Promise<any | null> => {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<any | null> => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (
  firstName: string,
  email: string,
  password: string
): Promise<any> => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return await prisma.user.create({
      data: {
        firstName,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update user's first name
export const updateUserName = async (
  id: string,
  firstName: string
): Promise<any | null> => {
  try {
    return await prisma.user.update({
      where: { id },
      data: { firstName },
    });
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

// Update user's password
export const updateUserPassword = async (
  id: string,
  password: string
): Promise<any | null> => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  } catch (error) {
    console.error(`Error updating password for user with id ${id}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id: string): Promise<any | null> => {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

// Verify user password
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};

// Get user stats
export const getUserStats = async (userId: string) => {
  try {
    const bucketList = await prisma.bucketListEntry.findMany({
      where: { userId },
    });

    const totalEntries = bucketList.length;
    const completedEntries = bucketList.filter(
      (entry: any) => entry.completed
    ).length;
    const completionPercentage =
      totalEntries > 0
        ? Math.round((completedEntries / totalEntries) * 100)
        : 0;

    return {
      totalEntries,
      completedEntries,
      completionPercentage,
      completionMessage: getCompletionMessage(completionPercentage),
    };
  } catch (error) {
    console.error(`Error getting stats for user with id ${userId}:`, error);
    throw error;
  }
};

// Helper function to get completion message based on percentage
const getCompletionMessage = (percentage: number): string => {
  if (percentage === 0) {
    return "You haven't done any of bucket list items yet, Time to get started.";
  } else if (percentage >= 1 && percentage <= 24) {
    return "You have started, but you should get more done.";
  } else if (percentage >= 25 && percentage <= 49) {
    return "You are getting something done, but you still have more to do.";
  } else if (percentage === 50) {
    return "You are half-way there! Keep going!";
  } else if (percentage >= 51 && percentage <= 74) {
    return "Nice! You have completed more than half of your list!";
  } else if (percentage >= 75 && percentage <= 89) {
    return "Well done! You have completed at least three quarters of your list!";
  } else if (percentage >= 90 && percentage <= 99) {
    return "Most of it is done. Finish what is left!";
  } else {
    return "Great job! You did it! Now maybe think if there are more things you want to do and add them.";
  }
};
