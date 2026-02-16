"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PublishLogsButton from "@/components/PublishLogsButton";

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

export default function LogNotebookPage() {
  const searchParams = useSearchParams();

  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  const [paperMode, setPaperMode] = useState("grid");
  const [page, setPage] = useState(0);

  // keep paper mode public + per-user (stored locally)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAPER_MODE_KEY);
      if (saved === "grid" || saved === "lined" || saved === "dot") {
        setPaperMode(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PAPER_MODE_KEY, paperMode);
    } catch {}
  }, [paperMode]);

  // published snapshot (public)
  useEffect(() => {
    let alive = true;

    (async () => {
      const snap = await fetchPublishedSnapshot();
      if (!alive) return;
      setEntries(snap.entries || []);
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

  // reset to page 0 when searching
  useEffect(() => {
    setPage(0);
  }, [query]);

  // slice current page
  const pagedEntries = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }, [filtered.length]);

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus) {
      setActiveId(focus);
      return;
    }
    if (!activeId && filtered.length > 0) setActiveId(filtered[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filtered]);

  // if active entry is not on the current page, pick the first entry on that page
  useEffect(() => {
    if (!activeId) return;
    const onPage = pagedEntries.some((e) => e.id === activeId);
    if (!onPage && pagedEntries.length > 0) setActiveId(pagedEntries[0].id);
  }, [activeId, pagedEntries]);

  const activeEntry = useMemo(() => {
    if (!activeId) return null;
    return filtered.find((e) => e.id === activeId) || null;
  }, [filtered, activeId]);

  const isDev = process.env.NODE_ENV === "development";

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

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
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="small subtle" style={{ whiteSpace: "nowrap" }}>
            {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>
      </section>

      <section className="logGrid">
        {/* left: entries list */}
        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">entries</div>
            <div className="small subtle">
              page {page + 1} / {totalPages}
            </div>
          </div>

          <div className="entryList">
            {filtered.length === 0 ? (
              <div className="emptyState">no published entries yet.</div>
            ) : (
              pagedEntries.map((e) => {
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

          {/* pagination */}
          {filtered.length > PAGE_SIZE ? (
            <div className="logPagination">
              <button
                type="button"
                className="btn ghost"
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                prev
              </button>

              <div className="small subtle">
                showing {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </div>

              <button
                type="button"
                className="btn ghost"
                disabled={!canNext}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                next
              </button>
            </div>
          ) : null}
        </div>

        {/* right: notes */}
        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">notes</div>

            {/* paper mode toggles are PUBLIC (reader preference) */}
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
