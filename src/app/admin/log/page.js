import LogNotebookPage from "@/components/LogNotebookPage";

export default function LogPage({ searchParams }) {
  const focusRaw = searchParams?.focus;
  const focus = typeof focusRaw === "string" ? focusRaw : null;

  return <LogNotebookPage focus={focus} />;
}