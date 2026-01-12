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
  const mParam = searchParams.get("m");
  const dParam = searchParams.get("d");

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

      let inputBox;
      let activeEdit = null;
      let hover = null;

      // undo buffer for last delete: { r, c, text, punched }
      let lastDeleted = null;

      // keyboard shortcut handler attached while editor open
      let windowKeyHandler = null;

      p.reloadFromStorage = () => {
        state = loadState();
        p.redraw();
      };

      // allow React to open a specific slot
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
        inputBox.size(380);
        inputBox.hide();
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
          "click a slot to write memory for that day",
          cardX + 26,
          cardY + 40
        );

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

        // faint vertical lines
        p.stroke(p.red(border), p.green(border), p.blue(border), 120);
        p.strokeWeight(0.4);
        for (let c = 0; c < cols; c++) {
          const x = gridX + c * colW + colW / 2;
          p.line(x, gridY - 4, x, gridY + gridH + 4);
        }

        // months + slots
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

        // status line (no popups, just subtle help)
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

          p.textAlign(p.RIGHT, p.CENTER);
          p.textSize(9);

          const undoHint = lastDeleted ? "  cmd/ctrl+z=undo" : "";
        }

        // legend
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

        // hover preview
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

      function attachShortcuts() {
        detachShortcuts();

        windowKeyHandler = (e) => {
          if (!activeEdit) return;

          // esc = close
          if (e.key === "Escape") {
            e.preventDefault();
            hideEditor();
            p.redraw();
            return;
          }

          // enter = save
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSaveLog();
            return;
          }

          // delete/backspace = erase entry
          if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            onDeleteLog();
            return;
          }

          // cmd/ctrl+z = undo last delete
          const meta = e.metaKey || e.ctrlKey;
          if (meta && (e.key === "z" || e.key === "Z")) {
            e.preventDefault();
            onUndoDelete();
            return;
          }
        };

        window.addEventListener("keydown", windowKeyHandler, { capture: true });
      }

      function detachShortcuts() {
        if (windowKeyHandler) {
          window.removeEventListener("keydown", windowKeyHandler, {
            capture: true,
          });
        }
        windowKeyHandler = null;
      }

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

        attachShortcuts();
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

        const prevText = (state.logs[r][c] || "").trim();
        const prevPunched = !!state.punched[r][c];

        if (prevText.length > 0 || prevPunched) {
          lastDeleted = { r, c, text: prevText, punched: prevPunched };
        } else {
          lastDeleted = null;
        }

        state.logs[r][c] = "";
        state.punched[r][c] = false;

        saveState(state);
        window.dispatchEvent(new Event("softcomputer-update"));

        // keep editor open but clear field
        inputBox.value("");
        p.redraw();
      }

      function onUndoDelete() {
        if (!lastDeleted) return;

        const { r, c, text, punched } = lastDeleted;

        state.logs[r][c] = text;
        state.punched[r][c] = punched;

        saveState(state);
        window.dispatchEvent(new Event("softcomputer-update"));

        // if currently editing that same slot, restore input too
        if (activeEdit && activeEdit.r === r && activeEdit.c === c) {
          inputBox.value(text);
        }

        lastDeleted = null;
        p.redraw();
      }

      function hideEditor() {
        activeEdit = null;
        detachShortcuts();
        inputBox.hide();
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

  // route-aware reload
  useEffect(() => {
    if (pathname !== "/punch") return;
    try {
      p5Ref.current?.reloadFromStorage?.();
    } catch {}
  }, [pathname]);

  // deep link: open editor at query
  useEffect(() => {
    if (pathname !== "/punch") return;
    if (!ready) return;

    let m = Number(mParam);
    let d = Number(dParam);

    // if no query → auto-open today
    if (Number.isNaN(m) || Number.isNaN(d)) {
      const today = new Date();
      m = today.getMonth();
      d = today.getDate() - 1; // zero-indexed
    }

    setTimeout(() => {
      try {
        p5Ref.current?.openAt?.(m, d);
      } catch {}
    }, 50);
  }, [pathname, ready, mParam, dParam]);

  return (
    <div className="panel">
      <div className="h1" style={{ marginBottom: 6 }}>
        punch card
      </div>
      <p className="p">
        click a day → write a log → enter to save. delete/backspace erases.
        cmd/ctrl+z undoes last erase.
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
