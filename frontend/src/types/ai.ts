export enum AiOption {
  OpenAi = "OPENAI",
  Gemini = "GEMINI",
  // DeepSeek = "DEEPSEEK",
  Claude = "CLAUDE",
  // Perplexity = "PERPLEXITY",
  Qwen = "QWEN" // https://www.alibabacloud.com/help/en/model-studio/developer-reference/get-api-key
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
  Image = "image_url",
}
