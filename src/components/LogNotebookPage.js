"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const PublishLogsButton = dynamic(
  () => import("@/components/PublishLogsButton"),
  { ssr: false },
);

const MONTH_ORDER = [
  { label: "may", year: 2026 },
  { label: "apr", year: 2026 },
  { label: "mar", year: 2026 },
  { label: "feb", year: 2026 },
  { label: "jan", year: 2026 },
  { label: "dec", year: 2025 },
  { label: "nov", year: 2025 },
  { label: "oct", year: 2025 },
  { label: "sep", year: 2025 },
];

function parseLabelScore(label) {
  const parts = String(label || "")
    .toLowerCase()
    .trim()
    .split(/\s+/);
  const mName = parts[0];
  const d = parseInt(parts[1]) || 0;
  const idx = MONTH_ORDER.findIndex((m) => m.label === mName);
  const monthScore = idx < 0 ? -1 : MONTH_ORDER.length - 1 - idx;
  return monthScore * 31 + d;
}

const PAPER_MODE_KEY = "softcomputer-paper-mode";
const PAGE_SIZE = 8;

function previewText(raw, maxChars = 120) {
  const t = (raw || "")
    .trim()
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1");
  if (!t) return "";
  const firstLine = t.split("\n").find((line) => line.trim().length > 0) || "";
  const line = firstLine.trim();
  const sentenceMatch = line.match(/^(.+?[.!?])(\s|$)/);
  const sentence = sentenceMatch ? sentenceMatch[1].trim() : "";
  return (sentence || line).slice(0, maxChars).trim();
}

