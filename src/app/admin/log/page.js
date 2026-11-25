import LogNotebookPage from "@/components/LogNotebookPage";
import { isAdmin } from "@/lib/adminAuth";
import AdminLogin from "@/components/AdminLogin";

export default async function LogPage({ searchParams }) {
  if (!(await isAdmin())) return <AdminLogin />;
  const params = await searchParams;
  const focusRaw = params?.focus;
  const focus = typeof focusRaw === "string" ? focusRaw : null;
  return <LogNotebookPage focus={focus} />;
}
