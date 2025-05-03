"use server";
import {
  AiOption,
  OpenAiInitParams,
  AiChatMessage,
  AiChatRole,
} from "@/types/ai";
import { getAiOptionBaseUrl } from "@/constants/aiSettings";
import { fetchDecryptedApiKey } from "@/app/actions/apiKeys";
import OpenAi from "openai";
import { SimpleDataResponse } from "@/types/global";
import {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
} from "openai/resources/index.mjs";

interface userCode {
  code: string;
  language: string;
}

interface cloudPromptAiProps {
  userId: string;
  aiOption: AiOption;
  aiModel: string;
  apiKey: string;
  chatMessages: ChatCompletionMessageParam[];
  codeContext: userCode | null;
  imageBase64: string | null;
  system_prompt: string;
}

export const cloudPromptAi = async ({
  userId,
  aiOption,
  aiModel,
  apiKey,
  chatMessages,
  codeContext,
  imageBase64,
  system_prompt,
}: cloudPromptAiProps): Promise<SimpleDataResponse<string>> => {
  try {
    if (!apiKey) {
      const { data } = await fetchDecryptedApiKey(userId, aiOption);
      apiKey = data;
    }

    // Prepare messages array with system prompt
    const systemMessage = [system_prompt];

    const contextContent: ChatCompletionMessageParam = {
      role: AiChatRole.User,
      content: [
        {
          type: "text",
          text: "Attached are my question image and code (if none received, ignore this message).",
        },
      ],
    };

    // Attach the image if it's the first user message
    if (imageBase64) {
      (contextContent.content as ChatCompletionContentPart[]).push({
        type: "image_url",
        image_url: { url: `data:image/png;base64,${imageBase64}` },
      });
    }

    // Attach the code snippet correctly
    if (codeContext) {
      (contextContent.content as ChatCompletionContentPart[]).push({
        type: "text",
        text: `This is my code:\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``,
      });
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: AiChatRole.System, content: systemMessage.join("\n\n\n") },
      ...chatMessages.slice(1),
    ];

    if (imageBase64 || codeContext) {
      messages.push(contextContent);
    }

    const llmClient = new OpenAi({
      apiKey,
      baseURL: getAiOptionBaseUrl(aiOption),
    });

    // Add request details for debugging
    console.log(`Sending request to ${aiOption} with model ${aiModel}`);
    
    const response = await llmClient.chat.completions.create({
      model: aiModel,
      messages,
    });

    console.log("Response received:", {
      status: "success",
      model: response.model,
      usage: response.usage,
      choices_length: response.choices.length,
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
  } catch (error: any) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message || "Unknown error",
      type: error.type || "Unknown type",
      code: error.code || "Unknown code",
      param: error.param,
      statusCode: error.status || error.statusCode,
    };
    
    console.error("LLM API Error:", errorDetails);
    
    return {
      success: false,
      message: `Failed to get reply: ${errorDetails.message}`,
      data: JSON.stringify(errorDetails, null, 2),
    };
  }
};
