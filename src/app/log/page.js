import { Suspense } from "react";
import LogNotebookPage from "@/components/LogNotebookPage";

export const dynamic = "force-dynamic";

export default function Page({ searchParams }) {
  const focus =
    typeof searchParams?.focus === "string" ? searchParams.focus : null;

  return (
    <Suspense fallback={null}>
      <LogNotebookPage initialFocus={focus} />
    </Suspense>
  );
}
