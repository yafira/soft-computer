"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

function emptyState() {
  const punched = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => false),
  );
  const logs = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => ""),
  );
  return { punched, logs };
}

function loadState() {
  try {
    if (typeof window === "undefined") return emptyState();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed?.punched || !parsed?.logs) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function daysInMonth(monthIndex, year = 2026) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildEntries(state) {
  const entries = [];
  for (let m = 0; m < 12; m++) {
    const max = daysInMonth(m, 2026);
    for (let d = 0; d < max; d++) {
      const text = (state.logs?.[m]?.[d] || "").trim();
      if (!text) continue;

      const id = `2026-${String(m + 1).padStart(2, "0")}-${String(
        d + 1,
      ).padStart(2, "0")}`;

      entries.push({
        id,
        monthIndex: m,
        dayIndex: d,
        label: `${months[m]} ${d + 1}`,
        text,
        dateValue: new Date(2026, m, d + 1).getTime(),
      });
    }
  }
  entries.sort((a, b) => b.dateValue - a.dateValue);
  return entries;
}

// first line if present, else first sentence, else first N chars
function previewText(raw, maxChars = 84) {
  const t = (raw || "").trim();
  if (!t) return "";

  const firstLine = t.split("\n").find((line) => line.trim().length > 0) || "";
  const line = firstLine.trim();

  // if the first line is already short, use it
  if (line.length <= maxChars) return line;

  // fall back: first sentence-ish
  const sentenceMatch = line.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1].trim() : "";

  if (sentence && sentence.length <= maxChars) return sentence;

  return `${line.slice(0, maxChars).trim()}…`;
}

export default function LogNotebookPage() {
  const searchParams = useSearchParams();

  const [state, setState] = useState(() => emptyState());
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  // load after hydration (prevents hydration mismatch)
  useEffect(() => {
    let alive = true;

    queueMicrotask(() => {
      if (!alive) return;
      setState(loadState());
    });

    return () => {
      alive = false;
    };
  }, []);

  // listen for updates from punch card saves/deletes
  useEffect(() => {
    const onUpdate = () => setState(loadState());
    window.addEventListener("softcomputer-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("softcomputer-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const entries = useMemo(() => {
    const all = buildEntries(state);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (e) =>
        e.text.toLowerCase().includes(q) || e.label.toLowerCase().includes(q),
    );
  }, [state, query]);

  // set active entry on first load:
  // 1) focus param, else 2) newest entry
  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus && typeof focus === "string") {
      setActiveId(focus);
      return;
    }

    if (!activeId && entries.length > 0) {
      setActiveId(entries[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, entries]);

  const activeEntry = useMemo(() => {
    if (!activeId) return null;
    return entries.find((e) => e.id === activeId) || null;
  }, [entries, activeId]);

  return (
    <main className="wrap">
      <section className="panel">
        <div className="panelTitleRow">
          <div>
            <div className="h1" style={{ marginBottom: 6 }}>
              log
            </div>
            <p className="p subtle" style={{ margin: 0 }}>
              notebook view of punched entries.
            </p>
          </div>
        </div>

        <div className="logTopBar">
          <input
            className="input"
            placeholder="search entries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="small subtle" style={{ whiteSpace: "nowrap" }}>
            {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </div>
        </div>
      </section>

      <section className="logGrid">
        {/* left: entries list (title + preview) */}
        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">entries</div>
          </div>

          <div className="entryList">
            {entries.length === 0 ? (
              <div className="emptyState">no entries yet. punch the card ✿</div>
            ) : (
              entries.map((e) => {
                const isActive = e.id === activeId;
                const prev = previewText(e.text);

                return (
                  <button
                    key={e.id}
                    type="button"
                    className={isActive ? "entryRow active" : "entryRow"}
                    onClick={() => setActiveId(e.id)}
                    title="view notes"
                  >
                    <div className="entryRowTop">
                      <div className="chip">{e.label}</div>
                    </div>

                    <div className="entryPreview">{prev}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* right: notes (full log text) */}
        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">notes</div>
            <div className="small subtle">read-only</div>
          </div>

          {activeEntry ? (
            <article className="notePaper">
              <div className="noteHeader">
                <div className="h2" style={{ margin: 0 }}>
                  {activeEntry.label}
                </div>
              </div>

              <div className="noteBody">{activeEntry.text}</div>
            </article>
          ) : (
            <div className="notePaper emptyState">
              select an entry to read it.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
