"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, SendIcon, ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { AiOption } from "@/types/ai";
import {
  AI_OPTIONS_AND_MODELS,
  displayAiOption,
  displayAiModel,
} from "@/constants/aiSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useAiChat } from "@/hooks/useAiChat";
import ChatMessages from "./ChatMessages";
import { useAiSettings } from "@/hooks/useAiSettings";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ProblemState } from "@/types/problem";

interface AiChatProps {
  user: User | null;
  problemStates: ProblemState;
  code: string;
  language: string;
}

const AiChat = ({ user, problemStates, code, language }: AiChatProps) => {
  const userId = user?.id || "";
  const router = useRouter();

  const {
    prePrompt,
    defaultAiOption,
    defaultAiModel,
    saveAiChatDefaultSettings,
    checkApiKeyStoredInCloud,
  } = useAiSettings(user);

  const { toast } = useToast();

  const [selectedModel, setSelectedModel] = useState<string>(defaultAiModel);
  const [selectedProvider, setSelectedProvider] =
    useState<AiOption>(defaultAiOption);

  useEffect(() => {
    setSelectedModel(defaultAiModel);
    setSelectedProvider(defaultAiOption);
  }, [defaultAiModel, defaultAiOption]);

  const handleModelChange = async (provider: AiOption, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
    const res = await checkApiKeyStoredInCloud(provider);
    if (!res.data) {
      toast({
        title: `${provider} Api Key not set`,
        description: "Please save your API key in profile settings",
        variant: "destructive",
        action: (
          <ToastAction
            altText="set key"
            onClick={() => {
              router.push("/profile/settings#apikeys");
            }}
            className="text-primary"
          >
            Set Key
          </ToastAction>
        ),
      });
    }

    await saveAiChatDefaultSettings(provider, model);
  };

  const {
    aiChatHistory,
    prompt,
    setPrompt,
    isPrompting,
    includeCode,
    setIncludeCode,
    includeQuestionImg,
    setIncludeQuestionImg,
    submitPrompt,
  } = useAiChat({
    problemId: problemStates.id,
    userId,
    aiOption: selectedProvider,
    aiModel: selectedModel,
    questionImage: problemStates.questionImage,
    imageUrl: problemStates.imageUrl,
    code,
    language,
    systemPrompt: prePrompt,
  });

  return (
    <div className="flex flex-col h-full w-full gap-2 relative">
      {/* Prompt context flags and model selector */}
      <div className="flex gap-4 items-center pl-2">
        <p className="text-sm font-semibold pr-1">Chat Contexts:</p>
        <div className="flex items-center gap-2">
          <Checkbox
            id="includeQuesImg"
            checked={includeQuestionImg}
            onCheckedChange={() => setIncludeQuestionImg((prev) => !prev)}
          />
          <Label htmlFor="includeQuesImg" className="text-sm">
            Question Img
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="includeCode"
            checked={includeCode}
            onCheckedChange={() => setIncludeCode((prev) => !prev)}
          />
          <Label htmlFor="includeCode" className="text-sm">
            Code
          </Label>
        </div>

        <div className="flex-1 flex justify-end items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <span className="max-w-[150px] truncate">
                  {displayAiModel(selectedModel)}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 max-h-[300px] overflow-y-auto"
              align="end"
            >
              {Object.entries(AI_OPTIONS_AND_MODELS).map(
                ([provider, models]) => (
                  <div key={provider}>
                    <DropdownMenuLabel>
                      {displayAiOption(provider as AiOption)}
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {models.map((model) => (
                        <DropdownMenuItem
                          key={model}
                          onClick={() =>
                            handleModelChange(provider as AiOption, model)
                          }
                          className={
                            selectedModel === model ? "bg-secondary" : ""
                          }
                        >
                          {displayAiModel(model)}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                  </div>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Modal for API Key Configuration - Removed */}
          {/* <AiSettingsModal
            defaultAiOption={selectedProvider}
            keyPref={keyPref}
            saveApiKey={saveApiKey}
            isSavingPref={isSavingPref}
          /> */}
        </div>
      </div>

      {/* Chat messages container with proper overflow handling */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ChatMessages aiOption={selectedProvider} messages={aiChatHistory} />
      </div>

      <div className="p-4 border-t w-full">
        {isPrompting && (
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              AI brainstorming...
            </span>
          </div>
        )}

        <div className="flex gap-2 items-center w-full">
          <div className="relative flex-1">
            <Textarea
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
              placeholder="Ask a question"
              className="resize-none h-[60px]"
              disabled={isPrompting}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  prompt.trim().length !== 0
                ) {
                  e.preventDefault();
                  submitPrompt();
                }
              }}
            />
          </div>
          <Button
            onClick={submitPrompt}
            disabled={isPrompting || prompt.trim().length === 0}
            className="bg-slate-50 disabled:bg-slate-100 h-[40px]"
          >
            <SendIcon className="h-16 w-16" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
