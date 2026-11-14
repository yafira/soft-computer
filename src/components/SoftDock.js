"use client";

import { useEffect, useRef, useState } from "react";
import s from "../app/eink.module.css";
import { BUTTONS } from "../lib/feltButtons";

// matrix pad threads, and where they sit in the drawing
const COLS = 8;
const ROWS = 6;
const PAD_X = 30;
const PAD_Y = 18;
const PAD_GAP = 16;

// the matrix pad: row and column threads crossing on a fabric square.
// it works as the presence detector, so touching it is how you get in
function Trackpad({ onTouch, gone }) {
  const [at, setAt] = useState(null);
  const dwell = useRef(null);

  function locate(e) {
    const r = e.currentTarget.getBoundingClientRect();
    const col = Math.round(((e.clientX - r.left) / r.width) * (COLS - 1));
    const row = Math.round(((e.clientY - r.top) / r.height) * (ROWS - 1));
    return {
      col: Math.min(COLS - 1, Math.max(0, col)),
      row: Math.min(ROWS - 1, Math.max(0, row)),
    };
  }

  function onMove(e) {
    const next = locate(e);
    setAt((prev) =>
      prev && prev.col === next.col && prev.row === next.row ? prev : next,
    );
  }

  function onEnter() {
    clearTimeout(dwell.current);
    dwell.current = setTimeout(onTouch, 450);
  }

  function onLeave() {
    clearTimeout(dwell.current);
    setAt(null);
  }

  useEffect(() => () => clearTimeout(dwell.current), []);

  const x = (c) => PAD_X + c * PAD_GAP;
  const y = (r) => PAD_Y + r * PAD_GAP;
  const right = x(COLS - 1);
  const bottom = y(ROWS - 1);

  return (
    <div className={s.pad + (gone ? " " + s.padGone : "")}>
      <svg
        viewBox={"0 0 " + (right + PAD_X) + " " + (bottom + PAD_Y + 14)}
        className={s.padSvg}
        aria-hidden="true"
      >
        <rect
          x="14"
          y="3"
          width={right + PAD_X - 17}
          height={bottom + PAD_Y - 6}
          rx="10"
          className={s.padCloth}
        />
        <rect
          x="19"
          y="8"
          width={right + PAD_X - 27}
          height={bottom + PAD_Y - 16}
          rx="7"
          className={s.padStitch}
        />
        {Array.from({ length: ROWS }, (_, r) => (
          <path
            key={"r" + r}
            d={"M2 " + (y(r) + 3) + " Q 12 " + y(r) + " " + x(0) + " " + y(r) + " H " + right}
            className={
              s.rowThread + (at && at.row === r ? " " + s.threadOn : "")
            }
          />
        ))}
        {Array.from({ length: COLS }, (_, c) => (
          <path
            key={"c" + c}
            d={"M" + x(c) + " " + y(0) + " V " + bottom + " Q " + x(c) + " " + (bottom + 14) + " " + (x(c) - 4) + " " + (bottom + PAD_Y + 12)}
            className={
              s.colThread + (at && at.col === c ? " " + s.threadOn : "")
            }
          />
        ))}
        {at && <circle cx={x(at.col)} cy={y(at.row)} r="6" className={s.padTouch} />}
      </svg>
      <button
        type="button"
        className={s.padHit}
        aria-label="touch the pad"
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerDown={(e) => {
          onMove(e);
          clearTimeout(dwell.current);
          onTouch();
        }}
        onPointerLeave={onLeave}
      />
      <span className={s.padLabel}>matrix pad</span>
    </div>
  );
}

// the bottom of the frame: matrix pad, felt buttons, and whatever sits on the right
// padGone: on phones the pad leaves once it has been touched, to give the screen more room
export default function SoftDock({ active, onPress, onTouch, side, padGone }) {
  return (
    <footer className={s.dock + (padGone ? " " + s.dockNoPad : "")}>
      <Trackpad onTouch={onTouch} gone={padGone} />
      <div className={s.felts}>
        {Object.entries(BUTTONS).map(([key, b]) => (
          <button
            key={key}
            type="button"
            className={s.felt + (active === key ? " " + s.feltOn : "")}
            onClick={() => onPress(key)}
            aria-pressed={active === key}
          >
            <span
              className={s.feltPad}
              style={{
                background: b.bg,
                borderColor: b.dot,
                boxShadow:
                  "0 3px 0 " + b.shadow + ", 0 6px 14px rgba(40,40,40,0.12)",
              }}
            />
            <span className={s.feltLabel}>{b.label}</span>
          </button>
        ))}
      </div>
      <div className={s.side}>{side}</div>
    </footer>
  );
}
