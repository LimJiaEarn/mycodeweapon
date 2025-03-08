"use server";
import { AiOption, OpenAiInitParams, AiChatMessage } from "@/types/ai";
import { SYSTEM_PROMPT, getAiOptionBaseUrl } from "@/constants/aiSettings";
import { fetchDecryptedApiKey } from "@/app/actions/apiKeys";
import OpenAi from "openai";
import { SimpleDataResponse } from "@/types/global";

interface cloudPromptAiProps {
  userId: string;
  aiOption: AiOption;
  aiModel: string;
  apiKey: string;
  chatMessages: AiChatMessage[];
}

export const cloudPromptAi = async ({
  userId,
  aiOption,
  aiModel,
  apiKey,
  chatMessages,
}: cloudPromptAiProps): Promise<SimpleDataResponse<string>> => {
  try {
    if (!apiKey) {
      const { data } = await fetchDecryptedApiKey(userId, aiOption);
      apiKey = data;
    }

    let aiInitParams: OpenAiInitParams = {
      apiKey,
    };
    if (aiOption !== AiOption.OpenAi) {
      aiInitParams = {
        ...aiInitParams,
        baseURL: getAiOptionBaseUrl(aiOption),
      };
    }
    const openai = new OpenAi(aiInitParams);
    const response = await openai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...chatMessages.slice(1),
      ],
    });

    const reply = response.choices[0].message.content;

    if (!reply) {
      throw new Error("Reply of length 0 received");
    }

    return {
      success: true,
      message: "Successfully received reply",
      data: reply,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to get reply",
      data: "",
    };
  }
};
