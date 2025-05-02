"use client";

import { AiChatMessage, AiOption, AiChatRole, KeyStorePref } from "@/types/ai";
import { useState, useEffect } from "react";
import { FIRST_MESSAGE } from "@/constants/aiSettings";
import { cloudPromptAi } from "@/actions/prompting";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface useAiChatProps {
  userId: string;
  questionImage: File | null;
  code: string;
  language: string;
  aiOption: AiOption;
  aiModel: string;
  storePref: KeyStorePref;
  apiKey: string | null;
  systemPrompt: string;
}

export interface promptAiParams {
  aiModel: string;
  prompt: string;
  chatHistory: string[];
  includeCode: boolean;
  includeQuestionImg: boolean;
}

export const useAiChat = ({
  userId,
  questionImage,
  code,
  language,
  aiOption,
  aiModel,
  storePref,
  apiKey,
  systemPrompt,
}: useAiChatProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isPrompting, setIsPrompting] = useState<boolean>(false);

  const [aiChatHistory, setAiChatHistory] = useState<
    ChatCompletionMessageParam[]
  >([{ role: AiChatRole.Ai, content: FIRST_MESSAGE }]);

  const [includeCode, setIncludeCode] = useState<boolean>(true);
  const [includeQuestionImg, setIncludeQuestionImg] = useState<boolean>(true);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  useEffect(() => {
    const convertImageToBase64 = async () => {
      if (!questionImage || !includeQuestionImg) {
        setImageBase64(null);
        return;
      }

      try {
        const reader = new FileReader();

        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            let result = reader.result as string;
            const cleanBase64 = result
              .replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
              .trim();

            resolve(cleanBase64);
          };
          reader.onerror = reject;
        });

        reader.readAsDataURL(questionImage);
        const base64Data = await base64Promise;
        setImageBase64(base64Data);
      } catch (err) {
        console.error("[useAiChat] Image Conversion Error:", err);
        setImageBase64(null);
      }
    };

    convertImageToBase64();
  }, [questionImage, includeQuestionImg]);

  const submitPrompt = async () => {
    try {
      setIsPrompting(true);
      const cachedPrompt: string = prompt;
      const chatMessages: ChatCompletionMessageParam[] = [
        ...aiChatHistory,
        {
          role: AiChatRole.User,
          content: cachedPrompt,
        },
      ];
      setAiChatHistory((prev) => [
        ...prev,
        {
          role: AiChatRole.User,
          content: cachedPrompt,
        },
      ]);
      setPrompt("");

      if (storePref === KeyStorePref.LOCAL) {
        apiKey = localStorage.getItem(`${aiOption}-key`);
      }

      if (!apiKey && storePref !== KeyStorePref.CLOUD) {
        throw new Error("No API Key set");
      }

      const {
        success,
        message,
        data: reply,
      } = await cloudPromptAi({
        userId,
        aiOption,
        aiModel,
        apiKey: apiKey || "",
        chatMessages,
        codeContext: includeCode ? { code, language } : null,
        imageBase64: includeQuestionImg ? imageBase64 : null,
        system_prompt: systemPrompt,
      });

      if (!success) throw new Error(message);

      setAiChatHistory((prev) => [
        ...prev,
        {
          role: AiChatRole.Ai,
          content: reply,
        },
      ]);
    } catch (err) {
      console.log("[submitPrompt] error: ", err);
      setAiChatHistory((prev) => [
        ...prev,
        {
          role: AiChatRole.Ai,
          content: "Sorry I am busy at the moment, please try again later!",
        },
      ]);
    } finally {
      setIsPrompting(false);
    }
  };

  return {
    aiChatHistory,
    prompt,
    includeCode,
    setIncludeCode,
    includeQuestionImg,
    setIncludeQuestionImg,
    setPrompt,
    isPrompting,
    submitPrompt,
  };
};
