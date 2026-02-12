"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export default function PunchCard() {
  const searchParams = useSearchParams();

  const containerRef = useRef(null);
  const didAutoOpenRef = useRef(false);

  const [active, setActive] = useState(null); // { r, c }
  const [draft, setDraft] = useState("");
  const [hover, setHover] = useState(null); // { r, c, x, y }
  const [lastDeleted, setLastDeleted] = useState(null);
  const [state, setState] = useState(() => emptyState());

  // load storage after hydration (avoids mismatch + turbopack warning)
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

  // live updates (no mounted dependency)
  useEffect(() => {
    const onUpdate = () => setState(loadState());
    window.addEventListener("softcomputer-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("softcomputer-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

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

  function openEditor(r, c) {
    setActive({ r, c });
    setDraft(state.logs?.[r]?.[c] || "");
  }

  function closeEditor() {
    setActive(null);
    setDraft("");
  }

  function commitSave() {
    if (!active) return;
    const { r, c } = active;

    const next = loadState();
    const text = draft.trim();

    next.logs[r][c] = text;
    next.punched[r][c] = text.length > 0;

    saveState(next);
    setState(next);
    window.dispatchEvent(new Event("softcomputer-update"));

    closeEditor();
  }

  function commitDelete() {
    if (!active) return;
    const { r, c } = active;

    const next = loadState();
    const prevText = (next.logs?.[r]?.[c] || "").trim();
    const prevPunched = !!next.punched?.[r]?.[c];

    setLastDeleted(
      prevText.length || prevPunched
        ? { r, c, text: prevText, punched: prevPunched }
        : null,
    );

    next.logs[r][c] = "";
    next.punched[r][c] = false;

    saveState(next);
    setState(next);
    window.dispatchEvent(new Event("softcomputer-update"));

    setDraft("");
  }

  function undoDelete() {
    if (!lastDeleted) return;
    const { r, c, text, punched } = lastDeleted;

    const next = loadState();
    next.logs[r][c] = text;
    next.punched[r][c] = punched;

    saveState(next);
    setState(next);
    window.dispatchEvent(new Event("softcomputer-update"));

    if (active && active.r === r && active.c === c) setDraft(text);
    setLastDeleted(null);
  }

  useEffect(() => {
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

      if (e.key === "Backspace" || e.key === "Delete") {
        if (meta) {
          e.preventDefault();
          commitDelete();
        }
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
  }, [active, lastDeleted, draft]);

  // auto-open on first visit (client-only)
  useEffect(() => {
    if (didAutoOpenRef.current) return;

    const mParam = searchParams.get("m");
    const dParam = searchParams.get("d");

    let m;
    let d;

    if (mParam != null && dParam != null) {
      m = Number(mParam);
      d = Number(dParam);
      if (Number.isNaN(m) || Number.isNaN(d)) {
        m = null;
        d = null;
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
  }, [searchParams]);

  function pointToCell(clientX, clientY) {
    const el = containerRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * geo.W;
    const y = ((clientY - rect.top) / rect.height) * geo.H;

    const { gridX, gridY, gridW, gridH, colW, rowH } = geo;

    if (x < gridX || x > gridX + gridW || y < gridY || y > gridY + gridH) {
      return null;
    }

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
    const text = (state.logs?.[hit.r]?.[hit.c] || "").trim();
    if (!text) {
      setHover(null);
      return;
    }
    setHover(hit);
  }

  function onClick(e) {
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
                  d={`
                    M ${geo.cardX + 24} ${geo.cardY}
                    H ${geo.cardX + geo.cardW}
                    V ${geo.cardY + geo.cardH}
                    H ${geo.cardX}
                    V ${geo.cardY + 24}
                    Z
                  `}
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
                d={`M ${geo.cardX} ${geo.cardY} L ${geo.cardX + 34} ${
                  geo.cardY
                } L ${geo.cardX} ${geo.cardY + 34} Z`}
                className="punchNotch"
              />

              <text
                x={geo.cardX + 36}
                y={geo.cardY + 40}
                className="punchTitle"
              >
                soft computer — process memory 2026
              </text>
              <text x={geo.cardX + 36} y={geo.cardY + 64} className="punchHint">
                click a slot to write memory for that day
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

                      const isPunched = !!state.punched?.[r]?.[c];

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
                transform={`translate(${geo.cardX + geo.cardW - 290}, ${
                  geo.cardY + geo.cardH - 44
                })`}
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
                    const raw = (state.logs?.[hover.r]?.[hover.c] || "").trim();
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

            {/* outline stroke to sell the cut corner */}
            <path
              d={`
                M ${geo.cardX + 24} ${geo.cardY}
                H ${geo.cardX + geo.cardW}
                V ${geo.cardY + geo.cardH}
                H ${geo.cardX}
                V ${geo.cardY + 24}
                Z
              `}
              className="punchCardCutStroke"
            />
          </svg>
        </div>

        {active ? (
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
              <button className="btn" onClick={commitSave}>
                save
              </button>
              <button className="btn ghost" onClick={closeEditor}>
                close
              </button>
              <button className="btn danger" onClick={commitDelete}>
                delete
              </button>
              {lastDeleted ? (
                <button className="btn" onClick={undoDelete}>
                  undo delete
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
