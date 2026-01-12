"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "softcomputer_process_2026";

// month index -> label
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
    Array.from({ length: 31 }, () => false)
  );
  const logs = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => "")
  );
  return { punched, logs };
}

function loadState() {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    // basic shape check
    if (!parsed?.punched || !parsed?.logs) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function PunchCard() {
  const mountRef = useRef(null);
  const p5Ref = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!mountRef.current) return;
    if (!window.p5) return;

    // avoid double-mount in dev
    if (p5Ref.current) return;

    const state = loadState();

    const sketch = (p) => {
      // layout
      const cardMarginX = 40;
      const cardMarginY = 30;

      const leftMargin = 70;
      const rightMargin = 25;
      const topMargin = 70;
      const bottomMargin = 35;

      const rows = 12;
      const cols = 31;

      // ui (p5 dom)
      let inputBox, saveBtn, cancelBtn;
      let activeEdit = null; // { r, c }

      p.setup = () => {
        p.createCanvas(800, 360).parent(mountRef.current);
        p.noLoop();

        inputBox = p.createInput("");
        inputBox.size(320);
        inputBox.hide();

        saveBtn = p.createButton("save");
        saveBtn.mousePressed(onSaveLog);
        saveBtn.hide();

        cancelBtn = p.createButton("cancel");
        cancelBtn.mousePressed(hideEditor);
        cancelBtn.hide();
      };

      p.draw = () => {
        // purple palette
        const bg = p.color(32, 25, 60);
        const card = p.color(232, 224, 250);
        const ink = p.color(70, 55, 120);
        const border = p.color(145, 130, 185);

        p.background(bg);

        // card geometry
        const cardX = cardMarginX;
        const cardY = cardMarginY;
        const cardW = p.width - 2 * cardMarginX;
        const cardH = p.height - 2 * cardMarginY;

        // base
        p.noStroke();
        p.fill(card);
        p.rect(cardX, cardY, cardW, cardH, 22);

        // clipped corner
        p.fill(bg);
        p.triangle(cardX, cardY, cardX + 24, cardY, cardX, cardY + 24);

        // title
        p.fill(ink);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(15);
        p.text("soft computer — process memory 2026", cardX + 26, cardY + 22);

        p.textSize(10);
        p.text(
          "click a slot to “write to memory” for that day",
          cardX + 26,
          cardY + 40
        );

        // grid area (leave strip space)
        const gridX = cardX + leftMargin;
        const gridY = cardY + topMargin;
        const gridW = cardW - leftMargin - rightMargin;
        const gridH = cardH - topMargin - bottomMargin - 30;

        const rowH = gridH / rows;
        const colW = gridW / cols;

        // day numbers
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(8);
        p.fill(ink);
        for (let c = 0; c < cols; c++) {
          const x = gridX + c * colW + colW / 2;
          p.text(String(c + 1), x, gridY - 10);
        }

        // faint guides
        p.stroke(p.red(border), p.green(border), p.blue(border), 120);
        p.strokeWeight(0.4);
        for (let c = 0; c < cols; c++) {
          const x = gridX + c * colW + colW / 2;
          p.line(x, gridY - 4, x, gridY + gridH + 4);
        }

        // slots
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(10);

        for (let r = 0; r < rows; r++) {
          const centerY = gridY + r * rowH + rowH / 2;

          p.noStroke();
          p.fill(ink);
          p.text(months[r], gridX - 8, centerY);

          for (let c = 0; c < cols; c++) {
            const centerX = gridX + c * colW + colW / 2;

            const slotW = colW * 0.25;
            const slotH = rowH * 0.8;
            const x = centerX - slotW / 2;
            const y = centerY - slotH / 2;

            p.stroke(border);
            p.strokeWeight(0.8);

            if (state.punched[r][c]) p.fill(bg);
            else p.fill(card);

            p.rect(x, y, slotW, slotH, 2);
          }
        }

        // bottom-left label (for the editor)
        if (activeEdit) {
          p.noStroke();
          p.fill(ink);
          p.textAlign(p.LEFT, p.CENTER);
          p.textSize(9);
          p.text(
            `editing: ${months[activeEdit.r]} ${activeEdit.c + 1}`,
            cardX + 26,
            cardY + cardH - 24
          );
        }

        // key bottom-right (as before)
        const legendX = cardX + cardW - 210;
        const legendY = cardY + cardH - 24;

        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(9);

        p.stroke(border);
        p.strokeWeight(0.8);
        p.fill(bg);
        p.rect(legendX, legendY - 6, 8, 16, 2);

        p.noStroke();
        p.fill(ink);
        p.text("memory written", legendX + 22, legendY);

        p.stroke(border);
        p.strokeWeight(0.8);
        p.fill(card);
        p.rect(legendX + 120, legendY - 6, 8, 16, 2);

        p.noStroke();
        p.fill(ink);
        p.text("empty", legendX + 142, legendY);
      };

      p.mousePressed = () => {
        // compute grid geometry (must match draw)
        const cardX = cardMarginX;
        const cardY = cardMarginY;
        const cardW = p.width - 2 * cardMarginX;
        const cardH = p.height - 2 * cardMarginY;

        const gridX = cardX + leftMargin;
        const gridY = cardY + topMargin;
        const gridW = cardW - leftMargin - rightMargin;
        const gridH = cardH - topMargin - bottomMargin - 30;

        const rowH = gridH / rows;
        const colW = gridW / cols;

        for (let r = 0; r < rows; r++) {
          const centerY = gridY + r * rowH + rowH / 2;
          const slotH = rowH * 0.8;

          for (let c = 0; c < cols; c++) {
            const centerX = gridX + c * colW + colW / 2;
            const slotW = colW * 0.25;

            const x1 = centerX - slotW / 2;
            const x2 = centerX + slotW / 2;
            const y1 = centerY - slotH / 2;
            const y2 = centerY + slotH / 2;

            if (
              p.mouseX >= x1 &&
              p.mouseX <= x2 &&
              p.mouseY >= y1 &&
              p.mouseY <= y2
            ) {
              openEditor(r, c);
              return;
            }
          }
        }
      };

      function openEditor(r, c) {
        activeEdit = { r, c };
        inputBox.value(state.logs[r][c] || "");

        // bottom-left editor placement
        const canvasEl = p.canvas;
        const rect = canvasEl.getBoundingClientRect();

        const cardX = cardMarginX;
        const cardY = cardMarginY;
        const cardH = p.height - 2 * cardMarginY;

        const inputX = cardX + 26;
        const inputY = cardY + cardH - 40;

        inputBox.position(
          rect.left + inputX + window.scrollX,
          rect.top + inputY + window.scrollY
        );
        inputBox.show();
        inputBox.elt.focus();

        saveBtn.position(
          rect.left + inputX + inputBox.width + 8 + window.scrollX,
          rect.top + inputY + window.scrollY
        );
        saveBtn.show();

        cancelBtn.position(
          rect.left +
            inputX +
            inputBox.width +
            saveBtn.width +
            16 +
            window.scrollX,
          rect.top + inputY + window.scrollY
        );
        cancelBtn.show();

        p.redraw();
      }

      function onSaveLog() {
        if (!activeEdit) return;
        const r = activeEdit.r;
        const c = activeEdit.c;

        const text = inputBox.value().trim();
        state.logs[r][c] = text;
        state.punched[r][c] = text.length > 0;

        saveState(state);
        hideEditor();
        p.redraw();
      }

      function hideEditor() {
        activeEdit = null;
        inputBox.hide();
        saveBtn.hide();
        cancelBtn.hide();
      }
    };

    p5Ref.current = new window.p5(sketch);

    return () => {
      try {
        p5Ref.current?.remove();
      } catch {}
      p5Ref.current = null;
    };
  }, [ready]);

  return (
    <div className="panel">
      <div className="h1" style={{ marginBottom: 6 }}>
        punch card
      </div>
      <p className="p">
        click a day → write a short log → saved to your browser. later this
        becomes the timeline.
      </p>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />

      <div ref={mountRef} />

      <p className="small" style={{ marginTop: 10 }}>
        storage: <span className="kbd">{STORAGE_KEY}</span>
      </p>
    </div>
  );
}
