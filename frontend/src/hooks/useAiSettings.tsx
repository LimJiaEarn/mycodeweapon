"use client";

import { AiOption, KeyStorePref } from "@/types/ai";
import { AI_CONFIG_TABLE, getAiConfigTable } from "@/constants/supabase";
import {
  SYSTEM_PROMPT,
  AI_OPTIONS_AND_MODELS,
  displayAiOption,
} from "@/constants/aiSettings";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { cloudStoreApiKey } from "@/app/actions/apiKeys";
import { SimpleResponse } from "@/types/global";

interface AiConfigDetails {
  storePref: KeyStorePref;
  defaultModel: string;
  apiKey: string;
}

export const STORAGE_OPTIONS = [
  { label: "Local Storage", value: KeyStorePref.LOCAL },
  { label: "Cloud Storage", value: KeyStorePref.CLOUD },
];

export const useAiSettings = (user: User | null) => {
  const [prePrompt, setPrePrompt] = useState<string>("");
  const [defaultAiOption, setDefaultAiOption] = useState<AiOption>(
    AiOption.Gemini
  );
  const [defaultAiModel, setDefaultAiModel] = useState<string>(
    AI_OPTIONS_AND_MODELS[AiOption.Gemini][0]
  );

  const [AiOptionConfigDetails, setAiOptionConfigDetails] = useState<
    Record<AiOption, AiConfigDetails>
  >(
    Object.values(AiOption).reduce((acc, option) => {
      return {
        ...acc,
        [option]: {
          storePref: KeyStorePref.UNSET,
          defaultModel: AI_OPTIONS_AND_MODELS[option][0],
          apiKey: "",
        },
      };
    }, {} as Record<AiOption, AiConfigDetails>)
  );

  const [isSavingAiSettings, setIsSavingAiSettings] = useState<boolean>(false);

  useEffect(() => {
    const retrieveApiDetails = async () => {
      if (!user) return;

      const supabase = createClient();
      const userId = user.id;

      // fetch ai_configs
      const { data: aiConfig, error: aiConfigError } = await supabase
        .from(AI_CONFIG_TABLE)
        .select("prePrompt, defaultAiOption, defaultAiModel")
        .eq("userId", userId)
        .single();

      if (!aiConfigError) {
        setPrePrompt(aiConfig?.prePrompt || SYSTEM_PROMPT);
        setDefaultAiOption(aiConfig?.defaultAiOption || AiOption.Gemini);
        setDefaultAiModel(
          aiConfig?.defaultAiModel || AI_OPTIONS_AND_MODELS[AiOption.Gemini][0]
        );
      } else {
        // Insert default values if no config exists, happens for new user
        console.log(
          "[retrieveApiDetails] No AI config found, creating default config"
        );
        const { error: insertError } = await supabase
          .from(AI_CONFIG_TABLE)
          .insert({
            userId,
            prePrompt: SYSTEM_PROMPT,
            defaultAiOption: AiOption.Gemini,
            defaultAiModel: AI_OPTIONS_AND_MODELS[AiOption.Gemini][0],
          });

        if (insertError) {
          console.log(
            "[retrieveApiDetails] Error creating default AI config:",
            insertError
          );
        } else {
          // Set state with default values
          setPrePrompt(SYSTEM_PROMPT);
          setDefaultAiOption(AiOption.Gemini);
          setDefaultAiModel(AI_OPTIONS_AND_MODELS[AiOption.Gemini][0]);
        }
      }

      // fetch every aiOption_config from all tables
      try {
        const allAiOptions: AiOption[] = Object.values(AiOption);

        const allFetchPromises = allAiOptions.map(async (option) => {
          try {
            const config = await getApiKeyStorePref(option);
            return { option, config };
          } catch (err) {
            console.log(
              `[retrieveApiDetails] error in fetching from ${option}_config table`
            );
            return {
              option,
              config: {
                storePref: KeyStorePref.UNSET,
                defaultModel: AI_OPTIONS_AND_MODELS[option][0],
                apiKey: "",
              },
            };
          }
        });

        const allFetchedPromises = await Promise.all(allFetchPromises);
        const latestAiOptionConfigDetails = { ...AiOptionConfigDetails };

        allFetchedPromises.forEach((details) => {
          latestAiOptionConfigDetails[details.option] = details.config;
        });

        setAiOptionConfigDetails(latestAiOptionConfigDetails);
      } catch (err) {
        console.log("Error fetching AI configs");
      }
    };

    retrieveApiDetails();
  }, [user]);

  const getApiKeyStorePref = async (
    aiChoice: AiOption
  ): Promise<AiConfigDetails> => {
    const tableName = getAiConfigTable(aiChoice);
    if (!user || !tableName)
      return { storePref: KeyStorePref.UNSET, defaultModel: "", apiKey: "" };

    const supabase = createClient();

    const { data, error } = await supabase
      .from(tableName)
      .select("storePref, defaultModel")
      .eq("userId", user.id)
      .single();

    if (error) {
      return { storePref: KeyStorePref.UNSET, defaultModel: "", apiKey: "" };
    }

    return {
      storePref: data.storePref,
      defaultModel: data.defaultModel,
      apiKey: "",
    };
  };

  const saveApiKey = async (
    apiKey: string,
    storePref: KeyStorePref,
    aiChoice: AiOption
  ): Promise<SimpleResponse> => {
    if (!user) return { success: false, message: "Auth Error" };

    const tableName: string = getAiConfigTable(aiChoice);

    if (!tableName)
      return { success: false, message: "Unsupported AI Model Chosen" };

    const supabase = createClient();
    const userId = user.id;

    try {
      // store in cloud so we send it for encryption
      if (storePref === KeyStorePref.CLOUD && apiKey.length > 0) {
        console.log(`[saveApiKey] saving in CLOUD for ${aiChoice}`);
        const { error } = await cloudStoreApiKey(userId, apiKey, tableName);
        if (error) throw error;
      } else if (storePref === KeyStorePref.LOCAL && apiKey.length > 0) {
        // store in local storage
        localStorage.setItem(`${aiChoice}-key`, apiKey);

        // delete prev stored key if exist but not default ai model
        const { error } = await supabase.from(tableName).upsert({
          userId,
          apiKey: "",
        });
        if (error) throw error;
      }
    } catch (error) {
      console.log("[useAiSettings] updateApiKey error:");
      console.error(error);
      return { success: false, message: "Backend Error" };
    }

    return { success: true, message: "API Key updated!" };
  };

  const saveAiOptionDefaultModel = async (
    defaultModel: string,
    aiChoice: AiOption
  ): Promise<SimpleResponse> => {
    if (!user) return { success: false, message: "Auth Error" };

    const tableName = getAiConfigTable(aiChoice);
    if (!tableName)
      return { success: false, message: "Unsupported AI Model Chosen" };

    const supabase = createClient();

    const { error } = await supabase
      .from(tableName)
      .upsert({ userId: user.id, defaultModel });

    if (error) {
      console.log("[useAiSettings] updateDefaultModel error:");
      console.error(error);
      return { success: false, message: "Backend Error" };
    }

    return {
      success: true,
      message: `Default Model: ${defaultModel} Updated!`,
    };
  };

  const setApiKeyByAiOption = (aiOption: AiOption, apiKey: string): void => {
    setAiOptionConfigDetails((prev) => ({
      ...prev,
      [aiOption]: {
        ...prev[aiOption],
        apiKey,
      },
    }));
  };

  const setStorePrefByAiOption = (
    aiOption: AiOption,
    storePref: string
  ): void => {
    setAiOptionConfigDetails((prev) => ({
      ...prev,
      [aiOption]: {
        ...prev[aiOption],
        storePref,
      },
    }));
  };

  // TODO: add save key
  const saveAiChatDefaultSettings = async (
    defaultAiOption: AiOption,
    defaultAiModel: string
  ): Promise<SimpleResponse> => {
    if (!user) return { success: false, message: "Auth Error" };

    const supabase = createClient();

    const { error } = await supabase
      .from(AI_CONFIG_TABLE)
      .upsert({ userId: user.id, defaultAiOption, defaultAiModel });

    if (error) {
      console.log("[useAiSettings] updateDefaultModel error:");
      console.error(error);
      return { success: false, message: "Backend Error" };
    }

    return {
      success: true,
      message: "Settings Updated!",
    };
  };

  // used in /profile/settings
  const saveAiSettings = async (): Promise<SimpleResponse> => {
    if (!user) return { success: false, message: "Auth Error" };
    setIsSavingAiSettings(true);

    try {
      const supabase = createClient();

      // update in ai_configs
      const { error } = await supabase.from(AI_CONFIG_TABLE).upsert({
        userId: user.id,
        defaultAiOption,
        defaultAiModel,
        prePrompt,
      });
      if (error) throw error;

      // update in all aiOption_config
      // todo: implement local storage for keystorepref.local
      const allAiOptions: AiOption[] = Object.values(AiOption);

      const allSavePromises = allAiOptions.map(
        async (option): Promise<SimpleResponse> => {
          const tableName = getAiConfigTable(option);

          const { error } = await supabase.from(tableName).upsert({
            userId: user.id,
            defaultModel: AiOptionConfigDetails[option]?.defaultModel || "",
            storePref: AiOptionConfigDetails[option]?.storePref || "",
          });

          await saveApiKey(
            AiOptionConfigDetails[option]?.apiKey || "",
            AiOptionConfigDetails[option]?.storePref || KeyStorePref.LOCAL,
            option
          );

          if (error) {
            console.log(error);
            return {
              success: false,
              message: `Error in updating ${displayAiOption(option)} settings`,
            };
          }

          return {
            success: true,
            message: `Successful in updating ${displayAiOption(
              option
            )} settings`,
          };
        }
      );

      const allFetchedPromises = await Promise.all(allSavePromises);

      allFetchedPromises.forEach((res) => {
        if (!res.success) {
          throw new Error(res.message);
        }
      });
    } catch (error) {
      return { success: false, message: "Error saving AI configs" };
    } finally {
      setIsSavingAiSettings(false);
    }

    return { success: true, message: "Successfully saved AI settings!" };
  };

  return {
    prePrompt,
    defaultAiOption,
    defaultAiModel,
    AiOptionConfigDetails,

    getApiKeyStorePref,
    saveApiKey,
    saveAiOptionDefaultModel,
    saveAiChatDefaultSettings,

    setPrePrompt,
    setDefaultAiOption,
    setDefaultAiModel,

    setApiKeyByAiOption,
    setStorePrefByAiOption,

    saveAiSettings,
    isSavingAiSettings,
  };
};
