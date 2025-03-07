export enum AiOption {
  OpenAi = "OPENAI",
  Gemini = "GEMINI",
  DeepSeek = "DEEPSEEK",
  // Claude = "CLAUDE",
}

export enum KeyStorePref {
  UNSET = "UNSET",
  LOCAL = "LOCAL",
  CLOUD = "CLOUD",
}

export interface OpenAiInitParams {
  apiKey: string;
  baseURL?: string;
}

export enum AiChatRole {
  System = "system",
  User = "user",
  Ai = "assistant",
}

export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};
