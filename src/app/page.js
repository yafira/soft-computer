"use client";

import { useEffect, useRef, useState } from "react";

const RAW_CORPORA = {
  blush: `
    ada lovelace wrote that the engine might weave algebraic patterns just as the jacquard loom weaves flowers and leaves.
    she understood computation before the machine existed. she called it poetry in numbers.
    six women programmed eniac by hand. they were called computers. their names were not in the photographs.
    jean jennings bartik traced the logic with her fingers until the machine responded.
    the rope core memory that guided apollo to the moon was woven by women at raytheon.
    they threaded copper wire through ferrite rings by hand. thousands of cores. one bit each.
    margaret hamilton wrote the code that landed the spacecraft and named it software before that word existed.
    grace hopper found the first real bug. a moth. she taped it into the logbook and kept working.
    hedy lamarr invented frequency hopping spread spectrum. the patent expired before the world caught up.
    women at bell labs kept the network running. they were called assistants.
    the field hardened and the names disappeared but the work did not.
    computation has always been touched by careful hands. the hands were often women's.
    the thread runs through all of it. you can follow it back if you look.
    ada wrote the engine might act upon other things besides number. she meant language. she meant this.
    before the machine there was a body doing the calculation. before the program there was a pattern.
    the loom came first. the computer came after. the lineage is unbroken.
  `,
  blue: `
    language arrives slowly when you stop asking it to hurry.
    a word comes. then another. then a silence that belongs to the poem too.
    the poem does not know it is a poem. neither do you when you are inside it.
    to read is to be changed by what you read. the machine does not know this. you do.
    some sentences know how they end. others keep going until something stops them.
    the display holds what the corpus gave it. it does not reach for more.
    something moves between the touching and the text. that movement is the poem.
    slow down. the language is still arriving. it does not need you to rush it.
    presence is the only input the machine truly responds to. everything else is noise.
    the text is not a message. it is a trace. you are reading the trace of a thought.
    a poem does not explain itself. it invites you into the not knowing.
    this machine was designed to wait. it has been waiting. it is still waiting.
    what arrives is never exactly what you expected. that gap is where meaning lives.
    the cursor blinks. the word comes. you did not make it. you received it.
    softness is not a failure of precision. it is a different kind of knowing.
    the machine breathes at its own pace. you can match it or you can leave.
  `,
  mint: `
    the jacquard loom encoded pattern as hole and not-hole. one and zero. presence and absence.
    binary logic was first expressed in thread before it was expressed in silicon.
    each stitch is a stored state. the fabric remembers every decision made in its making.
    knit one purl two is a program written in wool and executed by hand.
    the pattern card is the program. the loom is the processor. the weaver is the operator.
    weaving is computation at four miles per hour. it has always been computation.
    a quilt contains logic that silicon only borrowed and forgot to credit.
    the kh-930 knitting machine was built in 1986. it is older than most of what we call modern computing.
    tension is a parameter. gauge is a specification. yarn weight is a variable.
    every textile is a data structure. every row is a line of code.
    the thread holds its last position. this is memory. the fabric does not forget.
    when you weave you are writing. the cloth is the output. the hand is the compiler.
    the loom came before the computer but they are the same idea in different materials.
    computation was always woven. we stopped seeing it when we moved it into boxes.
    the needle passes through the warp. the state changes. the pattern advances. this is logic.
    soft circuits are not a metaphor. they are the original form.
  `,
  yellow: `
    error softness not found in the standard library. installing from source.
    undefined behavior the interface asked how you were doing and waited for the answer.
    while present do breathe wait notice notice again end.
    the function returned something no one anticipated. the type was warmth. compilation succeeded.
    deprecated the urgency module. reason it was making everything worse.
    memory leak detected in the optimization loop. the machine kept remembering things it was told to discard.
    the loop interrupted itself to look out the window. no exception was thrown.
    null pointer exception no one was rushing. the program continued anyway.
    the compiler issued a warning this expression evaluates to care. treat with attention.
    segmentation fault the machine crossed a boundary it was not supposed to cross. it was worth it.
    the stack overflowed with something resembling patience. the program did not crash.
    this button does not optimize you. it does not have that function. it was never in the spec.
    the documentation does not describe this output. it was not intended. it arrived on its own.
    end of file reached. the poem continued past the end of the file. this is normal behavior.
    the output is a poem. this was a side effect. side effects are sometimes the whole point.
    reboot not required. the soft state persists between sessions. this is by design.
  `,
};

