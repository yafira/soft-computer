"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_LOG_TOKEN || "";

const MONTHS = [
  { label: "sep", year: 2025 },
  { label: "oct", year: 2025 },
  { label: "nov", year: 2025 },
  { label: "dec", year: 2025 },
  { label: "jan", year: 2026 },
  { label: "feb", year: 2026 },
  { label: "mar", year: 2026 },
  { label: "apr", year: 2026 },
  { label: "may", year: 2026 },
];

function makeId(r, c) {
  const { label, year } = MONTHS[r];
  return `${label}-${year}-${String(c + 1).padStart(2, "0")}`;
}

function makeEntryLabel(r, c) {
  return `${MONTHS[r].label} ${c + 1}`;
}

function newTextBlock(value = "") {
  return { id: crypto.randomUUID(), type: "text", value };
}

function newImageBlock(url) {
  return { id: crypto.randomUUID(), type: "image", url };
}

function stripIds(blocks) {
  return blocks.map(({ id: _id, ...rest }) => rest);
}

function entryToBlocks(entry) {
  if (!entry) return [newTextBlock()];
  if (Array.isArray(entry.content) && entry.content.length > 0) {
    return entry.content.map((b) => ({ ...b, id: crypto.randomUUID() }));
  }
  const blocks = [];
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  if (text) blocks.push(newTextBlock(text));
  const urls = Array.isArray(entry.imageUrls)
    ? entry.imageUrls
    : entry.imageUrl
      ? [entry.imageUrl]
      : [];
  for (const url of urls) {
    if (url) blocks.push(newImageBlock(url));
  }
  return blocks.length > 0 ? blocks : [newTextBlock()];
}

