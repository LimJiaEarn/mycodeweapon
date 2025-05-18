"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-provider";
import { AI_CONFIG_TABLE } from "@/constants/supabase";
import { useAiSettings } from "@/hooks/useAiSettings";
import { SimpleResponse } from "@/types/global";
import { AiOption, KeyStorePref } from "@/types/ai";

interface ApiKeyContextType {
  prePrompt: string;
  defaultAiOption: AiOption;
  defaultAiModel: string;
  keyPref: KeyStorePref;
  apiKey: string | null;
  saveBasicSettings: (
    pref: KeyStorePref,
    key: string,
    aiOption: AiOption,
    model: string
  ) => Promise<SimpleResponse>;
  isSavingPref: boolean;
}

const ApiKeyContext = createContext<ApiKeyContextType>({
  prePrompt: "",
  defaultAiOption: AiOption.Gemini,
  defaultAiModel: "",
  keyPref: KeyStorePref.UNSET,
  apiKey: null,
  saveBasicSettings: async (
    pref: KeyStorePref,
    key: string,
    model: string
  ) => ({
    success: false,
    message: "",
  }),
  isSavingPref: false,
});

export function AiProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const {
    prePrompt,
    defaultAiOption,
    defaultAiModel,
    getApiKeyStorePref,
    saveApiKey,
    saveAiOptionDefaultModel,
    saveAiChatDefaultSettings,
  } = useAiSettings(user);

  const [keyPref, setKeyPref] = useState<KeyStorePref>(KeyStorePref.UNSET);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      const supabase = createClient();

      // fetch user ai pref
      const { data: aiConfig, error: aiConfigError } = await supabase
        .from(AI_CONFIG_TABLE)
        .select("prePrompt, defaultAiOption, defaultAiModel")
        .eq("userId", user.id)
        .single();

      // set pref based on user's selection
      const { storePref } =
        (await getApiKeyStorePref(aiConfig?.defaultAiOption)) ||
        KeyStorePref.UNSET;

      setKeyPref(storePref);
    };

    init();
  }, [user]);

  const [isSavingPref, setIsSavingPref] = useState<boolean>(false);

  const saveBasicSettings = async (
    pref: KeyStorePref,
    key: string,
    aiOption: AiOption,
    model: string
  ): Promise<SimpleResponse> => {
    if (!user) return { success: false, message: "Auth Error" };

    setIsSavingPref(true);
    setKeyPref(pref);

    if (pref === KeyStorePref.LOCAL) {
      setApiKey(key);
    }
    try {
      const { success: update1Success, message: msg1 } = await saveApiKey(
        key,
        pref,
        aiOption
      );
      if (!update1Success) {
        throw Error("Error in saving api key");
      }

      // update ai_config table
      const { success: update2Success, message: msg2 } =
        await saveAiChatDefaultSettings(defaultAiOption, model);
      if (!update2Success) {
        throw Error("Error in updating ai_configs table");
      }

      // update {aimodel}_config table
      const { success: update3Success, message: msg3 } =
        await saveAiOptionDefaultModel(model, AiOption.Gemini);
      if (!update3Success) {
        throw Error("Error in updating {aiopton}_config table");
      }
    } catch (error) {
      return {
        success: false,
        message: "Something went wrong",
      };
    } finally {
      setIsSavingPref(false);
    }

    return {
      success: true,
      message: "Successfully Updated!",
    };
  };

  return (
    <ApiKeyContext.Provider
      value={{
        prePrompt,
        defaultAiOption,
        defaultAiModel,
        apiKey,
        keyPref,
        saveBasicSettings,
        isSavingPref,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);

  if (!context) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }

  return context;
}
