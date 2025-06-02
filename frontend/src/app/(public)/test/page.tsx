import { getDatabaseCollections } from "@/actions/mongodb";
import TestCell from "./TestCell";

type Props = {};

const page = async (props: Props) => {
  const collections = await getDatabaseCollections();

  return (
    <div className="h-screen w-full flex_col_center gap-8">
      <div>
        {collections.map((collection, i) => (
          <div key={`collection-${i}`}>{collection.name}</div>
        ))}
      </div>

      <TestCell />
    </div>
  );
};

export default page;