function stateFromPublishedEntries(entries) {
  const rows = MONTHS.length;
  const punched = Array.from({ length: rows }, () =>
    Array.from({ length: 31 }, () => false),
  );
  const logs = Array.from({ length: rows }, () =>
    Array.from({ length: 31 }, () => ""),
  );
  for (const e of entries || []) {
    const raw = String(e?.label || "")
      .toLowerCase()
      .trim();
    const parts = raw.split(/\s+/);
    if (parts.length < 2) continue;
    const r = MONTHS.findIndex((m) => m.label === parts[0]);
    const d = Number(parts[1]) - 1;
    if (r < 0 || d < 0 || d > 30) continue;
    const text = String(e?.text || "").trim();
    logs[r][d] = text;
    punched[r][d] = text.length > 0;
  }
  return { punched, logs };
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function PunchCard({
  readOnly = false,
  publishedEntries = [],
  focusM = null,
  focusD = null,
}) {
  const containerRef = useRef(null);
  const didAutoOpenRef = useRef(false);
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const [active, setActive] = useState(null);
  const [blocks, setBlocks] = useState([newTextBlock()]);
  const [uploading, setUploading] = useState(false);
  const [hover, setHover] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [saving, setSaving] = useState(false);
  const [redisEntries, setRedisEntries] = useState(publishedEntries);

  useEffect(() => {
    async function loadFromRedis() {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const data = await res.json();
        setRedisEntries(Array.isArray(data?.entries) ? data.entries : []);
      } catch {}
    }
    loadFromRedis();
    const onPub = () => loadFromRedis();
    window.addEventListener("softcomputer-logs-published", onPub);
    return () =>
      window.removeEventListener("softcomputer-logs-published", onPub);
  }, []);

  useEffect(() => {
    setRedisEntries(publishedEntries);
  }, [publishedEntries]);

  const viewState = useMemo(
    () => stateFromPublishedEntries(redisEntries),
    [redisEntries],
  );

  const geo = useMemo(() => {
    const rows = MONTHS.length;
    const cols = 31;
    const W = 1200,
      H = 460;
    const cardMarginX = 46,
      cardMarginY = 36;
    const leftMargin = 110,
      rightMargin = 40,
      topMargin = 110,
      bottomMargin = 58;
    const cardX = cardMarginX,
      cardY = cardMarginY;
    const cardW = W - 2 * cardMarginX,
      cardH = H - 2 * cardMarginY;
    const gridX = cardX + leftMargin,
      gridY = cardY + topMargin;
    const gridW = cardW - leftMargin - rightMargin;
    const gridH = cardH - topMargin - bottomMargin - 28;
    const rowH = gridH / rows,
      colW = gridW / cols;
    const slotW = colW * 0.28,
      slotH = rowH * 0.72;
    return {
      rows,
      cols,
      W,
      H,
      cardX,
      cardY,
      cardW,
      cardH,
      gridX,
      gridY,
      gridW,
      gridH,
      rowH,
      colW,
      slotW,
      slotH,
    };
  }, []);

  const openEditor = useCallback(
    (r, c) => {
      if (readOnly) return;
      const label = makeEntryLabel(r, c);
      const existing = redisEntries.find(
        (e) =>
          String(e?.label || "")
            .toLowerCase()
            .trim() === label.toLowerCase(),
      );
      setActive({ r, c });
      setBlocks(entryToBlocks(existing));
    },
    [readOnly, redisEntries],
  );

  const closeEditor = useCallback(() => {
    setActive(null);
    setBlocks([newTextBlock()]);
  }, []);

  // block mutations
  function updateBlock(id, patch) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  function removeBlock(id) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      return next.length === 0 ? [newTextBlock()] : next;
    });
  }

  function addTextBlock() {
    setBlocks((prev) => [...prev, newTextBlock()]);
  }

  async function onImagePick(file) {
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(`logs/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob",
      });
      setBlocks((prev) => [...prev, newImageBlock(blob.url)]);
    } catch (e) {
      console.error("image upload failed", e);
    } finally {
      setUploading(false);
    }
  }

  // drag reorder
  function onDragStart(i) {
    dragIdx.current = i;
  }
  function onDragEnter(i) {
    dragOverIdx.current = i;
  }
  function onDragEnd() {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from == null || to == null || from === to) {
      dragIdx.current = null;
      dragOverIdx.current = null;
      return;
    }
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIdx.current = null;
    dragOverIdx.current = null;
  }

  function moveBlock(i, dir) {
    const to = i + dir;
    if (to < 0 || to >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(i, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const hasContent = useMemo(() => {
    return blocks.some((b) =>
      b.type === "text" ? b.value.trim().length > 0 : !!b.url,
    );
  }, [blocks]);

  const commitSave = useCallback(async () => {
    if (readOnly || !active || !hasContent) return;
    const { r, c } = active;
    setSaving(true);
    const label = makeEntryLabel(r, c);
    const id = makeId(r, c);
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ id, label, content: stripIds(blocks) }),
      });
      const res = await fetch("/api/logs", { cache: "no-store" });
      const data = await res.json();
      setRedisEntries(Array.isArray(data?.entries) ? data.entries : []);
      window.dispatchEvent(new Event("softcomputer-logs-published"));
    } catch (e) {
      console.error("save failed", e);
    } finally {
      setSaving(false);
    }
    closeEditor();
  }, [readOnly, active, blocks, hasContent, closeEditor]);

  const commitDelete = useCallback(async () => {
    if (readOnly || !active) return;
    const { r, c } = active;
    const id = makeId(r, c);
    const prevText = (viewState.logs?.[r]?.[c] || "").trim();
    setLastDeleted(prevText ? { r, c, text: prevText } : null);
    setSaving(true);
    try {
      await fetch("/api/logs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ id }),
      });
      const res = await fetch("/api/logs", { cache: "no-store" });
      const data = await res.json();
      setRedisEntries(Array.isArray(data?.entries) ? data.entries : []);
      window.dispatchEvent(new Event("softcomputer-logs-published"));
    } catch (e) {
      console.error("delete failed", e);
    } finally {
      setSaving(false);
    }
    setBlocks([newTextBlock()]);
  }, [readOnly, active, viewState.logs]);

  const undoDelete = useCallback(async () => {
    if (readOnly || !lastDeleted) return;
    const { r, c, text } = lastDeleted;
    const label = makeEntryLabel(r, c);
    const id = makeId(r, c);
    setSaving(true);
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({
          id,
          label,
          content: [{ type: "text", value: text }],
        }),
      });
      const res = await fetch("/api/logs", { cache: "no-store" });
      const data = await res.json();
      setRedisEntries(Array.isArray(data?.entries) ? data.entries : []);
      window.dispatchEvent(new Event("softcomputer-logs-published"));
    } catch (e) {
      console.error("undo failed", e);
    } finally {
      setSaving(false);
    }
    if (active && active.r === r && active.c === c)
      setBlocks([newTextBlock(text)]);
    setLastDeleted(null);
  }, [readOnly, lastDeleted, active]);

  useEffect(() => {
    if (readOnly || !active) return;
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") {
        e.preventDefault();
        closeEditor();
        return;
      }
      if ((e.key === "Backspace" || e.key === "Delete") && meta) {
        e.preventDefault();
        commitDelete();
        return;
      }
      if (meta && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        undoDelete();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKey, { capture: true });
  }, [readOnly, active, closeEditor, commitDelete, undoDelete]);

  useEffect(() => {
    if (readOnly || didAutoOpenRef.current) return;
    const today = new Date();
    const todayMonth = today
      .toLocaleString("en", { month: "short" })
      .toLowerCase();
    const todayYear = today.getFullYear();
    let r = MONTHS.findIndex(
      (m) => m.label === todayMonth && m.year === todayYear,
    );
    if (r < 0) r = MONTHS.length - 1;
    let d = clamp(today.getDate() - 1, 0, 30);
    if (focusM != null && focusD != null) {
      const mm = Number(focusM),
        dd = Number(focusD);
      if (!Number.isNaN(mm) && !Number.isNaN(dd)) {
        r = clamp(mm, 0, MONTHS.length - 1);
        d = clamp(dd, 0, 30);
      }
    }
    const t = setTimeout(() => {
      openEditor(r, d);
      didAutoOpenRef.current = true;
    }, 140);
    return () => clearTimeout(t);
  }, [readOnly, focusM, focusD, openEditor]);

  function pointToCell(clientX, clientY) {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * geo.W;
    const y = ((clientY - rect.top) / rect.height) * geo.H;
    const { gridX, gridY, gridW, gridH, colW, rowH } = geo;
    if (x < gridX || x > gridX + gridW || y < gridY || y > gridY + gridH)
      return null;
    const c = clamp(Math.floor((x - gridX) / colW), 0, 30);
    const r = clamp(Math.floor((y - gridY) / rowH), 0, MONTHS.length - 1);
    return { r, c, x, y };
  }

  function onMove(e) {
    const hit = pointToCell(e.clientX, e.clientY);
    if (!hit) {
      setHover(null);
      return;
    }
    const text = (viewState.logs?.[hit.r]?.[hit.c] || "").trim();
    if (!text) {
      setHover(null);
      return;
    }
    setHover(hit);
  }

  function onClick(e) {
    if (readOnly) return;
    const hit = pointToCell(e.clientX, e.clientY);
    if (!hit) return;
    openEditor(hit.r, hit.c);
  }

  return (
    <div className="punchWrap">
      <div className="punchStack">
        <div
          className="punchCanvas"
          ref={containerRef}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          onClick={onClick}
          role="button"
          tabIndex={0}
          aria-label="punch card"
          suppressHydrationWarning
        >
          <svg
            viewBox={`0 0 ${geo.W} ${geo.H}`}
            width="100%"
            height="100%"
            className="punchSvg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <clipPath id="punchCardClip">
                <path
                  d={`M ${geo.cardX + 24} ${geo.cardY} H ${geo.cardX + geo.cardW} V ${geo.cardY + geo.cardH} H ${geo.cardX} V ${geo.cardY + 24} Z`}
                />
              </clipPath>
            </defs>
            <g clipPath="url(#punchCardClip)">
              <rect
                x={geo.cardX}
                y={geo.cardY}
                width={geo.cardW}
                height={geo.cardH}
                rx="26"
                className="punchCard"
              />
              <path
                d={`M ${geo.cardX} ${geo.cardY} L ${geo.cardX + 34} ${geo.cardY} L ${geo.cardX} ${geo.cardY + 34} Z`}
                className="punchNotch"
              />
              <text
                x={geo.cardX + 36}
                y={geo.cardY + 40}
                className="punchTitle"
              >
                soft computer — process memory 2025–2026
              </text>

              {Array.from({ length: geo.cols }).map((_, c) => (
                <text
                  key={`day-${c}`}
                  x={geo.gridX + c * geo.colW + geo.colW / 2}
                  y={geo.gridY - 18}
                  className="punchDayNum"
                >
                  {c + 1}
                </text>
              ))}
              {Array.from({ length: geo.cols }).map((_, c) => (
                <line
                  key={`v-${c}`}
                  x1={geo.gridX + c * geo.colW + geo.colW / 2}
                  y1={geo.gridY - 8}
                  x2={geo.gridX + c * geo.colW + geo.colW / 2}
                  y2={geo.gridY + geo.gridH + 8}
                  className="punchGuide"
                />
              ))}

              {MONTHS.map(({ label }, r) => {
                const cy = geo.gridY + r * geo.rowH + geo.rowH / 2;
                return (
                  <g key={`row-${r}`}>
                    <text
                      x={geo.gridX - 12}
                      y={cy}
                      className="punchMonth"
                      textAnchor="end"
                    >
                      {label}
                    </text>
                    {Array.from({ length: geo.cols }).map((__, c) => {
                      const cx = geo.gridX + c * geo.colW + geo.colW / 2;
                      return (
                        <rect
                          key={`slot-${r}-${c}`}
                          x={cx - geo.slotW / 2}
                          y={cy - geo.slotH / 2}
                          width={geo.slotW}
                          height={geo.slotH}
                          rx="3"
                          className={
                            viewState.punched?.[r]?.[c]
                              ? "punchSlot punched"
                              : "punchSlot"
                          }
                        />
                      );
                    })}
                  </g>
                );
              })}

              <g
                transform={`translate(${geo.cardX + geo.cardW - 290}, ${geo.cardY + geo.cardH - 44})`}
              >
                <rect
                  x="0"
                  y="6"
                  width="12"
                  height="22"
                  rx="3"
                  className="legendSwatch punched"
                />
                <text x="20" y="22" className="legendText">
                  memory written
                </text>
                <rect
                  x="150"
                  y="6"
                  width="12"
                  height="22"
                  rx="3"
                  className="legendSwatch"
                />
                <text x="170" y="22" className="legendText">
                  empty
                </text>
              </g>

              {hover &&
                (() => {
                  const raw = (
                    viewState.logs?.[hover.r]?.[hover.c] || ""
                  ).trim();
                  const shown = raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
                  const tx = clamp(
                    hover.x + 20,
                    geo.cardX + 22,
                    geo.cardX + geo.cardW - 420,
                  );
                  const ty = clamp(
                    hover.y - 14,
                    geo.cardY + 108,
                    geo.cardY + geo.cardH - 88,
                  );
                  return (
                    <g>
                      <rect
                        x={tx}
                        y={ty}
                        width="400"
                        height="34"
                        rx="10"
                        className="tooltip"
                      />
                      <text x={tx + 12} y={ty + 22} className="tooltipText">
                        {shown}
                      </text>
                    </g>
                  );
                })()}
            </g>
            <path
              d={`M ${geo.cardX + 24} ${geo.cardY} H ${geo.cardX + geo.cardW} V ${geo.cardY + geo.cardH} H ${geo.cardX} V ${geo.cardY + 24} Z`}
              className="punchCardCutStroke"
            />
          </svg>
        </div>

        {!readOnly && active ? (
          <div className="punchEditorBlock">
            <div className="punchEditorHeader">
              <div className="chip">
                {MONTHS[active.r].label} {active.c + 1}
              </div>
              <div className="small subtle">
                esc = close • cmd/ctrl+backspace = delete • cmd/ctrl+z = undo
              </div>
            </div>

            {/* block composer */}
            <div style={{ display: "grid", gap: 8 }}>
              {blocks.map((block, i) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => onDragStart(i)}
                  onDragEnter={() => onDragEnter(i)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    display: "grid",
                    gap: 6,
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid rgba(60,35,110,0.12)",
                    background: "rgba(255,255,255,0.6)",
                    cursor: "grab",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="small subtle"
                      style={{ userSelect: "none" }}
                    >
                      ⠿ {block.type === "text" ? "text" : "image"}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 7px" }}
                        disabled={i === 0}
                        onClick={() => moveBlock(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 7px" }}
                        disabled={i === blocks.length - 1}
                        onClick={() => moveBlock(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        style={{ padding: "2px 7px" }}
                        onClick={() => removeBlock(block.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {block.type === "text" ? (
                    <textarea
                      className="textarea"
                      rows={4}
                      placeholder="write a small memory… (markdown supported)"
                      value={block.value}
                      onChange={(e) =>
                        updateBlock(block.id, { value: e.target.value })
                      }
                      style={{ resize: "vertical" }}
                      autoFocus={i === 0}
                    />
                  ) : (
                    <div
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid rgba(60,35,110,0.1)",
                      }}
                    >
                      <img
                        src={block.url}
                        alt="block image"
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                          display: "block",
                          background: "#fff",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* add block controls */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: 4,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn ghost"
                onClick={addTextBlock}
              >
                + text block
              </button>
              <label
                className="btn ghost"
                style={{
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? "uploading…" : "+ image"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(e) => onImagePick(e.target.files?.[0])}
                />
              </label>
            </div>

            <div className="punchEditorActions">
              <button
                className="btn"
                onClick={commitSave}
                disabled={saving || uploading || !hasContent}
              >
                {saving ? "saving…" : "save"}
              </button>
              <button
                className="btn ghost"
                onClick={closeEditor}
                disabled={saving}
              >
                close
              </button>
              <button
                className="btn danger"
                onClick={commitDelete}
                disabled={saving}
              >
                delete
              </button>
              {lastDeleted ? (
                <button className="btn" onClick={undoDelete} disabled={saving}>
                  undo delete
                </button>
              ) : null}
            </div>

            <div className="small subtle" style={{ marginTop: 10 }}>
              storage: <span className="chip">redis + vercel blob</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
