"use client";

import Image from "next/image";
import { SettingForm, SettingFormField } from "@/components/utils/SettingForm";
import { AiOption, KeyStorePref } from "@/types/ai";
import { STORAGE_OPTIONS } from "@/hooks/useAiSettings";
import { displayAiOption } from "@/constants/aiSettings";

interface AiSettingsFormProps {
  aiOption: AiOption;
  apiKey: string;
  storePref: KeyStorePref;
  updateApiKey: (apiKey: string) => void;
  isSaving: boolean;
}

const AiOptionSettingForm = ({
  aiOption,
  apiKey,
  updateApiKey,
  isSaving,
}: AiSettingsFormProps) => {
  const fields: SettingFormField[] = [
    // {
    //   id: "storePref",
    //   label: "",
    //   type: "select",
    //   placeholder: "Select a preference",
    //   value: storePref,
    //   handleUpdate: updateStorePref,
    //   disabled: isSaving,
    //   selectOptions: STORAGE_OPTIONS,
    // },
    {
      id: "apiKey",
      label: "",
      type: "password",
      placeholder: "Your API Key",
      value: apiKey,
      handleUpdate: updateApiKey,
      disabled: isSaving,
    },
  ];

  return (
    <div className="w-full space-y-12 px-4">
      <div className="flex_center gap-16">
        <div className="w-[110px] flex justify-start items-center gap-3">
          <Image
            alt={aiOption.toLowerCase()}
            src={`/companyIcons/${aiOption.toLowerCase()}.svg`}
            height={28}
            width={28}
            className="rounded-full bg-white"
          />
          <span className="text-sm text-center text-muted-foreground">
            {displayAiOption(aiOption)}
          </span>
        </div>

        <SettingForm
          key={`${aiOption}-form-section`}
          fields={fields}
          isSubmitting={isSaving}
          formClassName="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        />
      </div>
    </div>
  );
};

export default AiOptionSettingForm;