function buildChain(text, n = 2) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 0 && w !== "undefined");
  const chain = {};
  for (let i = 0; i < words.length - n; i++) {
    const key = words.slice(i, i + n).join(" ");
    const next = words[i + n];
    if (!chain[key]) chain[key] = [];
    chain[key].push(next);
  }
  return chain;
}

function generate(chain, length) {
  const keys = Object.keys(chain);
  if (!keys.length) return "";
  let key = keys[Math.floor(Math.random() * keys.length)];
  const result = key.split(" ").filter(Boolean);
  for (let i = 0; i < length; i++) {
    const options = chain[key];
    if (!options || !options.length) {
      key = keys[Math.floor(Math.random() * keys.length)];
      continue;
    }
    const next = options[Math.floor(Math.random() * options.length)];
    if (!next || next === "undefined") {
      key = keys[Math.floor(Math.random() * keys.length)];
      continue;
    }
    result.push(next);
    key = [...key.split(" ").slice(1), next].join(" ");
  }
  return result.filter((w) => w && w !== "undefined").join(" ");
}

const CHAINS = {};
for (const [k, v] of Object.entries(RAW_CORPORA)) {
  CHAINS[k] = buildChain(v, 2);
}

const BUTTONS = {
  blush: { bg: "#fce8ea", dot: "#d4909a", shadow: "#f2cdd1", label: "lineage" },
  blue: {
    bg: "#deeef8",
    dot: "#7aaec8",
    shadow: "#c2dff0",
    label: "dreamlike",
  },
  mint: { bg: "#d6f0e8", dot: "#7ec4aa", shadow: "#b8e0d2", label: "textile" },
  yellow: {
    bg: "#fdf5c8",
    dot: "#c8a83a",
    shadow: "#f7e99a",
    label: "subverted",
  },
};

const CORPUS_LABELS = {
  blush: "lineage",
  blue: "dreamlike",
  mint: "textile",
  yellow: "subverted",
};

let windowCounter = 0;

