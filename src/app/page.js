import Image from "next/image";
import dynamic from "next/dynamic";

const PunchCard = dynamic(() => import("@/components/PunchCard"), {
  ssr: false,
});
const TimelinePreview = dynamic(() => import("@/components/TimelinePreview"), {
  ssr: false,
});

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

          <div className="coverFrame">
            <Image
              src="/sc.png"
              alt="soft computer cover"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 50vw"
              className="coverImg"
            />
          </div>
        </div>

        <TimelinePreview />
      </section>
    </main>
  );
}
