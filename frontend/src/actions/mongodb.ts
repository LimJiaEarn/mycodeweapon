"use server";

import client from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { CHATBOT_DATABASE, USER_CHATS_COLLECTION } from "@/constants/mongodb";
import { AiChatRole } from "@/types/ai";

// Types for better type safety
export interface ChatMessage {
  role: AiChatRole;
  content: string;
}

export interface UserChat {
  _id?: ObjectId;
  chatId: string;
  userId: string;
  problemId: string;
  imageUrl?: string;
  chatMessages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Creates a new chat document for a user and problem
 * @param userId - The user's ID
 * @param problemId - The problem's ID from Supabase
 * @param imageUrl - Optional image URL from Supabase
 * @returns chatId - The unique identifier for this chat session
 */
export async function createNewChat(
  userId: string,
  problemId: string,
  imageUrl?: string
): Promise<string> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);
    const chatId = new ObjectId().toString();

    console.log("Generated new chat details");
    console.log(
      `chatId: ${chatId}, userId: ${userId}, problemId: ${problemId}`
    );
    console.log(`imageUrl: ${imageUrl}`);

    const now = new Date();

    const newChat: UserChat = {
      chatId,
      userId,
      problemId,
      imageUrl,
      chatMessages: [],
      createdAt: now,
      updatedAt: now,
    };

    await collection.insertOne(newChat);
    console.log(`New chat created with chatId: ${chatId}`);

    return chatId;
  } catch (error) {
    console.error("Error creating new chat:", error);
    throw new Error("Failed to create new chat");
  }
}

/**
 * Adds messages to an existing chat
 * @param chatId - The chat's unique identifier
 * @param messages - Array of messages to append
 */
export async function addMessagesToChat(
  chatId: string,
  messages: ChatMessage[]
): Promise<void> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    // Add timestamps to messages if not present
    const messagesWithTimestamp = messages.map((msg) => ({
      ...msg,
    }));

    const result = await collection.updateOne(
      { chatId },
      {
        $push: {
          chatMessages: { $each: messagesWithTimestamp },
        } as any,
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(`Chat with chatId ${chatId} not found`);
    }

    console.log(`Added ${messages.length} messages to chat ${chatId}`);
  } catch (error) {
    console.error("Error adding messages to chat:", error);
    throw new Error("Failed to add messages to chat");
  }
}

/**
 * Overwrites the entire chatMessages array for a specific chat.
 * @param chatId - The chat's unique identifier.
 * @param newMessages - The new array of chat messages to set.
 */
export async function overwriteChatMessages(
  chatId: string,
  newMessages: ChatMessage[]
): Promise<void> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    const result = await collection.updateOne(
      { chatId },
      {
        $set: {
          chatMessages: newMessages,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new Error(
        `Chat with chatId ${chatId} not found. No messages were overwritten.`
      );
    }
    if (result.modifiedCount === 0 && result.matchedCount === 1) {
      console.log(
        `Chat with chatId ${chatId} found, but chatMessages were already identical. Document not modified.`
      );
    } else {
      console.log(`Overwrote chatMessages for chat ${chatId}.`);
    }
  } catch (error) {
    console.error("Error overwriting chat messages:", error);
    throw new Error("Failed to overwrite chat messages");
  }
}

/**
 * Fetches all past chats for a user and specific problem
 * @param userId - The user's ID
 * @param problemId - The problem's ID
 * @returns Array of chat summaries with chatId, createdAt, and message count
 */
export async function fetchPastChatsByProblemId(
  userId: string,
  problemId: string
): Promise<
  {
    chatId: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    imageUrl?: string;
  }[]
> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    const chats = await collection
      .find(
        { userId, problemId },
        {
          projection: {
            chatId: 1,
            createdAt: 1,
            updatedAt: 1,
            imageUrl: 1,
            chatMessages: 1,
          },
        }
      )
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();

    return chats.map((chat) => ({
      chatId: chat.chatId,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount: chat.chatMessages?.length || 0,
      imageUrl: chat.imageUrl,
    }));
  } catch (error) {
    console.error("Error fetching past chats:", error);
    throw new Error("Failed to fetch past chats");
  }
}

/**
 * Fetches a specific chat by its chatId
 * @param chatId - The chat's unique identifier
 * @returns Array of chat messages or null if not found
 */
export async function fetchChatByChatId(
  chatId: string
): Promise<ChatMessage[] | null> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    const chat = await collection.findOne(
      { chatId },
      { projection: { chatMessages: 1 } }
    );

    if (!chat) {
      console.log(`Chat with chatId ${chatId} not found`);
      return null;
    }

    return chat.chatMessages || [];
  } catch (error) {
    console.error("Error fetching chat by chatId:", error);
    throw new Error("Failed to fetch chat");
  }
}

/**
 * Gets the full chat document (useful for debugging or admin purposes)
 * @param chatId - The chat's unique identifier
 * @returns Complete chat document or null if not found
 */
export async function fetchFullChatDocument(
  chatId: string
): Promise<UserChat | null> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    const chat = await collection.findOne({ chatId });
    return chat as UserChat | null;
  } catch (error) {
    console.error("Error fetching full chat document:", error);
    throw new Error("Failed to fetch full chat document");
  }
}

/**
 * Deletes a chat (optional utility function)
 * @param chatId - The chat's unique identifier
 * @returns Boolean indicating success
 */
export async function deleteChatByChatId(chatId: string): Promise<boolean> {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    const result = await collection.deleteOne({ chatId });
    return result.deletedCount === 1;
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw new Error("Failed to delete chat");
  }
}

/**
 * Gets chat statistics for research purposes
 * @param userId - Optional: filter by specific user
 * @param problemId - Optional: filter by specific problem
 * @returns Object with various statistics
 */
export async function getChatStatistics(userId?: string, problemId?: string) {
  try {
    const mongoClient = await client.connect();
    const collection = mongoClient
      .db(CHATBOT_DATABASE)
      .collection(USER_CHATS_COLLECTION);

    const matchQuery: any = {};
    if (userId) matchQuery.userId = userId;
    if (problemId) matchQuery.problemId = problemId;

    const stats = await collection
      .aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalChats: { $sum: 1 },
            totalMessages: { $sum: { $size: "$chatMessages" } },
            avgMessagesPerChat: { $avg: { $size: "$chatMessages" } },
            uniqueUsers: { $addToSet: "$userId" },
            uniqueProblems: { $addToSet: "$problemId" },
          },
        },
        {
          $project: {
            _id: 0,
            totalChats: 1,
            totalMessages: 1,
            avgMessagesPerChat: { $round: ["$avgMessagesPerChat", 2] },
            uniqueUserCount: { $size: "$uniqueUsers" },
            uniqueProblemCount: { $size: "$uniqueProblems" },
          },
        },
      ])
      .toArray();

    return (
      stats[0] || {
        totalChats: 0,
        totalMessages: 0,
        avgMessagesPerChat: 0,
        uniqueUserCount: 0,
        uniqueProblemCount: 0,
      }
    );
  } catch (error) {
    console.error("Error getting chat statistics:", error);
    throw new Error("Failed to get chat statistics");
  }
}

// Keep your existing functions
export async function testDatabaseConnection() {
  let isConnected = false;
  try {
    const mongoClient = await client.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    return !isConnected;
  } catch (e) {
    console.error(e);
    return isConnected;
  }
}

export async function getDatabaseCollections() {
  const mongoClient = await client.connect();
  const documents = await mongoClient
    .db("sample_airbnb")
    .collection("listingsAndReviews")
    .find({})
    .limit(10)
    .toArray();

  return documents;
}
