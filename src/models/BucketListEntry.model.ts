import prisma from "../config/prisma";

// Get all entries for a user
export const getAllEntries = async (
  userId: string,
  sortOrder: "asc" | "desc" = "asc"
): Promise<any[]> => {
  try {
    return await prisma.bucketListEntry.findMany({
      where: { userId },
      orderBy: { createdAt: sortOrder },
    });
  } catch (error) {
    console.error("Error fetching bucket list entries:", error);
    throw error;
  }
};

// Get entry by ID
export const getEntryById = async (
  id: string,
  userId: string
): Promise<any | null> => {
  try {
    return await prisma.bucketListEntry.findFirst({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    console.error(`Error fetching bucket list entry with id ${id}:`, error);
    throw error;
  }
};

// Create a new entry
export const createEntry = async (data: {
  title: string;
  description?: string;
  location?: string;
  imageUrl?: string;
  userId: string;
}): Promise<any> => {
  try {
    return await prisma.bucketListEntry.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location || "Anywhere",
        imageUrl: data.imageUrl,
        userId: data.userId,
      },
    });
  } catch (error) {
    console.error("Error creating bucket list entry:", error);
    throw error;
  }
};

// Update an entry
export const updateEntry = async (
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    location?: string;
    imageUrl?: string;
    completed?: boolean;
    completedOn?: Date | null;
  }
): Promise<any | null> => {
  try {
    // First check if entry exists and belongs to the user
    const existingEntry = await getEntryById(id, userId);
    if (!existingEntry) {
      return null;
    }

    return await prisma.bucketListEntry.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error(`Error updating bucket list entry with id ${id}:`, error);
    throw error;
  }
};

// Toggle completion status
export const toggleCompletion = async (
  id: string,
  userId: string
): Promise<any | null> => {
  try {
    // First check if entry exists and belongs to the user
    const existingEntry = await getEntryById(id, userId);
    if (!existingEntry) {
      return null;
    }

    return await prisma.bucketListEntry.update({
      where: { id },
      data: {
        completed: !existingEntry.completed,
        completedOn: !existingEntry.completed ? new Date() : null,
      },
    });
  } catch (error) {
    console.error(
      `Error toggling completion status for entry with id ${id}:`,
      error
    );
    throw error;
  }
};

// Delete an entry
export const deleteEntry = async (
  id: string,
  userId: string
): Promise<any | null> => {
  try {
    // First check if entry exists and belongs to the user
    const existingEntry = await getEntryById(id, userId);
    if (!existingEntry) {
      return null;
    }

    return await prisma.bucketListEntry.delete({
      where: { id },
    });
  } catch (error) {
    console.error(`Error deleting bucket list entry with id ${id}:`, error);
    throw error;
  }
};

// Get stats for a user's bucket list
export const getStats = async (userId: string) => {
  try {
    const bucketList = await getAllEntries(userId);

    const totalEntries = bucketList.length;
    const completedEntries = bucketList.filter(
      (entry) => entry.completed
    ).length;
    const completionPercentage =
      totalEntries > 0
        ? Math.round((completedEntries / totalEntries) * 100)
        : 0;

    return {
      totalEntries,
      completedEntries,
      completionPercentage,
    };
  } catch (error) {
    console.error(`Error getting stats for user with id ${userId}:`, error);
    throw error;
  }
};
