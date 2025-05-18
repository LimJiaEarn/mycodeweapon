"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ProblemState, ProblemStatus } from "@/types/problem";
import { PROBLEMS_TABLE, PROBLEM_IMAGE_BUCKET } from "@/constants/supabase";
import { convertIsoTimeToUnix, getCurrentUTCTime } from "@/utils/timestamp";
import { SimpleResponse } from "@/types/global";
import { DEFAULT_LANGUAGE_ID, languageTemplates } from "@/constants/judge0";

export const useProblem = (title: string, user: User | null) => {
  const DEFAULT_PROBLEM_STATE: ProblemState = {
    id: "-1",
    userId: user?.id || "-",
    title: "untitled",
    status: ProblemStatus.InProgress,
    code: languageTemplates[DEFAULT_LANGUAGE_ID] || "# your code here", // Default to Python template
    languageId: DEFAULT_LANGUAGE_ID, // python's language Id
    questionImage: null,
    imageUrl: null,
    imagePreview: "",
    updated_at: "",
  };

  // for updating user details when user are loaded asynchronously
  useEffect(() => {
    if (user) {
      updateProblemStates({ userId: user.id });
      console.log(`[useProblem] updated userId: ${user.id}`);
    }
  }, [user]);

  const [problemStates, setProblemStates] = useState<ProblemState>(
    DEFAULT_PROBLEM_STATE
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // use to assist in deleting redundant images
  const [oldImagePath, setOldImagePath] = useState<string | null>(null);

  // utility function
  const updateProblemStates = (newStates: Partial<ProblemState>) => {
    setProblemStates((prev) => ({
      ...prev,
      ...newStates,
    }));
  };

  // init
  useEffect(() => {
    const fetchProblem = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      const spacedTitle: string = title.replaceAll("-", " ");
      const userId: string = user.id;

      if (spacedTitle.length === 0) {
        return;
      }

      try {
        const supabase = await createClient();
        const { data, error: fetchError } = await supabase
          .from(PROBLEMS_TABLE)
          .select("*")
          .eq("userId", userId)
          .eq("title", spacedTitle)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        // fetch the image if such exist
        if (data.imageUrl) {
          try {
            console.log(
              `[useProblem] fetchProblem() - imageUrl: ${data.imageUrl}`
            );

            // cache this imageUrl's filepath
            const storagePathRegex = data.imageUrl.match(
              /problemImages\/(.+)(\?.*|$)/
            );
            const storagePath = storagePathRegex ? storagePathRegex[1] : null;
            console.log(
              `[useProblem] fetchProblem() - storagePath: ${storagePath}`
            );
            setOldImagePath(storagePath);

            updateProblemStates({
              imagePreview: data.imageUrl,
              imageUrl: data.imageUrl,
            });

            const response = await fetch(data.imageUrl);
            const blob = await response.blob();

            // Get file extension from URL
            const fileExt =
              data.imageUrl.split(".").pop()?.split("?")[0] || "png";
            const fileName = `${data.id}.${fileExt}`;

            const imageFile = new File([blob], fileName, {
              type: `image/${fileExt}`,
            });
            updateProblemStates({ questionImage: imageFile });
          } catch (err) {
            console.error("[useProblem] Error fetching image:", err);
          }
        }

        updateProblemStates({
          id: data.id,
          title: data.title,
          status: data.status,
          code: data.code,
          languageId: data.languageId,
          updated_at: data.updated_at,
        });

        // if there is a prev code saved in local storage, we use that
        handleProblemCodeConflicts(data.id, data.updated_at, data.code);
        const cachedCode = getCodeLocally(data.id);
        if (cachedCode) {
          updateProblemStates({ code: cachedCode });
        }

        console.log("[useProblem] fetched & processe data:");
        console.table(data);
      } catch (err) {
        console.log("[useProblem] error:");
        console.log(err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch problem")
        );
      }
    };

    if (title !== "new") {
      fetchProblem();
    }

    setIsLoading(false);
  }, [title, user]);

  const isDuplicateTitle = async (title: string): Promise<boolean> => {
    const supabase = createClient();

    const { data: userProblems, error } = await supabase
      .from(PROBLEMS_TABLE)
      .select("title")
      .eq("userId", user?.id);

    if (error) {
      return true;
    }
    if (userProblems) {
      return userProblems.some((uP) => {
        const isMatch = uP.title === title;
        if (isMatch) {
          console.log(`found match of ${uP.title} === ${title}`);
        }
        return isMatch;
      });
    }

    return false;
  };

  const setTitle = async (title: string): Promise<SimpleResponse> => {
    const isDuplicate = await isDuplicateTitle(title);

    if (isDuplicate) {
      return {
        success: false,
        message: "Title is duplicated",
      };
    }

    updateProblemStates({ title: title.trim().toLowerCase() });

    return {
      success: true,
      message: "",
    };
  };

  const setStatus = (status: ProblemStatus) => {
    updateProblemStates({ status });
  };

  const setQuestionImage = (questionImage: File | null) => {
    updateProblemStates({ questionImage });
  };

  const setCode = (code: string) => {
    updateProblemStates({ code });
    saveCodeLocally(problemStates.id, code);
  };

  const setLanguageId = (languageId: string) => {
    // Check if the code is empty or matches a template (indicating it hasn't been edited)
    const currentCode = problemStates.code;
    const currentLangId = problemStates.languageId;

    // If code is empty or matches the current language template, update it to the new language template
    if (!currentCode || currentCode === languageTemplates[currentLangId]) {
      updateProblemStates({
        languageId,
        code: languageTemplates[languageId] || "// your code here",
      });
    } else {
      // Otherwise just update the language ID
      updateProblemStates({ languageId });
    }
  };

  const saveProblem = async () => {
    setIsSaving(true);
    setError(null);

    console.log(
      `[useProblem] Saving problem with userId: ${problemStates.userId}`
    );

    // save code locally
    saveCodeLocally(problemStates.id, problemStates.code);

    try {
      const supabase = createClient();

      let problemId: string = problemStates.id;

      const toInsertData = {
        title: problemStates.title,
        status: problemStates.status,
        userId: problemStates.userId,
        code: problemStates.code,
        languageId: problemStates.languageId,
      };

      // new problem to insert
      if (problemId === "-1") {
        const { data, error: supaError } = await supabase
          .from(PROBLEMS_TABLE)
          .insert(toInsertData)
          .select("id")
          .single();

        if (supaError) {
          throw supaError;
        }

        problemId = data.id;
        updateProblemStates({ id: data.id });

        // update previously inserted problem
      } else {
        const { data, error: supaError } = await supabase
          .from(PROBLEMS_TABLE)
          .update(toInsertData)
          .eq("id", problemStates.id);

        if (supaError) {
          throw supaError;
        }
      }
      if (process.env.NODE_ENV === "development") {
        console.log("[useProblem] problem data upserted to DB: ", problemId);
      }

      // if there's images in storage, delete first
      if (oldImagePath) {
        const { error: deleteError } = await supabase.storage
          .from(PROBLEM_IMAGE_BUCKET)
          .remove([oldImagePath]);

        if (deleteError) {
          throw deleteError;
        }
      }

      // handle image upload to storage if any
      if (problemStates.questionImage) {
        const fileExt = problemStates.questionImage.name.split(".").pop();

        const fileStorePath = `${problemStates.userId}/${problemId}.${fileExt}`;

        const { error: UploadError } = await supabase.storage
          .from(PROBLEM_IMAGE_BUCKET)
          .upload(fileStorePath, problemStates.questionImage, {
            cacheControl: "3600",
            upsert: true,
          });

        if (UploadError) {
          throw UploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(PROBLEM_IMAGE_BUCKET)
          .getPublicUrl(fileStorePath);

        const { error: imageUrlUpdateError } = await supabase
          .from(PROBLEMS_TABLE)
          .update({ imageUrl: publicUrl })
          .eq("id", problemId)
          .eq("userId", problemStates.userId);

        if (imageUrlUpdateError) {
          throw imageUrlUpdateError;
        }
      } else {
        // no image given in this saveProblem() request
        const { error: imageUrlUpdateError } = await supabase
          .from(PROBLEMS_TABLE)
          .update({ imageUrl: null })
          .eq("id", problemId)
          .eq("userId", problemStates.userId);

        if (imageUrlUpdateError) {
          throw imageUrlUpdateError;
        }
      }
    } catch (err) {
      console.log("[useProblem] error in saving problem:");
      console.log(err);
      setError(
        err instanceof Error ? err : new Error("Unexpected error occured")
      );
    } finally {
      setIsSaving(false);
      console.log("[useProblem] saveProblem() completed");
    }
  };

  const resetProblem = () => {
    updateProblemStates(DEFAULT_PROBLEM_STATE);
    setError(null);
    setIsLoading(false);
    setIsSaving(false);
  };

  return {
    problemStates,

    setTitle,
    setStatus,
    setQuestionImage,
    setCode,
    setLanguageId,
    saveProblem,
    resetProblem,

    isLoading,
    isSaving,
    error,
  };
};

// utility functions

/*
  Since old user's code may be cached in local storage, we compare which is later version and use it
  
  Note: If user previously saved code to cloud in device B and logs into device A with "older" code, we will overwrite A's local storage with server code
*/
const handleProblemCodeConflicts = (
  problemId: string,
  serverUpdatedTimeIso: string,
  code: string
) => {
  const key = getLocalStorageKey(problemId);

  const serverLastUpdated = convertIsoTimeToUnix(serverUpdatedTimeIso);
  const localLastUpdated = Number(localStorage.getItem(`${key}-updated`)) || 0;

  // server has newer code so overwrite local storage with it
  if (localLastUpdated < serverLastUpdated) {
    saveCodeLocally(problemId, code);
  } else {
  }
};

const saveCodeLocally = (problemId: string, code: string) => {
  const key = getLocalStorageKey(problemId);

  localStorage.setItem(`${key}-code`, code);
  localStorage.setItem(`${key}-updated`, String(getCurrentUTCTime()));
};

const getCodeLocally = (problemId: string): string => {
  const key = getLocalStorageKey(problemId);

  const cachedCode = localStorage.getItem(`${key}-code`);

  return cachedCode || "";
};

const deleteCodeLocally = (problemId: string) => {
  const key = getLocalStorageKey(problemId);

  localStorage.removeItem(`${key}-code`);
  localStorage.removeItem(`${key}-updated`);
};

const getLocalStorageKey = (problemId: string): string => {
  if (problemId !== "-1") {
    return `problem-${problemId}`;
  }
  return "problem-unsaved";
};
