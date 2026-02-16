"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PublishLogsButton from "@/components/PublishLogsButton";

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

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus) {
      setActiveId(focus);
      return;
    }
    if (!activeId && filtered.length > 0) setActiveId(filtered[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filtered]);

  const activeEntry = useMemo(() => {
    if (!activeId) return null;
    return filtered.find((e) => e.id === activeId) || null;
  }, [filtered, activeId]);

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

          {/* optional: keep this button for you while you’re publishing */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <PublishLogsButton />
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
            {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
          </div>
        </div>
      </section>

      <section className="logGrid">
        {/* left: entries list */}
        <div className="panel logCol">
          <div className="panelTitleRow">
            <div className="h2">entries</div>
          </div>

          <div className="entryList">
            {filtered.length === 0 ? (
              <div className="emptyState">no published entries yet.</div>
            ) : (
              filtered.map((e) => {
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

        {/* right: notes */}
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
