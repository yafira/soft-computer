import PunchCard from "@/components/PunchCard";
import ExportMemory from "@/components/ExportMemory";

export default function PunchPage({ searchParams }) {
  const mRaw = searchParams?.m;
  const dRaw = searchParams?.d;

  const initialM = typeof mRaw === "string" ? Number(mRaw) : null;
  const initialD = typeof dRaw === "string" ? Number(dRaw) : null;

  return (
    <div className="panel">
      <PunchCard initialM={initialM} initialD={initialD} />
      <ExportMemory />
    </div>
  );
}
