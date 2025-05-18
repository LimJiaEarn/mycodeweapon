"use client";

import { Button } from "@/components/ui/button";
import { Loader2, SettingsIcon } from "lucide-react";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { AiOption, KeyStorePref } from "@/types/ai";
import { displayAiOption } from "@/constants/aiSettings";
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
import { SimpleResponse } from "@/types/global";

interface AiSettingsModalProps {
  defaultAiOption: AiOption;
  keyPref: KeyStorePref;
  saveApiKey: (
    key: string,
    pref: KeyStorePref,
    aiOption: AiOption
  ) => Promise<SimpleResponse>;
  isSavingPref: boolean;
}

const AiSettingsModal = ({
  defaultAiOption,
  saveApiKey,
  keyPref,
  isSavingPref,
}: AiSettingsModalProps) => {
  const { toast } = useToast();

  const [storageOption, setStorageOption] = useState<KeyStorePref>(keyPref);
  const [selectedProvider, setSelectedProvider] =
    useState<AiOption>(defaultAiOption);

  useEffect(() => {
    setStorageOption(keyPref);
  }, [keyPref]);

  useEffect(() => {
    setSelectedProvider(defaultAiOption);
  }, [defaultAiOption]);

  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);
      const newApiKey = formData.get("apiKey") as string;

      // We're only saving the API key and storage preference here
      // The model selection is handled separately in the dropdown
      const success = await saveApiKey(
        newApiKey,
        storageOption,
        selectedProvider
      );

      if (!success) {
        throw new Error("Failed to save storage preference");
      }

      setIsOpen(false);
      toast({ title: "API Key Settings Saved" });
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
          <DialogTitle>API Key Settings</DialogTitle>
          <span className="text-sm text-muted-foreground">
            Configure your API keys for AI providers
          </span>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="provider" className="font-semibold px-0.5">
                API Provider:
              </Label>
              <Select
                value={selectedProvider}
                onValueChange={(value: AiOption) =>
                  setSelectedProvider(value as AiOption)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{displayAiOption(selectedProvider)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(AiOption).map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {displayAiOption(provider)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                {displayAiOption(selectedProvider)} API Key:
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
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save API Key"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AiSettingsModal;
