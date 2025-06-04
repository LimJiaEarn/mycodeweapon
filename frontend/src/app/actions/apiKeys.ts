"use server";

import { createClient } from "@/lib/supabase/server";
import { encryptKey, decryptKey } from "./encryption";
import { AiOption, KeyStorePref } from "@/types/ai";
import { getAiConfigTable } from "@/constants/supabase";
import { SimpleDataResponse } from "@/types/global";

export async function fetchDecryptedApiKey(
  userId: string,
  aiOption: AiOption
): Promise<SimpleDataResponse<string>> {
  const tableName = getAiConfigTable(aiOption);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tableName)
    .select("apiKey")
    .eq("userId", userId)
    .single();

  if (error) {
    return {
      success: false,
      message: "Error in fetching data from supabase",
      data: "",
    };
  }

  if (data?.apiKey == "") {
    return {
      success: false,
      message: "User did not store api key",
      data: "",
    };
  }
  const decryptedKey: string = await decryptKey(data.apiKey);

  return {
    success: true,
    message: "Successfully retrieved and decrypted key",
    data: decryptedKey,
  };
}

export async function cloudGetApiKey(userId: string, aiOption: AiOption) {
  const supabase = await createClient();
  const aiOptionTable = getAiConfigTable(aiOption);

  const { data, error } = await supabase
    .from(aiOptionTable)
    .select("apiKey, updated_at")
    .eq("userId", userId)
    .single();

  if (error) {
    return { success: false, error, lastUpdated: null };
  }

  return { success: true, error: null, data };
}

export async function cloudCheckApiKey(userId: string, aiOption: AiOption) {
  const response = await cloudGetApiKey(userId, aiOption);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      exist: false,
      lastUpdated: null,
    };
  }

  // console.log("[cloudCheckApiKey] response:");
  // console.log(response);

  if (!response.data?.apiKey) {
    return { success: true, error: null, exist: false, lastUpdated: null };
  }

  return {
    success: true,
    error: null,
    exist: true,
    lastUpdated: response.data?.updated_at,
  };
}

export async function cloudStoreApiKey(
  userId: string,
  key: string,
  tableName: string
) {
  try {
    const supabase = await createClient();

    const encryptedKey = await encryptKey(key);

    // upsert encrypted key to userkeys table
    const { error: upsertErr } = await supabase.from(tableName).upsert({
      userId,
      apiKey: encryptedKey,
      storePref: KeyStorePref.CLOUD,
    });

    if (upsertErr) {
      throw upsertErr;
    }
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}
