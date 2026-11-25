"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { labelScore } from "@/lib/logDates";

const PublishLogsButton = dynamic(
  () => import("@/components/PublishLogsButton"),
  { ssr: false },
);


const PAPER_MODE_KEY = "softcomputer-paper-mode";
const PAGE_SIZE = 8;

function previewText(entry, maxChars = 120) {
  // prefer content blocks for preview
  let raw = "";
  if (Array.isArray(entry?.content)) {
    const textBlock = entry.content.find(
      (b) => b.type === "text" && b.value?.trim(),
    );
    if (textBlock) raw = textBlock.value;
    else if (entry.content.some((b) => b.type === "video")) return "▶ video";
    else if (entry.content.some((b) => b.type === "image")) return "📎 image";
  }
  if (!raw) raw = entry?.text || "";
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

function getImageCount(entry) {
  if (!entry) return 0;
  if (Array.isArray(entry.content))
    return entry.content.filter((b) => b.type === "image").length;
  if (Array.isArray(entry.imageUrls)) return entry.imageUrls.length;
  if (entry.imageUrl) return 1;
  return 0;
}

function getVideoCount(entry) {
  if (!entry) return 0;
  if (Array.isArray(entry.content))
    return entry.content.filter((b) => b.type === "video").length;
  return 0;
}

function getEmbedUrl(input) {
  if (!input) return null;
  const vimeoSrc = input.match(/vimeo\.com\/video\/(\d+)/);
  if (vimeoSrc)
    return (
      "https://player.vimeo.com/video/" +
      vimeoSrc[1] +
      "?badge=0&autopause=0&player_id=0&app_id=58479"
    );
  const vimeoUrl = input.match(/vimeo\.com\/(\d+)/);
  if (vimeoUrl)
    return (
      "https://player.vimeo.com/video/" +
      vimeoUrl[1] +
      "?badge=0&autopause=0&player_id=0&app_id=58479"
    );
  const ytWatch = input.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return "https://www.youtube.com/embed/" + ytWatch[1];
  const ytShort = input.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return "https://www.youtube.com/embed/" + ytShort[1];
  const ytEmbed = input.match(/youtube\.com\/embed\/([\w-]+)/);
  if (ytEmbed) return "https://www.youtube.com/embed/" + ytEmbed[1];
  const iframeSrc = input.match(/src="([^"]+)"/);
  if (iframeSrc) return iframeSrc[1];
  if (input.startsWith("http")) return input;
  return null;
}

// one photo shows whole; three or more in a row become a grid of squares
function Photos({ urls, start = 0 }) {
  if (urls.length < 3) {
    return urls.map((url, i) => (
      <div key={url + i} className="logPhoto">
        <img src={url} alt={`image ${start + i + 1}`} />
      </div>
    ));
  }
  const cols = urls.length === 4 ? 2 : 3;
  return (
    <div className="logPhotoGrid" style={{ "--cols": cols }}>
      {urls.map((url, i) => (
        <a
          key={url + i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="logPhotoTile"
        >
          <img src={url} alt={`image ${start + i + 1}`} loading="lazy" />
        </a>
      ))}
    </div>
  );
}

// photos next to each other in an entry are shown together
function groupBlocks(content) {
  const groups = [];
  content.forEach((block, i) => {
    const last = groups[groups.length - 1];
    if (block.type === "image" && last?.type === "photos") {
      last.urls.push(block.url);
    } else if (block.type === "image") {
      groups.push({ type: "photos", urls: [block.url], start: i });
    } else {
      groups.push({ ...block, index: i });
    }
  });
  return groups;
}

function EntryContent({ entry }) {
  if (Array.isArray(entry.content) && entry.content.length > 0) {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        {groupBlocks(entry.content).map((block, i) => {
          if (block.type === "photos") {
            return <Photos key={i} urls={block.urls} start={block.start} />;
          }
          if (block.type === "video") {
            const embedUrl = getEmbedUrl(block.url);
            if (!embedUrl) return null;
            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  paddingTop: "56.25%",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(60,35,110,0.14)",
                }}
              >
                <iframe
                  src={embedUrl}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                  }}
                  title="vimeo video"
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
      <Photos urls={imageUrls} />
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
      (a, b) => labelScore(b.label) - labelScore(a.label),
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
                const vidCount = getVideoCount(e);
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
                      <div style={{ display: "flex", gap: 6 }}>
                        {vidCount > 0 && (
                          <span className="small subtle">
                            ▶{vidCount > 1 ? ` ${vidCount}` : ""}
                          </span>
                        )}
                        {imgCount > 0 && (
                          <span className="small subtle">
                            📎{imgCount > 1 ? ` ${imgCount}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="entryPreview">{previewText(e)}</div>
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
            <article className={"notePaper is-" + paperMode}>
              <div className="noteHeader">
                <div className="h2" style={{ margin: 0 }}>
                  {activeEntry.label}
                </div>
              </div>
              <EntryContent entry={activeEntry} />
            </article>
          ) : (
            <div className={"notePaper is-" + paperMode + " emptyState"}>
              select an entry to read it.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
