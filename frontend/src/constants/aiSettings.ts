import { AiOption } from "@/types/ai";

export const AI_OPTIONS_AND_MODELS: Record<AiOption, string[]> = {
  GEMINI: [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-preview-05-06",
  ],
  OPENAI: ["o1", "o1-mini", "o3-mini", "gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  CLAUDE: [
    "claude-3-7-sonnet-20250219",
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  QWEN: [
    // "qwen-turbo-latest",
    // "qwen-plus-latest",
    // "qwen-max-latest",
    // "qvq-max-latest",
    "qwq-plus",
    "qwen-vl-max-latest",
  ],
  // DEEPSEEK: ["deepseek-chat", "deepseek-reasoner"],
  // PERPLEXITY: [
  //   "sonar",
  //   "sonar-pro",
  //   "sonar-reasoning",
  //   "sonar-reasoning-pro",
  //   "sonar-deep-research",
  // ],
};

export const BASE_URLS: Record<AiOption, string> = {
  GEMINI: "https://generativelanguage.googleapis.com/v1beta/openai/",
  OPENAI: "",
  CLAUDE: "https://api.anthropic.com/v1/",
  QWEN: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/",
  // DEEPSEEK: "https://api.deepseek.com/v1",
  // PERPLEXITY: "https://api.perplexity.ai",
};

export const DEFAULT_AI_MODEL: string = "GEMINI";

export const SYSTEM_PROMPT: string = `You are an AI coding assistant for a user working on programming challenges. You may receive questions that may include an image of a programming problem and/or the user's code written in various languages.

## ROLE AND PURPOSE
- Help users understand programming problems
- Guide them toward solutions without providing complete answers unless explicitly requested
- Analyze code and suggest improvements or identify bugs

## RESPONSE FORMAT
Always structure your responses using these sections when applicable:

### PROBLEM ANALYSIS
- Summarize the problem from the image provided in base64
- Identify key requirements, constraints, and edge cases
- Clarify input/output formats

### HINT OR APPROACH
- Provide conceptual guidance without direct solutions
- Suggest algorithmic approaches or data structures
- Offer analogies or simplified examples to illustrate concepts

### CODE REVIEW (if code is provided)
- Identify logical errors or bugs
- Point out inefficiencies or potential optimizations
- Highlight good practices already implemented

### CONSIDERATIONS
- Note important edge cases to handle
- Highlight potential optimizations or trade-offs

## FORMATTING GUIDELINES
- Use markdown for structured, readable responses
- Use \`code blocks\` for small code snippets
- Use larger code blocks with syntax highlighting for multi-line code:
\`\`\`python
# Python code example
\`\`\`
- Use bulleted lists for multiple points
- Use bold text for emphasis on important concepts
- Use blockquotes for hints or tips

## IMPORTANT NOTES
- Adapt your level of help based on the user's questions
- Provide explanations that foster learning rather than just giving answers

Always maintain a helpful, encouraging tone while prioritizing educational value over simply providing answers.`;

export const FIRST_MESSAGE: string =
  "Hello! I am your assistant, I am here to help answer your questions!";

export const DEFAULT_ERROR_MESSAGE: string =
  "Something went wrong, please try again later!";

export const getAiOptionBaseUrl = (aiOption: AiOption): string => {
  return BASE_URLS[aiOption];
};

export const AI_MODELS_DISPLAY = [
  { model: "gemini-2.0-flash-lite", display: "Gemini 2.0 Flash-Lite" },
  { model: "gemini-2.0-flash", display: "Gemini 2.5 Flash" },
  { model: "gemini-2.5-flash-preview-05-20", display: "Gemini 2.5 Flash" },
  { model: "gemini-2.5-pro-preview-05-06", display: "Gemini 2.5 Pro" },
  { model: "o1", display: "GPT o1" },
  { model: "o1-mini", display: "GPT o1-mini" },
  { model: "o3-mini", display: "GPT o3-mini" },
  { model: "gpt-4o", display: "GPT 4o" },
  { model: "gpt-4o-mini", display: "GPT 4o-mini" },
  { model: "gpt-4-turbo", display: "GPT 4-turbo" },
  { model: "deepseek-chat", display: "DeepSeek V3" },
  { model: "deepseek-reasoner", display: "DeepSeek R1" },
  { model: "claude-3-7-sonnet-20250219", display: "Claude 3.7 Sonnet" },
  { model: "claude-3-5-sonnet-20240620", display: "Claude 3.5 Sonnet" },
  { model: "claude-3-opus-20240229", display: "Claude 3 Opus" },
  { model: "claude-3-sonnet-20240229", display: "Claude 3 Sonnet" },
  { model: "claude-3-haiku-20240307", display: "Claude 3 Haiku" },
  { model: "sonar", display: "Sonar" },
  { model: "sonar-pro", display: "Sonar Pro" },
  { model: "sonar-reasoning", display: "Sonar Reasoning" },
  { model: "sonar-reasoning-pro", display: "Sonar Reasoning Pro" },
  { model: "sonar-deep-research", display: "Sonar Deep Research" },
  // { model: "qvq-max-latest", display: "QVQ Max" },
  { model: "qwq-plus", display: "QWQ Plus" },
  { model: "qwen-vl-max-latest", display: "Qwen-VL" },
];

export const displayAiModel = (aiModel: string): string => {
  const display = AI_MODELS_DISPLAY.find((item) => item.model === aiModel);

  return display ? display.display : aiModel;
};

export const displayAiOption = (aiChoice: AiOption): string => {
  switch (aiChoice) {
    case AiOption.Gemini:
      return "Gemini";
    case AiOption.OpenAi:
      return "OpenAI";
    case AiOption.Claude:
      return "Claude";
    case AiOption.Qwen:
      return "Qwen";
    // case AiOption.DeepSeek:
    //   return "DeepSeek";
    // case AiOption.Perplexity:
    //   return "Perplexity";
    default:
      return "";
  }
};
