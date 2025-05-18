"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { ProblemStatus } from "@/types/problem";
import { PROBLEMS_TABLE } from "@/constants/supabase";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface CreateProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function CreateProblemModal({
  isOpen,
  onClose,
  user,
}: CreateProblemModalProps) {
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const validateTitle = (title: string): boolean => {
    // Check if title is valid for URL (alphanumeric, spaces, hyphens)
    const urlSafeRegex = /^[a-zA-Z0-9\s-]+$/;
    return urlSafeRegex.test(title);
  };

  const isDuplicateTitle = async (title: string): Promise<boolean> => {
    if (!user) return true;

    const supabase = createClient();
    const { data: userProblems, error } = await supabase
      .from(PROBLEMS_TABLE)
      .select("title")
      .eq("userId", user.id);

    if (error) {
      return true;
    }

    if (userProblems) {
      return userProblems.some((problem) => {
        const isMatch = problem.title.toLowerCase() === title.toLowerCase();
        if (isMatch) {
          console.log(`Found duplicate title: ${problem.title} === ${title}`);
        }
        return isMatch;
      });
    }

    return false;
  };

  const handleCreateProblem = async () => {
    if (!user) {
      setError("You must be logged in to create a problem");
      return;
    }

    if (!title.trim()) {
      setError("Title cannot be empty");
      return;
    }

    if (!validateTitle(title)) {
      setError("Title can only contain letters, numbers, spaces, and hyphens");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const formattedTitle = title.trim().toLowerCase();

      // Check for duplicate title
      const isDuplicate = await isDuplicateTitle(formattedTitle);
      if (isDuplicate) {
        setError("A problem with this title already exists");
        setIsCreating(false);
        return;
      }

      // Create the problem in Supabase
      const supabase = createClient();
      const { data, error: createError } = await supabase
        .from(PROBLEMS_TABLE)
        .insert({
          title: formattedTitle,
          userId: user.id,
          status: ProblemStatus.InProgress,
          code: "# your code here",
          languageId: "71", // Python's language ID
        })
        .select("id")
        .single();

      if (createError) {
        throw createError;
      }

      // Redirect to the new problem page
      const urlTitle = formattedTitle.replace(/ /g, "-");

      // Close the modal first to prevent UI issues during navigation
      onClose();

      // Show toast notification
      toast({
        title: "Problem created",
        description: `Successfully created problem: ${formattedTitle}`,
      });

      // Navigate to the problem page
      router.push(`/problem/${urlTitle}`);
    } catch (err) {
      console.error("Error creating problem:", err);
      setError("Failed to create problem. Please try again.");
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Problem</DialogTitle>
          <DialogDescription>
            Enter a title for your new problem. This title cannot be changed
            later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter problem title"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateProblem();
                }
              }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500 col-span-4 text-center">
              {error}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateProblem} disabled={isCreating}>
            {isCreating ? "Creating..." : "Start Solving!"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
