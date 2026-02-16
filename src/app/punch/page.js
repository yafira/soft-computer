import PunchCard from "@/components/PunchCard";
import ExportMemory from "@/components/ExportMemory";

export default function PunchPage() {
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    return (
      <div className="panel">
        <PunchCard readOnly />
      </div>
    );
  }

  return (
    <div className="panel">
      <PunchCard />
      <ExportMemory />
    </div>
  );
}
