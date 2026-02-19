import PunchCard from "@/components/PunchCard";
import { redis } from "@/lib/redis";

async function fetchPublishedEntries() {
  try {
    const raw = await redis.get("softcomputer:logs");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default async function PunchPage({ searchParams }) {
  const mRaw = searchParams?.m;
  const dRaw = searchParams?.d;
  const focusM = typeof mRaw === "string" ? Number(mRaw) : null;
  const focusD = typeof dRaw === "string" ? Number(dRaw) : null;

  const entries = await fetchPublishedEntries();

  return (
    <div className="panel">
      <PunchCard
        readOnly={false}
        publishedEntries={entries}
        focusM={focusM}
        focusD={focusD}
      />
    </div>
  );
}