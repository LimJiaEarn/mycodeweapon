"use client";

import { Separator } from "@/components/ui/separator";
import ProfileSettingsForm from "@/components/forms/ProfileSettingForm";
import AiConfigSettingForm from "@/components/forms/AiConfigSettingForm";
import AiOptionSettingForm from "@/components/forms/AiOptionSettingForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth-provider";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import { useAiSettings } from "@/hooks/useAiSettings";
import { AiOption, KeyStorePref } from "@/types/ai";

const SettingsContent = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // profile handlers
  const {
    profileState,
    saveProfileSettings,
    updateUsername,
    updateEmail,
    updatePassword,
    isSavingProfile,
  } = useProfileSettings(user);

  // api key handlers
  const {
    defaultAiOption,
    defaultAiModel,
    prePrompt,
    AiOptionConfigDetails,
    setPrePrompt,
    setDefaultAiOption,
    setDefaultAiModel,

    setApiKeyByAiOption,

    isSavingAiSettings,
    saveAiSettings,
  } = useAiSettings(user);

  const handleSaveAllSettings = async () => {
    const allSavePromises = [saveProfileSettings(), saveAiSettings()];

    const allSaveResponses = await Promise.all(allSavePromises);

    let errorFlag = false;
    allSaveResponses.forEach((res) => {
      if (!res.success) {
        errorFlag = true;
      }
    });

    if (errorFlag) {
      toast({ title: "Something went wrong!" });
    } else {
      toast({ title: "Profile settings saved!" });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-start gap-16">
      <div
        id="profilesettings"
        className="flex flex-col justify-center items-start gap-2 w-full pt-4"
      >
        <h2 className="text-lg font-bold">Profile Settings</h2>
        <Separator className="w-[90%] mb-2" />
        <ProfileSettingsForm
          username={profileState.username}
          updateUsername={updateUsername}
          email={profileState.email}
          updateEmail={updateEmail}
          password={profileState.password}
          updatePassword={updatePassword}
          isSaving={isSavingProfile || isSavingAiSettings}
        />
      </div>

      <div
        id="aisettings"
        className="flex flex-col justify-center items-start gap-2 w-full pt-4  max-w-[1000px]"
      >
        <h2 className="text-lg font-bold">AI Settings</h2>
        <Separator className="w-[90%] mb-2" />
        <AiConfigSettingForm
          prePrompt={prePrompt}
          defaultAiOption={defaultAiOption}
          defaultAiModel={defaultAiModel}
          updatePrePrompt={setPrePrompt}
          updateDefaultAiOption={setDefaultAiOption}
          updateDefaultAiModel={setDefaultAiModel}
          isSaving={isSavingProfile || isSavingAiSettings}
        />
      </div>

      <div
        id="apikeys"
        className="flex flex-col justify-start items-start gap-2 w-full pt-4  max-w-[1000px]"
      >
        <h2 className="text-lg font-bold">API Keys</h2>
        <p className="text-sm text-muted-foreground mt-1">
          For security reasons, your API key is{" "}
          <span className="underline">never</span> displayed (& fetched to your
          browser)
        </p>
        <Separator className="w-[90%] mb-2" />
        {Object.values(AiOption).map((ao, i) => {
          return (
            <div
              className="flex flex-col justify-start items-start gap-8 my-2"
              key={`aiOption-settings-${ao}-${i}`}
            >
              <AiOptionSettingForm
                aiOption={ao}
                apiKey={AiOptionConfigDetails[ao]?.apiKey || ""}
                storePref={KeyStorePref.CLOUD}
                updateApiKey={(val) => setApiKeyByAiOption(ao, val)}
                isSaving={isSavingProfile || isSavingAiSettings}
              />
            </div>
          );
        })}
      </div>

      {/* <div
        id="codeeditorsettings"
        className="flex flex-col justify-center items-start gap-2 w-full pt-4  max-w-[1000px]"
      >
        <h2 className="text-lg font-bold">
          Code Editor Settings{" "}
          <span className="ml-3 px-2 py-1 font-bold text-xs rounded-full bg-amber-600 text-gray-100">
            Coming Soon!
          </span>
        </h2>
        <Separator className="w-[90%] mb-2" />
      </div> */}

      <Button onClick={handleSaveAllSettings} className="ml-auto mt-10 mr-4">
        Save Changes
      </Button>
    </div>
  );
};

export default SettingsContent;
