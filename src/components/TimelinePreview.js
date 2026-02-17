"use client";

import { useEffect, useMemo, useState } from "react";

// title-only preview: first non-empty line, prefers first sentence, no ellipsis
function previewText(raw, maxChars = 120) {
  const t = (raw || "").trim();
  if (!t) return "";

  const firstLine = t.split("\n").find((line) => line.trim().length > 0) || "";
  const line = firstLine.trim();

  const sentenceMatch = line.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1].trim() : "";

  const out = sentence || line;
  return out.slice(0, maxChars).trim();
}

async function fetchPublishedSnapshot() {
  try {
    const res = await fetch("/process-memory.json", { cache: "no-store" });
    if (!res.ok) return { entries: [] };
    const data = await res.json();
    const entries = Array.isArray(data?.entries) ? data.entries : [];
    return { entries };
  } catch {
    return { entries: [] };
  }
}

export default function TimelinePreview() {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const snap = await fetchPublishedSnapshot();
      if (!alive) return;
      setEntries(snap.entries || []);
      setLoaded(true);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // limit to latest 5
  const recent = useMemo(() => {
    // your published json already exports sorted newest-first
    return (entries || []).slice(0, 8);
  }, [entries]);

  return (
    <div className="panel">
      <div className="panelTitleRow">
        <div className="h2">recent log</div>
      </div>

      <div className="miniList">
        {!loaded ? (
          <div className="emptyState">loading…</div>
        ) : recent.length === 0 ? (
          <div className="emptyState">no published entries yet.</div>
        ) : (
          recent.map((e) => (
            <a
              key={e.id}
              className="miniRow"
              href={`/log?focus=${encodeURIComponent(e.id)}`}
              title="open in log"
            >
              <div className="miniLeft">
                <div className="chip">{e.label}</div>
              </div>

              <div className="miniRight">
                <div className="miniText">{previewText(e.text)}</div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
