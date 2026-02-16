import PunchCard from "@/components/PunchCard";
import TimelinePreview from "@/components/TimelinePreview";
import ConceptGallery from "@/components/ConceptGallery";

export default function HomePage() {
  return (
    <main className="wrap">
      <section id="punch-card" className="panel punchSection">
        <div className="panelHeader">
          <div></div>
        </div>

        <PunchCard />
        <div className="small" style={{ marginTop: 10 }}>
          storage: <span className="kbd">softcomputer_process_2026</span>
        </div>
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