async function fetchLiveLogs() {
  try {
    const res = await fetch("/api/logs", { cache: "no-store" });
    if (!res.ok) {
      const t = await res.text();
      return {
        entries: [],
        error: `api failed (${res.status}): ${t.slice(0, 200)}`,
      };
    }
    const data = await res.json();
    return {
      entries: Array.isArray(data?.entries) ? data.entries : [],
      error: "",
    };
  } catch (e) {
    return { entries: [], error: String(e?.message || e) };
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

// get image count for badge — works with both content blocks and legacy imageUrls
function getImageCount(entry) {
  if (!entry) return 0;
  if (Array.isArray(entry.content)) {
    return entry.content.filter((b) => b.type === "image").length;
  }
  if (Array.isArray(entry.imageUrls)) return entry.imageUrls.length;
  if (entry.imageUrl) return 1;
  return 0;
}

// render content blocks in order, falling back to legacy fields
function EntryContent({ entry }) {
  if (Array.isArray(entry.content) && entry.content.length > 0) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        {entry.content.map((block, i) => {
          if (block.type === "image") {
            return (
              <div
                key={i}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(60,35,110,0.14)",
                  background: "#fff",
                }}
              >
                <img
                  src={block.url}
                  alt={`image ${i + 1}`}
                  style={{
                    width: "100%",
                    display: "block",
                    objectFit: "contain",
                    maxHeight: 400,
                  }}
                />
              </div>
            );
          }
          if (block.type === "text" && block.value?.trim()) {
            return (
              <div key={i} className="noteBody noteBodyMarkdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {block.value}
                </ReactMarkdown>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  // legacy fallback
  const imageUrls = Array.isArray(entry.imageUrls)
    ? entry.imageUrls
    : entry.imageUrl
      ? [entry.imageUrl]
      : [];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {imageUrls.map((url, i) => (
        <div
          key={i}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid rgba(60,35,110,0.14)",
            background: "#fff",
          }}
        >
          <img
            src={url}
            alt={`image ${i + 1}`}
            style={{
              width: "100%",
              display: "block",
              objectFit: "contain",
              maxHeight: 400,
            }}
          />
        </div>
      ))}
      {entry.text?.trim() && (
        <div className="noteBody noteBodyMarkdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {entry.text}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function LogNotebookPage({ focus }) {
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [paperMode, setPaperMode] = useState(() => readPaperMode());
  const [page, setPage] = useState(0);

  const didInitRef = useRef(false);
  const notePanelRef = useRef(null);

  useEffect(() => {
    writePaperMode(paperMode);
  }, [paperMode]);

  function scrollToNote(delay = 0) {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 980) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          notePanelRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }, delay);
    }
  }

  const load = useCallback(async () => {
    setLoaded(false);
    const snap = await fetchLiveLogs();
    const list = Array.isArray(snap.entries) ? snap.entries : [];
    const sorted = [...list].sort(
      (a, b) => parseLabelScore(b.label) - parseLabelScore(a.label),
    );
    setEntries(sorted);
    setError(snap.error || "");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    queueMicrotask(() => load());
  }, [load]);

  useEffect(() => {
    const onPub = () => load();
    window.addEventListener("softcomputer-logs-published", onPub);
    return () =>
      window.removeEventListener("softcomputer-logs-published", onPub);
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      const text = String(e?.text || "").toLowerCase();
      const label = String(e?.label || "").toLowerCase();
      return text.includes(q) || label.includes(q);
    });
  }, [entries, query]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    [filtered.length],
  );
  const safePage = Math.min(page, totalPages - 1);
  const pagedEntries = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  useEffect(() => {
    if (!entries.length) return;
    queueMicrotask(() => {
      if (focus) {
        const idx = entries.findIndex((e) => e?.id === focus);
        if (idx >= 0) {
          setPage(Math.floor(idx / PAGE_SIZE));
          setActiveId(focus);
          scrollToNote(800);
          return;
        }
      }
      if (!activeId && filtered.length > 0) setActiveId(filtered[0]?.id);
    });
  }, [entries]);

  useEffect(() => {
    if (!activeId || pagedEntries.length === 0) return;
    const onPage = pagedEntries.some((e) => e?.id === activeId);
    if (!onPage) queueMicrotask(() => setActiveId(pagedEntries[0]?.id));
  }, [activeId, pagedEntries]);

  const activeEntry = useMemo(() => {
    if (!activeId) return null;
    return filtered.find((e) => e?.id === activeId) || null;
  }, [filtered, activeId]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="wrap">
      <section className="panel">
        <div className="panelTitleRow">
          <div>
            <div className="h1" style={{ marginBottom: 6 }}>
              log
            </div>
            <p className="p subtle" style={{ margin: 0 }}>
              notebook entries
            </p>
          </div>
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
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
          <div className="small subtle" style={{ whiteSpace: "nowrap" }}>
            {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>

        {error ? (
          <div className="small" style={{ marginTop: 10, opacity: 0.9 }}>
            <div style={{ marginBottom: 6 }}>failed to load entries.</div>
            <div className="small" style={{ opacity: 0.85 }}>
              {error}
            </div>
            <div style={{ marginTop: 10 }}>
              <button className="btn ghost" type="button" onClick={load}>
                retry
              </button>
            </div>
          </div>
        ) : null}
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
            {!loaded ? (
              <div className="emptyState">loading…</div>
            ) : error ? (
              <div className="emptyState">no entries loaded.</div>
            ) : filtered.length === 0 ? (
              <div className="emptyState">no entries yet.</div>
            ) : (
              pagedEntries.map((e) => {
                const isActiveRow = e?.id === activeId;
                const imgCount = getImageCount(e);
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={isActiveRow ? "entryRow active" : "entryRow"}
                    onClick={() => {
                      setActiveId(e.id);
                      scrollToNote(50);
                    }}
                    title="view notes"
                  >
                    <div className="entryRowTop">
                      <div className="chip">{e.label}</div>
                      {imgCount > 0 && (
                        <span className="small subtle">
                          📎{imgCount > 1 ? ` ${imgCount}` : ""}
                        </span>
                      )}
                    </div>
                    <div className="entryPreview">{previewText(e?.text)}</div>
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
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
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
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                next
              </button>
            </div>
          ) : null}
        </div>

        <div className="panel logCol" ref={notePanelRef}>
          <div className="panelTitleRow">
            <div className="h2">notes</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["grid", "lined", "dot"].map((m) => (
                <button
                  key={m}
                  type="button"
                  className="kbd"
                  onClick={() => setPaperMode(m)}
                  aria-pressed={paperMode === m}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {activeEntry ? (
            <article className={`notePaper is-${paperMode}`}>
              <div className="noteHeader">
                <div className="h2" style={{ margin: 0 }}>
                  {activeEntry.label}
                </div>
              </div>
              <EntryContent entry={activeEntry} />
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
