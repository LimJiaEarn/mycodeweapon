"use client";

import CodeEditor from "@/components/problem/CodeEditor";
import CodeOutput from "@/components/problem/CodeOutput";
import QuestionEditor from "@/components/problem/QuestionEditor";
import AiChat from "@/components/problem/AiChat";
import LoadingContent from "@/components/problem/LoadingContent";
import CollapsiblePanel from "@/components/utils/CollapsiblePanel";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAuth } from "@/providers/auth-provider";
import { useProblem } from "@/hooks/useProblem";
import { useJudge0 } from "@/hooks/useJudge0";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { judge0ToMonacoMap } from "@/constants/judge0";
import CreateProblemModal from "./CreateProblemModal";

const ProblemPage = ({ title }: { title: string }) => {
  const router = useRouter();
  const { user, authLoading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(title === "new");

  // problem dependencies
  const {
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
  } = useProblem(title, user);

  // judge0 dependencies
  const {
    judge0Error,
    languages,
    submitCode,
    isSubmitting,
    codeOutput,
    codeErrorId,
    codeErrorDesc,
    codeMemoryUsed,
    codeTimeUsed,
  } = useJudge0();

  // Wrap saveProblem to update URL after successful save
  const handleSaveProblem = async () => {
    try {
      await saveProblem();
    } catch (err) {
      console.error("Error saving problem:", err);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowCreateModal(false);
    if (title === "new") {
      router.push("/problem");
    }
  };

  // TODO: different error types - right now they are all clustered together in this one variable
  if (error) {
    return (
      <div className="h-full w-full flex_col_center gap-4">
        <p>No problem titled: {title} found</p>
        <div>
          <Link
            className="underline text-blue-600 hover:text-blue-700"
            href="/problem"
            onClick={resetProblem}
          >
            Back to problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingContent />}>
      {showCreateModal && (
        <CreateProblemModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          user={user}
        />
      )}

      {authLoading || isLoading ? (
        <LoadingContent />
      ) : (
        <div className="h-full w-full bg-slate-400 dark:bg-black border-t-4 border-slate-400 dark:border-black px-1 pb-0.5">
          <div className="flex_center md:hidden bg-yellow-700 w-full">
            <p className="text-yellow-300 font-bold">
              Use larger screens for code execution features!
            </p>
          </div>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel
              defaultSize={40}
              minSize={27}
              className="mr-0.5 bg-slate-400 dark:bg-black"
            >
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSize={50}
                  minSize={20}
                  className="mb-0.5 bg-background rounded-lg p-4"
                >
                  <QuestionEditor
                    title={problemStates.title}
                    setTitle={setTitle}
                    status={problemStates.status}
                    setStatus={setStatus}
                    imageUrl={problemStates.imageUrl}
                    image={problemStates.questionImage}
                    setImage={setQuestionImage}
                  />
                </ResizablePanel>
                <ResizableHandle
                  withHandle
                  className="bg-slate-400 dark:bg-black"
                />
                <ResizablePanel
                  defaultSize={50}
                  minSize={20}
                  className="mb-0.5 bg-background rounded-lg p-4"
                >
                  <AiChat
                    user={user}
                    problemStates={problemStates}
                    code={problemStates.code}
                    language={
                      judge0ToMonacoMap[problemStates.languageId] || "python"
                    }
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="bg-slate-400 dark:bg-black hidden md:flex"
            />

            <ResizablePanel
              defaultSize={60}
              className="ml-0.5 bg-slate-400 dark:bg-black hidden md:flex"
            >
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel
                  defaultSize={75}
                  className="mb-0.5 bg-background rounded-lg p-4"
                >
                  <CodeEditor
                    languages={languages}
                    languageId={problemStates.languageId}
                    onLanguageIdChange={setLanguageId}
                    code={problemStates.code}
                    onCodeChange={setCode}
                    onSubmitCode={submitCode}
                    isSubmitting={isSubmitting}
                    onSaveProblem={handleSaveProblem}
                    isSaving={isSaving}
                  />
                </ResizablePanel>
                <ResizableHandle
                  withHandle
                  className="bg-slate-400 dark:bg-black"
                />
                <CollapsiblePanel
                  defaultSize={25}
                  className="mt-0.5 bg-background rounded-lg p-4"
                  collapsedText="Code Output"
                  collapseThreshold={15}
                  collapsedSize={5}
                >
                  <CodeOutput
                    judge0Error={judge0Error}
                    isSubmitting={isSubmitting}
                    codeOutput={codeOutput}
                    codeErrorId={codeErrorId}
                    codeErrorDesc={codeErrorDesc}
                    codeMemoryUsed={codeMemoryUsed}
                    codeTimeUsed={codeTimeUsed}
                  />
                </CollapsiblePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}
    </Suspense>
  );
};

export default ProblemPage;
