"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import ConceptGallery from "@/components/ConceptGallery";

const PunchCard = dynamic(() => import("@/components/PunchCard"), {
  ssr: false,
});
const TimelinePreview = dynamic(() => import("@/components/TimelinePreview"), {
  ssr: false,
});

export default function HomeClient() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch("/api/logs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []));

    const onPub = () =>
      fetch("/api/logs", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setEntries(d.entries ?? []));

    window.addEventListener("softcomputer-logs-published", onPub);
    return () =>
      window.removeEventListener("softcomputer-logs-published", onPub);
  }, []);

  return (
    <main className="wrap">
      <section id="punch-card" className="panel punchSection">
        <div className="panelHeader">
          <div></div>
        </div>
        <PunchCard readOnly={true} publishedEntries={entries} />
        <div className="small" style={{ marginTop: 10 }}>
          storage: <span className="kbd">redis + vercel blob</span>
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
