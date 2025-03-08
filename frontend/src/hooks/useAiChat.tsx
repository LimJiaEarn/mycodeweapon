"use client";

import { AiChatMessage, AiOption, AiChatRole, KeyStorePref } from "@/types/ai";
import { useState } from "react";
import { FIRST_MESSAGE } from "@/constants/aiSettings";
import { cloudPromptAi } from "@/actions/prompting";

interface useAiChatProps {
  userId: string;
  questionImage: File | null;
  code: string;
  language: string;
  aiOption: AiOption;
  aiModel: string;
  storePref: KeyStorePref;
  apiKey: string | null;
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
}: useAiChatProps) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isPrompting, setIsPrompting] = useState<boolean>(false);

  const [aiChatHistory, setAiChatHistory] = useState<AiChatMessage[]>([
    { role: AiChatRole.Ai, content: FIRST_MESSAGE },
  ]);

  const [includeCode, setIncludeCode] = useState<boolean>(false);
  const [includeQuestionImg, setIncludeQuestionImg] = useState<boolean>(true);

  const submitPrompt = async () => {
    try {
      setIsPrompting(true);
      const cachedPrompt: string = prompt;
      const chatMessages = [
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
