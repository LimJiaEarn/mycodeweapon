"use client"

import CodeEditor from "@/components/problem/CodeEditor"
import CodeOutput from "@/components/problem/CodeOutput"
import QuestionEditor from "@/components/problem/QuestionEditor"
import AiChat from "@/components/problem/AiChat"
import LoadingContent from "@/components/problem/LoadingContent"
import CollapsiblePanel from "@/components/utils/CollapsiblePanel"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import { useAuth } from "@/providers/auth-provider"
import { useProblem } from "@/hooks/useProblem"
import { useJudge0 } from "@/hooks/useJudge0"
import { use, Suspense } from 'react'
import Link from "next/link"
import { judge0ToMonacoMap } from "@/constants/judge0"


const ProblemPage = ({ params }: {
  params: Promise<{ title: string }>
}) => {

  const { user, authLoading } = useAuth();

  // problem dependencies
  const { title } = use(params)
  const { 
    problemStates,
		setTitle,
		setQuestionImage,
		setCode,
		setLanguageId,
		saveProblem,
		resetProblem,
		isLoading,
		isSaving,
		error
   } = useProblem(title, user);

  // judge0 dependencies
  const { 
    languages, 
    submitCode, 
    isSubmitting, 
    codeOutput,
    codeErrorId,
    codeErrorDesc,
    codeMemoryUsed,
    codeTimeUsed 
  } = useJudge0();

  if (error) {
    return (
      <div className="h-full w-full flex_col_center gap-4">
        <p>No problem titled: {title} found</p>
        <div>
          <Link
            className="underline text-blue-600 hover:text-blue-700"
            href="/problem/new"
            onClick={resetProblem}
          >
            Create new problem
          </Link>
        </div>

      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingContent/>}>
      {(authLoading || isLoading) ? (
        <LoadingContent/>)
        :
        (
        <div className="h-full bg-slate-400 dark:bg-black border-t-8 border-slate-400 dark:border-black">
          <ResizablePanelGroup 
            direction="horizontal"
          >
              <ResizablePanel defaultSize={40} className="mr-1 bg-slate-400 dark:bg-black">
                  <ResizablePanelGroup direction="vertical">
                      <ResizablePanel defaultSize={50} className="mb-1 bg-background rounded-lg p-4">
                          <QuestionEditor
                            title={problemStates.title}
                            setTitle={setTitle}
                            imageUrl={problemStates.imageUrl}
                            image={problemStates.questionImage}
                            setImage={setQuestionImage}
                          />
                      </ResizablePanel>
                      <ResizableHandle withHandle className="bg-slate-400 dark:bg-black"/>
                      <CollapsiblePanel
                        defaultSize={50}
                        className="mt-1 bg-background rounded-lg p-4"
                        collapsedText="AI Chatbot"
                        collapseThreshold={15}
                        collapsedSize={5}
                      >
                        <AiChat 
                          questionImage={problemStates.questionImage}
                          code={problemStates.code}
                          language={judge0ToMonacoMap[problemStates.languageId] || "python"}
                        />
                      </CollapsiblePanel>
                  </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-slate-400 dark:bg-black"/>

              <ResizablePanel defaultSize={60} className="ml-1 bg-slate-400 dark:bg-black">
                  <ResizablePanelGroup direction="vertical">
                      <ResizablePanel defaultSize={75} className="mb-1 bg-background rounded-lg p-4">
                        <CodeEditor 
                          languages={languages}
                          languageId={problemStates.languageId}
                          onLanguageIdChange={setLanguageId}
                          code={problemStates.code}
                          onCodeChange={setCode}
                          onSubmitCode={submitCode}
                          isSubmitting={isSubmitting}
                          onSaveProblem={saveProblem}
                          isSaving={isSaving}
                        />
                      </ResizablePanel>
                      <ResizableHandle withHandle className="bg-slate-400 dark:bg-black"/>
                      <CollapsiblePanel
                        defaultSize={50}
                        className="mt-1 bg-background rounded-lg p-4"
                        collapsedText="Code Output"
                        collapseThreshold={15}
                        collapsedSize={5}
                      >
                        <CodeOutput
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
    
  )
}

export default ProblemPage