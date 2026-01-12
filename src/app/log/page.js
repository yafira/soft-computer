"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "softcomputer_process_2026";
const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function LogPage() {
  const [data, setData] = useState(() => {
    if (typeof window === "undefined") return null;
    return load();
  });

  // ✅ live updates when punch card saves
  useEffect(() => {
    const update = () => setData(load());
    window.addEventListener("softcomputer-update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("softcomputer-update", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const entries = useMemo(() => {
    if (!data?.logs) return [];
    const out = [];

    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 31; c++) {
        const text = (data.logs?.[r]?.[c] || "").trim();
        if (text) {
          out.push({
            monthIndex: r,
            day: c + 1,
            label: `${months[r]} ${c + 1}`,
            text,
            sort: r * 100 + (c + 1),
          });
        }
      }
    }

    out.sort((a, b) => a.sort - b.sort);
    out.reverse();
    return out;
  }, [data]);

  return (
    <section className="panel">
      <div className="h1">timeline</div>
      <p className="p">
        everything you’ve logged so far (updates instantly when you save a
        punch).
      </p>

      {!data && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>
            no saved data yet
          </div>
          <p className="p">go punch a day and write a first log.</p>
        </div>
      )}

      {data && entries.length === 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>no logs yet</div>
          <p className="p">your card is empty. that’s a beautiful beginning.</p>
        </div>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {entries.map((e, i) => (
          <div className="card" key={`${e.monthIndex}-${e.day}-${i}`}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 700, color: "rgba(232,224,250,0.95)" }}>
                {e.label}
              </div>
              <div className="small">process memory</div>
            </div>
            <div
              style={{
                marginTop: 8,
                color: "rgba(232,224,250,0.85)",
                lineHeight: 1.5,
              }}
            >
              {e.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