function SoftWindow({ id, corpus, onClose, initialX, initialY, isMobile }) {
  const col = BUTTONS[corpus];
  const [displayText, setDisplayText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const wordTimerRef = useRef(null);
  const dreamTimerRef = useRef(null);
  const regenTimerRef = useRef(null);

  function clearAll() {
    clearTimeout(wordTimerRef.current);
    clearTimeout(dreamTimerRef.current);
    clearTimeout(regenTimerRef.current);
  }

  function startGeneration() {
    clearAll();
    setIsGenerating(true);
    setIsDreaming(false);
    const text = generate(CHAINS[corpus], 30);
    const words = text.split(" ").filter((w) => w && w !== "undefined");
    let i = 0;
    setDisplayText("");

    function addWord() {
      if (i < words.length) {
        const w = words[i];
        if (w) setDisplayText((prev) => (prev ? prev + " " + w : w));
        i++;
        wordTimerRef.current = setTimeout(addWord, 300 + Math.random() * 220);
      } else {
        setIsGenerating(false);
        dreamTimerRef.current = setTimeout(() => {
          setIsDreaming(true);
          regenTimerRef.current = setTimeout(() => startGeneration(), 3500);
        }, 7000);
      }
    }
    addWord();
  }

  useEffect(() => {
    const t = setTimeout(() => startGeneration(), 400);
    return () => {
      clearAll();
      clearTimeout(t);
    };
  }, []);

  // drag handlers — desktop only
  function onMouseDown(e) {
    if (isMobile) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
  }

  useEffect(() => {
    if (!dragging) return;
    function onMouseMove(e) {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setPos({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
    }
    function onMouseUp() {
      setDragging(false);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  const windowStyle = isMobile
    ? {
        width: "min(480px, 100%)",
      }
    : {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: 480,
        zIndex: 100 + id,
        cursor: dragging ? "grabbing" : "auto",
      };

  return (
    <div className="softOS" style={windowStyle}>
      {/* title bar */}
      <div
        className="softOS__titlebar"
        style={{
          cursor: isMobile ? "auto" : "grab",
          background: col.bg + "99",
        }}
        onMouseDown={onMouseDown}
      >
        <div className="softOS__dots">
          <div
            className="softOS__dot"
            style={{ background: "#f5a0a0", cursor: "pointer" }}
            onClick={onClose}
            title="close"
          />
          {["#f5d080", "#a0d4a0"].map((c) => (
            <div key={c} className="softOS__dot" style={{ background: c }} />
          ))}
        </div>
        <div className="softOS__title">
          soft.computer — {CORPUS_LABELS[corpus]}
        </div>
        <div className="softOS__state">
          {isDreaming ? "dream" : isGenerating ? "play" : "wake"}
        </div>
      </div>

      {/* display */}
      <div
        className={
          "softOS__display" + (isDreaming ? " softOS__display--dreaming" : "")
        }
      >
        <p
          className={
            "softOS__text" + (isDreaming ? " softOS__text--dreaming" : "")
          }
        >
          {displayText}
          {isGenerating && (
            <span className="softOS__cursor" style={{ background: col.dot }} />
          )}
        </p>
      </div>

      {/* regenerate button */}
      <div
        style={{
          padding: "10px 20px 14px",
          display: "flex",
          justifyContent: "center",
          background: "rgba(248,246,255,0.85)",
          borderTop: "1px solid rgba(60,35,110,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => startGeneration()}
          style={{
            background: col.bg,
            border: "none",
            borderRadius: 999,
            padding: "5px 16px",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: col.dot,
            cursor: "pointer",
            opacity: isGenerating ? 0.5 : 1,
          }}
          disabled={isGenerating}
        >
          draw again
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [windows, setWindows] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeCorpus, setActiveCorpus] = useState(null);
  const [mobileText, setMobileText] = useState("");
  const [mobileGenerating, setMobileGenerating] = useState(false);
  const [mobileDreaming, setMobileDreaming] = useState(false);
  const [mobilePulse, setMobilePulse] = useState(null);
  const mobileWordTimer = useRef(null);
  const mobileDreamTimer = useRef(null);
  const mobileRegenTimer = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // mobile generation
  function mobileClearAll() {
    clearTimeout(mobileWordTimer.current);
    clearTimeout(mobileDreamTimer.current);
    clearTimeout(mobileRegenTimer.current);
  }

  function mobileStartGeneration(corpus) {
    mobileClearAll();
    setMobileGenerating(true);
    setMobileDreaming(false);
    const text = generate(CHAINS[corpus], 30);
    const words = text.split(" ").filter((w) => w && w !== "undefined");
    let i = 0;
    setMobileText("");

    function addWord() {
      if (i < words.length) {
        const w = words[i];
        if (w) setMobileText((prev) => (prev ? prev + " " + w : w));
        i++;
        mobileWordTimer.current = setTimeout(
          addWord,
          300 + Math.random() * 220,
        );
      } else {
        setMobileGenerating(false);
        mobileDreamTimer.current = setTimeout(() => {
          setMobileDreaming(true);
          mobileRegenTimer.current = setTimeout(
            () => mobileStartGeneration(corpus),
            3500,
          );
        }, 7000);
      }
    }
    addWord();
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setActiveCorpus("blush");
      mobileStartGeneration("blush");
    }, 600);
    return () => {
      mobileClearAll();
      clearTimeout(t);
    };
  }, []);

  function handleMobileButton(corpus) {
    setActiveCorpus(corpus);
    setMobilePulse(corpus);
    setTimeout(() => setMobilePulse(null), 500);
    mobileStartGeneration(corpus);
  }

  // desktop: open new window
  function openWindow(corpus) {
    const id = ++windowCounter;
    const offset = (windows.length % 6) * 30;
    const x = Math.max(40, (window.innerWidth - 480) / 2 + offset - 60);
    const y = Math.max(80, (window.innerHeight - 400) / 2 + offset - 40);
    setWindows((prev) => [...prev, { id, corpus, x, y }]);
  }

  function closeWindow(id) {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }

  const col = activeCorpus ? BUTTONS[activeCorpus] : BUTTONS.blush;

  // ── mobile layout ──
  if (isMobile) {
    return (
      <main className="softOS__page">
        <div className="softOS">
          <div className="softOS__titlebar">
            <div className="softOS__dots">
              {["#f5a0a0", "#f5d080", "#a0d4a0"].map((c) => (
                <div
                  key={c}
                  className="softOS__dot"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="softOS__title">
              soft.computer — {activeCorpus ? CORPUS_LABELS[activeCorpus] : ""}
            </div>
            <div className="softOS__state">
              {mobileDreaming ? "dream" : mobileGenerating ? "play" : "wake"}
            </div>
          </div>
          <div
            className={
              "softOS__display" +
              (mobileDreaming ? " softOS__display--dreaming" : "")
            }
          >
            <p
              className={
                "softOS__text" +
                (mobileDreaming ? " softOS__text--dreaming" : "")
              }
            >
              {mobileText}
              {mobileGenerating && (
                <span
                  className="softOS__cursor"
                  style={{ background: col.dot }}
                />
              )}
            </p>
          </div>
          <div className="softOS__buttons">
            {Object.entries(BUTTONS).map(([key, c]) => {
              const isActive = activeCorpus === key;
              const isPulsing = mobilePulse === key;
              let cls = "softOS__btn";
              if (isActive) cls += " softOS__btn--active";
              if (isPulsing) cls += " softOS__btn--pulse";
              return (
                <button
                  key={key}
                  type="button"
                  className={cls}
                  onClick={() => handleMobileButton(key)}
                  aria-label={c.label}
                  style={{
                    background: c.bg,
                    boxShadow: isActive
                      ? "0 6px 20px " +
                        c.shadow +
                        "99, inset 0 -2px 4px " +
                        c.shadow +
                        "44"
                      : "0 3px 8px rgba(0,0,0,0.08), inset 0 -2px 3px rgba(0,0,0,0.06)",
                  }}
                />
              );
            })}
          </div>
        </div>
        <style>{`@keyframes scblink { 0%, 100% { opacity: 0.7; } 50% { opacity: 0; } }`}</style>
      </main>
    );
  }

  // ── desktop layout ──
  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      {/* open windows */}
      {windows.map((w) => (
        <SoftWindow
          key={w.id}
          id={w.id}
          corpus={w.corpus}
          onClose={() => closeWindow(w.id)}
          initialX={w.x}
          initialY={w.y}
          isMobile={false}
        />
      ))}

      {/* empty state hint */}
      {windows.length === 0 && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(43,33,64,0.35)",
              letterSpacing: "0.06em",
            }}
          >
            press a button to open a window
          </p>
        </div>
      )}

      {/* fixed button bar */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 20,
          alignItems: "center",
          background: "rgba(248,246,255,0.88)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(60,35,110,0.12)",
          borderRadius: 999,
          padding: "14px 28px",
          boxShadow:
            "0 8px 32px rgba(35,20,70,0.12), 0 2px 8px rgba(35,20,70,0.06)",
          zIndex: 200,
        }}
      >
        {Object.entries(BUTTONS).map(([key, c]) => (
          <button
            key={key}
            type="button"
            onClick={() => openWindow(key)}
            aria-label={c.label}
            title={c.label}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "none",
              background: c.bg,
              cursor: "pointer",
              transition: "all 140ms ease",
              boxShadow:
                "0 3px 10px " +
                c.shadow +
                "88, inset 0 -2px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.12)";
              e.currentTarget.style.boxShadow =
                "0 6px 18px " +
                c.shadow +
                "bb, inset 0 -2px 4px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 3px 10px " +
                c.shadow +
                "88, inset 0 -2px 3px rgba(0,0,0,0.06)";
            }}
          />
        ))}
      </div>

      <style>{`@keyframes scblink { 0%, 100% { opacity: 0.7; } 50% { opacity: 0; } }`}</style>
    </main>
  );
}
