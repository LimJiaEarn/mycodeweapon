"use client";

import { AiOption } from "@/types/ai";
import {
  AI_OPTIONS_AND_MODELS,
  displayAiOption,
  displayAiModel,
  SYSTEM_PROMPT,
} from "@/constants/aiSettings";
import { SettingForm, SettingFormField } from "@/components/utils/SettingForm";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface AiConfigSettingFormProps {
  prePrompt: string;
  defaultAiOption: AiOption;
  defaultAiModel: string;
  updatePrePrompt: (val: string) => void;
  updateDefaultAiOption: (val: AiOption) => void;
  updateDefaultAiModel: (val: string) => void;
  isSaving: boolean;
}

const AiConfigSettingForm = ({
  prePrompt,
  defaultAiOption,
  defaultAiModel,
  updatePrePrompt,
  updateDefaultAiOption,
  updateDefaultAiModel,
  isSaving,
}: AiConfigSettingFormProps) => {
  const aiOptionSelections = Object.values(AiOption).map((opt) => ({
    value: opt,
    label: displayAiOption(opt),
  }));

  const aiModelSelections = AI_OPTIONS_AND_MODELS[defaultAiOption].map(
    (mod) => ({
      value: mod,
      label: displayAiModel(mod),
    })
  );

  const handleAiOptionUpdate = (val: any) => {
    updateDefaultAiOption(val);
    updateDefaultAiModel("");
  };

  const fields: SettingFormField[] = [
    {
      id: "aiOptions",
      label: "Default AI",
      type: "select",
      placeholder: "",
      value: displayAiOption(defaultAiOption),
      handleUpdate: handleAiOptionUpdate,
      disabled: isSaving,
      selectOptions: aiOptionSelections,
    },
    {
      id: "aiModel",
      label: "Default Model",
      type: "select",
      placeholder: "Select AI Model",
      value: defaultAiModel,
      displayValue: displayAiModel,
      handleUpdate: updateDefaultAiModel,
      disabled: isSaving,
      selectOptions: aiModelSelections,
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full">
      <SettingForm
        fields={fields}
        isSubmitting={isSaving}
        formClassName="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      />

      <div className="w-full">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <Label htmlFor="preprompt" className="text-sm font-semibold">
                System Prompt
              </Label>
              <p className="text-sm text-muted-foreground mt-1 max-w-[500px]">
                This sets the tone and output of LLM model for your
                conversations. The default has been fine tuned for optimal
                performance and experience. We discourage major edits especially
                to response format section
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updatePrePrompt(SYSTEM_PROMPT)}
              disabled={isSaving}
              className="h-8 px-3 flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Default</span>
            </Button>
          </div>
          <Textarea
            id="preprompt"
            value={prePrompt}
            onChange={(e) => updatePrePrompt(e.target.value)}
            className="min-h-[250px] w-full resize-y font-mono text-sm"
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  );
};

export default AiConfigSettingForm;
