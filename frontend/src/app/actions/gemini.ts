"use server";

import { createClient } from "@/lib/supabase/server";
import { encryptKey, decryptKey } from "./encryption";
import { KeyStorePref } from "@/providers/apikey-provider";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_CONFIG_TABLE } from "@/constants/supabase";

export async function cloudGetGeminiKey(userId: string) {
  console.log("[cloudGetGeminiKey]");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(GEMINI_CONFIG_TABLE)
    .select("*")
    .eq("userId", userId)
    .single();

  if (error) {
    return { success: false, error, lastUpdated: null };
  }

  return { success: true, error: null, data };
}

export async function cloudCheckGeminiKey(userId: string) {
  console.log("[cloudCheckGeminiKey]");

  const response = await cloudGetGeminiKey(userId);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      exist: false,
      lastUpdated: null,
    };
  }

  if (!response.data.gemini_api_key) {
    return { success: true, error: null, exist: false, lastUpdated: null };
  }

  return {
    success: true,
    error: null,
    exist: true,
    lastUpdated: response.data?.updated_at,
  };
}

export async function cloudStoreGeminiKey(userId: string, key: string) {
  try {
    const supabase = await createClient();

    const encryptedKey = await encryptKey(key);

    // upsert encrypted key to userkeys table
    const { error: upsertErr } = await supabase
      .from(GEMINI_CONFIG_TABLE)
      .upsert({
        userId,
        apiKey: encryptedKey,
        storePref: KeyStorePref.CLOUD,
      })
      .select()
      .single();

    if (upsertErr) throw upsertErr;

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function cloudPromptGemini(
  userId: string,
  prompt: string,
  context?: string,
  chatHistory?: string[],
  questionImage?: any
) {
  console.log("[cloudPromptGemini]");

  try {
    const keyFetchResponse = await cloudGetGeminiKey(userId);

    if (!keyFetchResponse.success || !keyFetchResponse.data) {
      throw new Error("Unable to fetch API key");
    }

    const encryptedKey = keyFetchResponse.data.gemini_api_key;
    if (!encryptedKey) {
      throw new Error("No API key found");
    }

    const decryptedKey = await decryptKey(encryptedKey);

    const genAI = new GoogleGenerativeAI(decryptedKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const processedHistory =
      chatHistory?.slice(1).map((m, i) => ({
        role: i % 2 === 0 ? "user" : "model",
        parts: [{ text: m }],
      })) || [];

    const chat = model.startChat({
      history: processedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    let result;
    if (questionImage) {
      result = await chat.sendMessage([
        {
          inlineData: {
            data: questionImage.data,
            mimeType: questionImage.type,
          },
        },
        {
          text: context ? `${context}\n\n${prompt}` : prompt,
        },
      ]);
    } else {
      result = await chat.sendMessage(
        context ? `${context}\n\n${prompt}` : prompt
      );
    }

    return result.response.text();
  } catch (error) {
    console.error("Error with Gemini request:", error);
    throw error;
  }
}
