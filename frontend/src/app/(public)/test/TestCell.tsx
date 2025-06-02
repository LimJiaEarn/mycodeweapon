"use client";
import { createNewChat } from "@/actions/mongodb";

type Props = {};

const TestCell = (props: Props) => {
  return (
    <div>
      <button
        className="px-4 py-2 bg-secondary rounded-md"
        onClick={async () => {
          const res = await createNewChat("userId1", "problemId");
          console.log(res);
        }}
      >
        Create new chat
      </button>
    </div>
  );
};

export default TestCell;
