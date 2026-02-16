"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const PublishLogsButton = dynamic(
  () => import("@/components/PublishLogsButton"),
  { ssr: false },
);

const PAPER_MODE_KEY = "softcomputer-paper-mode";
const PAGE_SIZE = 9;

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
    return { entries: Array.isArray(data?.entries) ? data.entries : [] };
  } catch {
    return { entries: [] };
  }
}

function readPaperMode() {
  try {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(PAPER_MODE_KEY);
    if (saved === "grid" || saved === "lined" || saved === "dot") return saved;
    return "grid";
  } catch {
    return "grid";
  }
}

function writePaperMode(mode) {
  try {
    localStorage.setItem(PAPER_MODE_KEY, mode);
  } catch {}
}

export default function LogNotebookPage({ focus }) {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [paperMode, setPaperMode] = useState(() => readPaperMode());
  const [page, setPage] = useState(0);

  // persist paper mode on change (no effect state updates; only side effect)
  useEffect(() => {
    writePaperMode(paperMode);
  }, [paperMode]);

  // published snapshot (public)
  useEffect(() => {
    let alive = true;

    (async () => {
      const snap = await fetchPublishedSnapshot();
      if (!alive) return;

      const list = Array.isArray(snap.entries) ? snap.entries : [];
      const sorted = [...list].sort(
        (a, b) => (b?.createdAt || 0) - (a?.createdAt || 0),
      );

      setEntries(sorted);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        (e.text || "").toLowerCase().includes(q) ||
        (e.label || "").toLowerCase().includes(q),
    );
  }, [entries, query]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }, [filtered.length]);

  // clamp page at render-time for UI + slicing
  const safePage = Math.min(page, totalPages - 1);

  const pagedEntries = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  // set active based on focus or default to newest
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!entries.length) return;

    queueMicrotask(() => {
      if (focus) {
        const idx = entries.findIndex((e) => e.id === focus);
        if (idx >= 0) {
          const targetPage = Math.floor(idx / PAGE_SIZE);
          setPage((p) => (p === targetPage ? p : targetPage));
          setActiveId((id) => (id === focus ? id : focus));
          return;
        }
      }

      if (!activeId && filtered.length > 0) {
        const nextId = filtered[0].id;
        setActiveId((id) => (id === nextId ? id : nextId));
      }
    });
  }, [entries, filtered, activeId, focus]);

  // if active entry is not on the current page, pick first entry on that page
  useEffect(() => {
    if (!activeId) return;
    if (pagedEntries.length === 0) return;

    const onPage = pagedEntries.some((e) => e.id === activeId);
    if (onPage) return;

    queueMicrotask(() => {
      const nextId = pagedEntries[0].id;
      setActiveId((id) => (id === nextId ? id : nextId));
    });
  }, [activeId, pagedEntries]);

  const activeEntry = useMemo(() => {
    if (!activeId) return null;
    return filtered.find((e) => e.id === activeId) || null;
  }, [filtered, activeId]);

  const isDev = process.env.NODE_ENV === "development";

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;

  function onSearchChange(value) {
    setQuery(value);
    // reset page immediately (avoid effect)
    setPage(0);
  }

  function goPrev() {
    setPage((p) => Math.max(0, p - 1));
  }

  function goNext() {
    setPage((p) => Math.min(totalPages - 1, p + 1));
  }

  return (
    <main className="wrap">
      <section className="panel">
        <div className="panelTitleRow">
          <div>
            <div className="h1" style={{ marginBottom: 6 }}>
              log
            </div>
            <p className="p subtle" style={{ margin: 0 }}>
              published notebook snapshot.
            </p>
          </div>

          {/* only show publish control to you locally (dev) */}
          {isDev ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <PublishLogsButton />
            </div>
          ) : null}
        </div>

        <div className="logTopBar">
          <input
            className="input"
            placeholder="search entries..."
            value={query}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="small subtle" style={{ whiteSpace: "nowrap" }}>
            {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>
      </section>

      <section className="logGrid">
        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">entries</div>
            <div className="small subtle">
              page {safePage + 1} / {totalPages}
            </div>
          </div>

          <div className="entryList">
            {filtered.length === 0 ? (
              <div className="emptyState">no published entries yet.</div>
            ) : (
              pagedEntries.map((e) => {
                const isActiveRow = e.id === activeId;
                const prev = previewText(e.text);

                return (
                  <button
                    key={e.id}
                    type="button"
                    className={isActiveRow ? "entryRow active" : "entryRow"}
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

          {filtered.length > PAGE_SIZE ? (
            <div className="logPagination">
              <button
                type="button"
                className="btn ghost"
                disabled={!canPrev}
                onClick={goPrev}
              >
                prev
              </button>

              <div className="small subtle">
                showing {safePage * PAGE_SIZE + 1}–
                {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </div>

              <button
                type="button"
                className="btn ghost"
                disabled={!canNext}
                onClick={goNext}
              >
                next
              </button>
            </div>
          ) : null}
        </div>

        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">notes</div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                className="kbd"
                onClick={() => setPaperMode("grid")}
                aria-pressed={paperMode === "grid"}
                title="grid paper"
              >
                grid
              </button>
              <button
                type="button"
                className="kbd"
                onClick={() => setPaperMode("lined")}
                aria-pressed={paperMode === "lined"}
                title="lined paper"
              >
                lined
              </button>
              <button
                type="button"
                className="kbd"
                onClick={() => setPaperMode("dot")}
                aria-pressed={paperMode === "dot"}
                title="dot grid paper"
              >
                dot
              </button>
            </div>
          </div>

          {activeEntry ? (
            <article className={`notePaper is-${paperMode}`}>
              <div className="noteHeader">
                <div className="h2" style={{ margin: 0 }}>
                  {activeEntry.label}
                </div>
              </div>

              <div className="noteBody">{activeEntry.text}</div>
            </article>
          ) : (
            <div className={`notePaper is-${paperMode} emptyState`}>
              select an entry to read it.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
