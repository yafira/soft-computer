import PunchCard from "@/components/PunchCard";
import ExportMemory from "@/components/ExportMemory";

async function fetchPublishedEntries() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/process-memory.json`,
      { cache: "no-store" },
    );

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.entries) ? data.entries : [];
  } catch {
    return [];
  }
}

export default async function PunchPage() {
  const isDev = process.env.NODE_ENV === "development";

  // prod: read-only public view based on published snapshot
  if (!isDev) {
    const entries = await fetchPublishedEntries();

    return (
      <div className="panel">
        <PunchCard readOnly publishedEntries={entries} />
      </div>
    );
  }

  // dev: your full editable dashboard
  return (
    <div className="panel">
      <PunchCard />
      <ExportMemory />
    </div>
  );
}
