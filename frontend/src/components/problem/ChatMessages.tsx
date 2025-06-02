"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiChatRole, AiOption } from "@/types/ai";
import { displayAiOption } from "@/constants/aiSettings";
import ReactMarkdown from "react-markdown";
import { Code, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface ChatMessagesProps {
  aiOption: AiOption;
  messages: ChatCompletionMessageParam[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ aiOption, messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { theme } = useTheme();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to clean message text and handle different content types
  const processMessageContent = (message: ChatCompletionMessageParam) => {
    // Handle different types of content (string or multimodal array)
    if (typeof message.content === "string") {
      return message.content.replace(/\\n/g, "\n").trim();
    }

    // For future multimodal output support
    return message.content;
  };

  const [copied, setCopied] = useState<boolean>(false);
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <ScrollArea className="h-full w-full pr-4">
      <div className="space-y-4 p-4 w-full">
        {messages.map((message, index) => {
          const isAi = message.role === AiChatRole.Ai;
          const content = processMessageContent(message);

          return (
            <motion.div
              key={`aichat-${index}`}
              className={cn(
                "flex w-full",
                isAi ? "justify-start" : "justify-end"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 rounded-lg break-words",
                  isAi
                    ? "bg-blue-200/30 dark:bg-blue-900/30 text-foreground rounded-tl-none border border-blue-300 dark:border-blue-800"
                    : "bg-green-200/30 dark:bg-green-900/30 text-foreground rounded-br-none border border-green-300 dark:border-green-800"
                )}
              >
                <div className="flex items-center gap-2 mb-1 text-xs font-medium">
                  {isAi ? (
                    <span className="text-blue-700 dark:text-blue-400">
                      {displayAiOption(aiOption)}
                    </span>
                  ) : (
                    <span className="text-green-700 dark:text-green-400">
                      You
                    </span>
                  )}
                </div>

                {/* Message content */}
                <ReactMarkdown
                  className={cn(
                    "prose prose-sm max-w-none break-words dark:prose-invert",
                    "prose-headings:font-semibold prose-headings:text-foreground",
                    "prose-p:my-1 prose-p:text-current",
                    "prose-a:text-blue-600 dark:prose-a:text-blue-400",
                    "prose-code:text-foreground",
                    "prose-ol:my-2 prose-ul:my-2",
                    "prose-li:my-0.5",
                    "prose-blockquote:border-l-2 prose-blockquote:border-muted-foreground prose-blockquote:pl-4 prose-blockquote:italic"
                  )}
                  components={{
                    // Code block with syntax highlighting
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      // Clean the code content - remove backticks when displayed
                      const codeContent = String(children).replace(/\n$/, "");

                      // Handle special case for pseudocode which might not have a language tag
                      const isPseudocode =
                        !inline &&
                        (language === "pseudocode" ||
                          (!language &&
                            codeContent.includes("function") &&
                            codeContent.includes("return")));

                      return !inline && (match || isPseudocode) ? (
                        <div className="rounded-md overflow-hidden my-3 border border-border">
                          {/* Language label */}
                          <div className="flex justify-between items-center gap-1 px-2 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 border-b border-border">
                            <div className="flex_center gap-2">
                              <Code size={16} />
                              <span>{language || "pseudocode"}</span>
                            </div>
                            <div className="flex justify-end items-center">
                              <Button
                                variant="ghost"
                                onClick={() => handleCopyCode(codeContent)}
                                className="m-0 p-1 h-4 w-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                size="sm"
                              >
                                {copied ? (
                                  <Check
                                    size={11}
                                    className="text-green-400 border rounded-full border-green-300 p-0.5"
                                  />
                                ) : (
                                  <Copy size={6} />
                                )}
                              </Button>
                            </div>
                          </div>
                          <SyntaxHighlighter
                            language={language}
                            style={theme === "dark" ? vscDarkPlus : oneLight}
                            customStyle={{
                              margin: 0,
                              borderRadius: 0,
                              fontSize: "0.875rem",
                              padding: "1rem",
                              lineHeight: 1.5,
                              maxWidth: "100%", // Limit code block width
                              overflowX: "auto", // Allow horizontal scrolling within code blocks
                            }}
                            wrapLines={true}
                            wrapLongLines={true}
                            {...props}
                          >
                            {codeContent}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <span
                          className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-800/30 font-mono text-sm inline-block"
                          {...props}
                        >
                          {codeContent.replace(/`/g, "")}
                        </span>
                      );
                    },
                    // Custom pre renderer (needed for compatibility with ReactMarkdown)
                    pre({ children }) {
                      return <>{children}</>;
                    },
                    // Style headings
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold my-3 pb-1 border-b">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold my-2 pb-0.5">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold my-2">{children}</h3>
                    ),
                    // Style blockquotes for hints/tips
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-2 bg-blue-50/30 dark:bg-blue-900/20 rounded-r-md">
                        {children}
                      </blockquote>
                    ),
                    // Style lists
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 my-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 my-2 space-y-1">
                        {children}
                      </ol>
                    ),
                  }}
                >
                  {typeof content === "string" ? content : ""}
                </ReactMarkdown>
              </div>
            </motion.div>
          );
        })}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
