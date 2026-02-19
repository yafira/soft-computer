"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_LOG_TOKEN || "";

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

function stateFromPublishedEntries(entries) {
  const punched = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => false),
  );
  const logs = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => ""),
  );

  for (const e of entries || []) {
    const label = String(e?.label || "")
      .toLowerCase()
      .trim();
    const parts = label.split(/\s+/);
    if (parts.length < 2) continue;

    const mName = parts[0];
    const dNum = Number(parts[1]);

    const m = months.indexOf(mName);
    const d = Number.isFinite(dNum) ? dNum - 1 : -1;

    if (m < 0 || d < 0 || d > 30) continue;

    const text = String(e?.text || "").trim();
    logs[m][d] = text;
    punched[m][d] = text.length > 0;
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

  const [active, setActive] = useState(null);
  const [draft, setDraft] = useState("");
  const [hover, setHover] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [saving, setSaving] = useState(false);

  // live entries from Redis
  const [redisEntries, setRedisEntries] = useState(publishedEntries);

  // load from Redis on mount and after publish
  useEffect(() => {
    async function loadFromRedis() {
      try {
        const res = await fetch("/api/logs", { cache: "no-store" });
        const data = await res.json();
        const entries = Array.isArray(data?.entries) ? data.entries : [];
        setRedisEntries(entries);
      } catch {}
    }

    loadFromRedis();

    const onPub = () => loadFromRedis();
    window.addEventListener("softcomputer-logs-published", onPub);
    return () =>
      window.removeEventListener("softcomputer-logs-published", onPub);
  }, []);

  // sync when prop changes
  useEffect(() => {
    setRedisEntries(publishedEntries);
  }, [publishedEntries]);

  const viewState = useMemo(() => {
    return stateFromPublishedEntries(redisEntries);
  }, [redisEntries]);

  const geo = useMemo(() => {
    const rows = 12;
    const cols = 31;
    const W = 1200;
    const H = 520;
    const cardMarginX = 46;
    const cardMarginY = 36;
    const leftMargin = 110;
    const rightMargin = 40;
    const topMargin = 110;
    const bottomMargin = 58;
    const cardX = cardMarginX;
    const cardY = cardMarginY;
    const cardW = W - 2 * cardMarginX;
    const cardH = H - 2 * cardMarginY;
    const gridX = cardX + leftMargin;
    const gridY = cardY + topMargin;
    const gridW = cardW - leftMargin - rightMargin;
    const gridH = cardH - topMargin - bottomMargin - 28;
    const rowH = gridH / rows;
    const colW = gridW / cols;
    const slotW = colW * 0.28;
    const slotH = rowH * 0.82;

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
      setActive({ r, c });
      setDraft(viewState.logs?.[r]?.[c] || "");
    },
    [readOnly, viewState.logs],
  );

  const closeEditor = useCallback(() => {
    setActive(null);
    setDraft("");
  }, []);

  const commitSave = useCallback(async () => {
    if (readOnly) return;
    if (!active) return;
    const { r, c } = active;
    const text = draft.trim();
    if (!text) return;

    setSaving(true);

    const label = `${months[r]} ${c + 1}`;
    const id = `2026-${String(r + 1).padStart(2, "0")}-${String(c + 1).padStart(2, "0")}`;

    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ id, label, text }),
      });

      // refresh punch card immediately
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
  }, [readOnly, active, draft, closeEditor]);

  const commitDelete = useCallback(async () => {
    if (readOnly) return;
    if (!active) return;
    const { r, c } = active;
    const id = `2026-${String(r + 1).padStart(2, "0")}-${String(c + 1).padStart(2, "0")}`;

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

    setDraft("");
  }, [readOnly, active, viewState.logs]);

  const undoDelete = useCallback(async () => {
    if (readOnly) return;
    if (!lastDeleted) return;
    const { r, c, text } = lastDeleted;

    const label = `${months[r]} ${c + 1}`;
    const id = `2026-${String(r + 1).padStart(2, "0")}-${String(c + 1).padStart(2, "0")}`;

    setSaving(true);
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": ADMIN_TOKEN,
        },
        body: JSON.stringify({ id, label, text }),
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

    if (active && active.r === r && active.c === c) setDraft(text);
    setLastDeleted(null);
  }, [readOnly, lastDeleted, active]);

  useEffect(() => {
    if (readOnly) return;
    if (!active) return;

    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (e.key === "Escape") {
        e.preventDefault();
        closeEditor();
        return;
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        commitSave();
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
  }, [readOnly, active, closeEditor, commitSave, commitDelete, undoDelete]);

  // auto-open today
  useEffect(() => {
    if (readOnly) return;
    if (didAutoOpenRef.current) return;

    let m = null;
    let d = null;

    if (focusM != null && focusD != null) {
      const mm = Number(focusM);
      const dd = Number(focusD);
      if (!Number.isNaN(mm) && !Number.isNaN(dd)) {
        m = mm;
        d = dd;
      }
    }

    if (m == null || d == null) {
      const today = new Date();
      m = today.getMonth();
      d = today.getDate() - 1;
    }

    m = clamp(m, 0, 11);
    d = clamp(d, 0, 30);

    const t = setTimeout(() => {
      openEditor(m, d);
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
    const r = clamp(Math.floor((y - gridY) / rowH), 0, 11);
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
                soft computer — process memory 2026
              </text>

              {Array.from({ length: geo.cols }).map((_, c) => {
                const x = geo.gridX + c * geo.colW + geo.colW / 2;
                return (
                  <text
                    key={`day-${c}`}
                    x={x}
                    y={geo.gridY - 18}
                    className="punchDayNum"
                  >
                    {c + 1}
                  </text>
                );
              })}

              {Array.from({ length: geo.cols }).map((_, c) => {
                const x = geo.gridX + c * geo.colW + geo.colW / 2;
                return (
                  <line
                    key={`v-${c}`}
                    x1={x}
                    y1={geo.gridY - 8}
                    x2={x}
                    y2={geo.gridY + geo.gridH + 8}
                    className="punchGuide"
                  />
                );
              })}

              {Array.from({ length: geo.rows }).map((_, r) => {
                const cy = geo.gridY + r * geo.rowH + geo.rowH / 2;
                return (
                  <g key={`row-${r}`}>
                    <text
                      x={geo.gridX - 12}
                      y={cy}
                      className="punchMonth"
                      textAnchor="end"
                    >
                      {months[r]}
                    </text>
                    {Array.from({ length: geo.cols }).map((__, c) => {
                      const cx = geo.gridX + c * geo.colW + geo.colW / 2;
                      const x = cx - geo.slotW / 2;
                      const y = cy - geo.slotH / 2;
                      const isPunched = !!viewState.punched?.[r]?.[c];
                      return (
                        <rect
                          key={`slot-${r}-${c}`}
                          x={x}
                          y={y}
                          width={geo.slotW}
                          height={geo.slotH}
                          rx="3"
                          className={
                            isPunched ? "punchSlot punched" : "punchSlot"
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

              {hover ? (
                <g>
                  {(() => {
                    const raw = (
                      viewState.logs?.[hover.r]?.[hover.c] || ""
                    ).trim();
                    const shown =
                      raw.length > 72 ? `${raw.slice(0, 72)}…` : raw;
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
                      <>
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
                      </>
                    );
                  })()}
                </g>
              ) : null}
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
                {months[active.r]} {active.c + 1}
              </div>
              <div className="small subtle">
                enter = save • esc = close • cmd/ctrl+z = undo delete •
                cmd/ctrl+backspace = delete
              </div>
            </div>

            <textarea
              className="textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="write a small memory…"
              rows={3}
              autoFocus
            />

            <div className="punchEditorActions">
              <button className="btn" onClick={commitSave} disabled={saving}>
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
              storage: <span className="chip">redis</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
