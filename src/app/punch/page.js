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

export default async function PunchPage({ searchParams }) {
  const isDev = process.env.NODE_ENV === "development";

  const mRaw = searchParams?.m;
  const dRaw = searchParams?.d;

  const focusM = typeof mRaw === "string" ? Number(mRaw) : null;
  const focusD = typeof dRaw === "string" ? Number(dRaw) : null;

  // prod: public read-only view from published snapshot
  if (!isDev) {
    const entries = await fetchPublishedEntries();
    return (
      <div className="panel">
        <PunchCard
          readOnly
          publishedEntries={entries}
          focusM={focusM}
          focusD={focusD}
        />
      </div>
    );
  }

  // dev: your full editable dashboard
  return (
    <div className="panel">
      <PunchCard focusM={focusM} focusD={focusD} />
      <ExportMemory />
    </div>
  );
}
