import LogNotebookPage from "@/components/LogNotebookPage";

export default async function LogPage({ searchParams }) {
  const params = await searchParams;
  const focusRaw = params?.focus;
  const focus = typeof focusRaw === "string" ? focusRaw : null;
  return <LogNotebookPage focus={focus} />;
}
