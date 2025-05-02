"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, SettingsIcon, SendIcon } from "lucide-react";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { useApiKey } from "@/providers/ai-provider";
import { AiOption, KeyStorePref } from "@/types/ai";
import {
  AI_OPTIONS_AND_MODELS,
  displayAiOption,
  displayAiModel,
} from "@/constants/aiSettings";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { PasswordInput } from "@/components/utils/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { useAiChat } from "@/hooks/useAiChat";
import { SimpleResponse } from "@/types/global";
import Link from "next/link";
import ChatMessages from "./ChatMessages";
import { useAiSettings } from "@/hooks/useAiSettings";
import { User } from "@supabase/supabase-js";

interface AiChatProps {
  user: User | null;
  questionImage: File | null;
  code: string;
  language: string;
}

const AiChat = ({ user, questionImage, code, language }: AiChatProps) => {
  const userId = user?.id || "";

  const { prePrompt } = useAiSettings(user);

  const {
    defaultAiOption,
    defaultAiModel,
    apiKey,
    saveBasicSettings,
    keyPref,
    isSavingPref,
  } = useApiKey();

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
    userId,
    aiOption: defaultAiOption,
    aiModel: defaultAiModel,
    questionImage,
    code,
    language,
    storePref: keyPref,
    apiKey: apiKey,
    systemPrompt: prePrompt,
  });

  return (
    <div className="flex flex-col h-full w-full gap-2 relative">
      {/* Prompt context flags */}
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

        <div className="flex-1 flex justify-end">
          <AiSettingsModal
            defaultAiModel={defaultAiModel}
            defaultAiOption={defaultAiOption}
            saveBasicSettings={saveBasicSettings}
            keyPref={keyPref}
            isSavingPref={isSavingPref}
          />
        </div>
      </div>

      {/* Chat messages container with proper overflow handling */}
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <ChatMessages aiOption={defaultAiOption} messages={aiChatHistory} />
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

interface AiSettingsModalProps {
  defaultAiOption: AiOption;
  defaultAiModel: string;
  keyPref: KeyStorePref;
  saveBasicSettings: (
    pref: KeyStorePref,
    key: string,
    model: string
  ) => Promise<SimpleResponse>;
  isSavingPref: boolean;
}

const AiSettingsModal = ({
  defaultAiOption,
  defaultAiModel,
  saveBasicSettings,
  keyPref,
  isSavingPref,
}: AiSettingsModalProps) => {
  const { toast } = useToast();

  const [storageOption, setStorageOption] = useState<KeyStorePref>(keyPref);
  const [modelOption, setModelOption] = useState<string>(defaultAiModel);

  useEffect(() => {
    setStorageOption(keyPref);
  }, [keyPref]);

  useEffect(() => {
    setModelOption(defaultAiModel);
  }, [defaultAiModel]);

  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);

      const newApiKey = formData.get("apiKey") as string;

      const success = await saveBasicSettings(
        storageOption,
        newApiKey,
        modelOption
      );
      if (!success) {
        throw new Error("Failed to save storage preference");
      }

      setIsOpen(false);
      toast({ title: "Settings Saved" });
    } catch (error) {
      alert("Failed to save settings");
      console.error("Error saving settings:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="hover:bg-secondary p-2 rounded-md transition-colors">
          <SettingsIcon className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {displayAiOption(defaultAiOption)}'s Settings
          </DialogTitle>
          <span className="text-sm text-muted-foreground">
            Change to another model{" "}
            <Link
              href="/profile/settings"
              className="text-secondary-foreground hover:underline"
            >
              here
            </Link>
            !
          </span>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="model" className="font-semibold px-0.5">
                {displayAiOption(defaultAiOption)} Model:
              </Label>
              <Select
                value={defaultAiModel}
                onValueChange={(value: string) => setModelOption(value)}
              >
                <SelectTrigger className="w-full">
                  {displayAiModel(defaultAiModel)}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {AI_OPTIONS_AND_MODELS[defaultAiOption].map((model, i) => (
                      <SelectItem key={`ai_model-${i}`} value={model}>
                        {displayAiModel(model)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground px-0.5">
                Models may have differing usage cost
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="storage" className="font-semibold px-0.5">
                API Key Store Preference:
              </Label>
              <Select
                value={storageOption}
                defaultValue={keyPref}
                onValueChange={(value: KeyStorePref) =>
                  setStorageOption(value as KeyStorePref)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {storageOption === KeyStorePref.LOCAL
                      ? "Local Storage"
                      : storageOption === KeyStorePref.CLOUD
                      ? "Cloud Storage"
                      : "Select storage option"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={KeyStorePref.LOCAL}>
                      Local Storage
                    </SelectItem>
                    <SelectItem value={KeyStorePref.CLOUD}>
                      Cloud Storage
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground px-0.5">
                {storageOption === KeyStorePref.LOCAL
                  ? "API key will not be stored and cleared after every session."
                  : "API key will be encrypted & stored securely in our database"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="apiKey" className="font-semibold px-0.5">
                {displayAiOption(defaultAiOption)} API Key:
              </Label>
              <PasswordInput
                id="apiKey"
                name="apiKey"
                parentClassName="relative"
                eyeClassName="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
              />
              <p className="text-sm text-muted-foreground px-0.5">
                For security reasons, your API key is{" "}
                <span className="underline">never</span> displayed (& fetched to
                your browser)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                !storageOption ||
                storageOption === KeyStorePref.UNSET ||
                isSavingPref
              }
              className="w-full sm:w-auto"
            >
              {isSavingPref ? (
                <div className="flex_center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AiChat;
