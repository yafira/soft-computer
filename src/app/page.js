import Image from "next/image";
import PunchCard from "@/components/PunchCard";
import TimelinePreview from "@/components/TimelinePreview";

export default function HomePage() {
  return (
    <main className="wrap">
      {/* punch card first */}
      <section id="punch-card" className="panel punchSection">
        <div className="panelHeader">
          <div></div>
        </div>

        <PunchCard />
        <div className="small" style={{ marginTop: 10 }}>
          storage: <span className="kbd">softcomputer_process_2026</span>
        </div>
      </section>

      {/* below: 2 columns */}
      <section className="twoCol">
        {/* left: cover image */}
        <div className="panel">
          <div className="panelTitleRow">
            <div className="h2">cover</div>
            <div className="small subtle">full image, minimal cropping</div>
          </div>

          {/* replace with your actual path */}
          <div className="coverFrame">
            <Image
              src="/cover.jpg"
              alt="soft computer cover"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 50vw"
              className="coverImg"
            />
          </div>
        </div>

        {/* right: timeline preview */}
        <TimelinePreview />
      </section>
    </main>
  );
}
