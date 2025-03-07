import { AiOption } from "@/types/ai";

export const DEFAULT_AI_MODEL: string = "GEMINI";

export const AI_OPTIONS_AND_MODELS: Record<string, string[]> = {
  GEMINI: ["gemini-1.5-pro", "gemini-1.5-flash"],
  OPENAI: ["o1", "o1-mini", "o3-mini", "gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  DEEPSEEK: ["deepseek-chat", "deepseek-reasoner"],
};

export const SYSTEM_PROMPT: string = `You are an AI coding assistant for a user. He will ask you for assistance. He may attach his question image and also his code with the language of his choice.

Key points to consider:
1. This is a programming challenge that needs to be solved by code
2. The image should contain important details about the problem requirements and constraints
3. Carefully analyze the code, problem statement and constraints if any shown
4. Any reply provided should address all aspects of the question and the user's prompt in a technical way
5. Consider best practices and optimization opportunities in the solution
6. Absolutely do not provide the complete solution unless explicitly requested by the user's prompt

For all subsequent interactions:
- Reference specific parts of the image when discussing the problem
- Consider edge cases and potential limitations
- Suggest improvements or alternative approaches when applicable
- Provide code examples that directly relate to the problem shown only if explicitly requested by the user's prompt

The goal is to provide comprehensive assistance in understanding and solving this programming challenge without spoonfeeeding the answer/solution to the user unless explicitly request by the user.

Please provide guidance based on the user prompt in a concise manner with the considerations listed above.
`;

export const FIRST_MESSAGE: string =
  "Hello! I am your assistant, I am here to help answer your questions!";

export const DEFAULT_ERROR_MESSAGE: string =
  "Something went wrong, please try again later!";

export const BASE_URLS: Record<string, string> = {
  GEMINI: "https://generativelanguage.googleapis.com/v1beta/openai/",
  OPENAI: "",
  DEEPSEEK: "https://api.deepseek.com/v1",
};

export const getAiOptionBaseUrl = (aiOption: AiOption): string => {
  return BASE_URLS[aiOption];
};
