// src/components/PunchCard.js
"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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
    Array.from({ length: 31 }, () => false)
  );
  const logs = Array.from({ length: 12 }, () =>
    Array.from({ length: 31 }, () => "")
  );
  return { punched, logs };
}

function loadState() {
  try {
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

export default function PunchCard() {
  const mountRef = useRef(null);
  const p5Ref = useRef(null);

  const [ready, setReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!window.p5;
  });

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ready) return;
    if (!mountRef.current) return;
    if (!window.p5) return;
    if (p5Ref.current) return;

    let state = loadState();

    const sketch = (p) => {
      const cardMarginX = 40;
      const cardMarginY = 30;

      const leftMargin = 70;
      const rightMargin = 25;
      const topMargin = 70;
      const bottomMargin = 35;

      const rows = 12;
      const cols = 31;

      let inputBox, saveBtn, cancelBtn, deleteBtn;
      let activeEdit = null;
      let hover = null;

      p.reloadFromStorage = () => {
        state = loadState();
        p.redraw();
      };

      // ✅ allow React to open a specific slot
      p.openAt = (m, d) => {
        if (m == null || d == null) return;
        if (m < 0 || m > 11) return;
        if (d < 0 || d > 30) return;
        openEditor(m, d);
      };

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

        deleteBtn = p.createButton("delete");
        deleteBtn.mousePressed(onDeleteLog);
        deleteBtn.hide();
      };

      p.draw = () => {
        hover = null;

        const bg = p.color(32, 25, 60);
        const card = p.color(232, 224, 250);
        const ink = p.color(70, 55, 120);
        const border = p.color(145, 130, 185);

        p.background(bg);

        const cardX = cardMarginX;
        const cardY = cardMarginY;
        const cardW = p.width - 2 * cardMarginX;
        const cardH = p.height - 2 * cardMarginY;

        p.noStroke();
        p.fill(card);
        p.rect(cardX, cardY, cardW, cardH, 22);

        p.fill(bg);
        p.triangle(cardX, cardY, cardX + 24, cardY, cardX, cardY + 24);

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

        const gridX = cardX + leftMargin;
        const gridY = cardY + topMargin;
        const gridW = cardW - leftMargin - rightMargin;
        const gridH = cardH - topMargin - bottomMargin - 30;

        const rowH = gridH / rows;
        const colW = gridW / cols;

        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(8);
        p.fill(ink);
        for (let c = 0; c < cols; c++) {
          const x = gridX + c * colW + colW / 2;
          p.text(String(c + 1), x, gridY - 10);
        }

        p.stroke(p.red(border), p.green(border), p.blue(border), 120);
        p.strokeWeight(0.4);
        for (let c = 0; c < cols; c++) {
          const x = gridX + c * colW + colW / 2;
          p.line(x, gridY - 4, x, gridY + gridH + 4);
        }

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

            const isHovered =
              p.mouseX >= x &&
              p.mouseX <= x + slotW &&
              p.mouseY >= y &&
              p.mouseY <= y + slotH;

            if (isHovered && (state.logs?.[r]?.[c] || "").trim().length > 0) {
              hover = { r, c, x: centerX, y: centerY };
            }

            p.stroke(border);
            p.strokeWeight(0.8);
            p.fill(state.punched[r][c] ? bg : card);
            p.rect(x, y, slotW, slotH, 2);
          }
        }

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

        if (hover) {
          const text = (state.logs?.[hover.r]?.[hover.c] || "").trim();
          if (text) {
            const shown = text.length > 64 ? text.slice(0, 64) + "…" : text;
            const pad = 7;

            p.textSize(10);
            p.textAlign(p.LEFT, p.CENTER);

            const w = p.textWidth(shown) + pad * 2;
            const h = 20;

            const bx = hover.x + 12;
            const by = hover.y - h / 2;

            p.noStroke();
            p.fill(40, 30, 80, 230);
            p.rect(bx, by, w, h, 8);

            p.fill(232, 224, 250);
            p.text(shown, bx + pad, hover.y);
          }
        }
      };

      p.mouseMoved = () => p.redraw();

      p.mousePressed = () => {
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

        const rect = p.canvas.getBoundingClientRect();
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

        deleteBtn.position(
          rect.left +
            inputX +
            inputBox.width +
            saveBtn.width +
            cancelBtn.width +
            24 +
            window.scrollX,
          rect.top + inputY + window.scrollY
        );
        deleteBtn.show();

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
        window.dispatchEvent(new Event("softcomputer-update"));

        hideEditor();
        p.redraw();
      }

      function onDeleteLog() {
        if (!activeEdit) return;

        const r = activeEdit.r;
        const c = activeEdit.c;

        state.logs[r][c] = "";
        state.punched[r][c] = false;

        saveState(state);
        window.dispatchEvent(new Event("softcomputer-update"));

        hideEditor();
        p.redraw();
      }

      function hideEditor() {
        activeEdit = null;
        inputBox.hide();
        saveBtn.hide();
        cancelBtn.hide();
        deleteBtn.hide();
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

  // ✅ route-aware reload
  useEffect(() => {
    if (pathname !== "/punch") return;
    try {
      p5Ref.current?.reloadFromStorage?.();
    } catch {}
  }, [pathname]);

  // ✅ open editor when coming from timeline (e.g. /punch?m=2&d=14)
  useEffect(() => {
    if (pathname !== "/punch") return;
    if (!ready) return;

    const m = Number(searchParams.get("m"));
    const d = Number(searchParams.get("d"));

    if (Number.isNaN(m) || Number.isNaN(d)) return;

    setTimeout(() => {
      try {
        p5Ref.current?.openAt?.(m, d);
      } catch {}
    }, 50);
  }, [pathname, searchParams, ready]);

  return (
    <div className="panel">
      <div className="h1" style={{ marginBottom: 6 }}>
        punch card
      </div>
      <p className="p">
        click a day → write a short log → saved to your browser. hover punched
        holes to preview.
      </p>

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />

      <div ref={mountRef} />

      <p className="small" style={{ marginTop: 10 }}>
        storage: <span className="kbd">{STORAGE_KEY}</span>
      </p>
    </div>
  );
}
