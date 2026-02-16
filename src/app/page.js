import PunchCard from "@/components/PunchCard";
import TimelinePreview from "@/components/TimelinePreview";
import ConceptGallery from "@/components/ConceptGallery";

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

export default async function HomePage() {
  const isDev = process.env.NODE_ENV === "development";
  const entries = isDev ? [] : await fetchPublishedEntries();

  return (
    <main className="wrap">
      <section id="punch-card" className="panel punchSection">
        <div className="panelHeader">
          <div></div>
        </div>

        <PunchCard readOnly={!isDev} publishedEntries={entries} />

        {isDev ? (
          <div className="small" style={{ marginTop: 10 }}>
            storage: <span className="kbd">softcomputer_process_2026</span>
          </div>
        ) : null}
      </section>

      <section className="twoCol">
        <div className="panel">
          <div className="panelTitleRow">
            <div className="h2">the soft computer concept</div>
            <div className="small subtle"></div>
          </div>

          <ConceptGallery />
        </div>

        <TimelinePreview />
      </section>
    </main>
  );
}
