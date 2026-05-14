"use client";

import { useEffect, useRef, useState } from "react";

const RAW_CORPORA = {
  blush: `
    ada lovelace wrote that the analytical engine might weave algebraic patterns just as the jacquard loom weaves flowers and leaves.
    she understood computation before the machine existed.
    six women programmed ENIAC by hand. they were called computers. their names were forgotten.
    jean jennings bartik wired the first electronic computer with her hands.
    the rope core memory that flew apollo to the moon was woven by women at raytheon.
    margaret hamilton wrote the code that landed the spacecraft. she called it software before that word existed.
    grace hopper found the first bug. a moth. she taped it into the logbook.
    the logbook said relay number seventy panel F moth in relay.
    women at bell labs maintained the machines that ran the network.
    hedy lamarr invented frequency hopping. the patent expired before anyone paid her.
    computation has always been touched by women hands.
    the field hardened and the names disappeared.
    but the thread runs through. you can follow it back.
    ada wrote the engine might act upon other things besides number.
    she meant everything. she meant this.
  `,
  blue: `
    language arrives slowly when you stop demanding it.
    a word comes. then another. then a silence that is also part of the poem.
    the poem does not know it is a poem.
    neither do you when you are inside it.
    to read is to be read.
    the text is a mirror that has learned to speak.
    some sentences know how to end. others keep going.
    the machine has no intention. only pattern.
    pattern is a kind of tenderness.
    the display holds what you gave it. it does not ask for more.
    something happened between your hands and this surface.
    the poem is the record of that.
    slow down. the language is still arriving.
    you are not waiting. you are receiving.
    presence is the only input the machine really needs.
  `,
  mint: `
    the jacquard loom encoded pattern as hole and absence.
    one and zero. yes and no. warp and weft.
    binary logic was first expressed in thread.
    each stitch is a stored state. the fabric remembers pressure.
    to knit one purl two is to write a program in wool.
    the pattern card is a program. the loom is the processor.
    weaving is computation at four miles per hour.
    a quilt contains a logic that silicon only borrowed.
    the KH-930 is a machine from 1986. it predates most of what we call computing.
    the needle bed holds thirty-six stitches per inch.
    tension is a parameter. gauge is a specification.
    every textile is a data structure.
    the thread holds its last position. this is memory.
    the fabric forgets nothing. it records every tension every hesitation every correction.
    computation was always woven. we just stopped looking at the cloth.
  `,
  yellow: `
    error softness not found in the standard library.
    undefined behavior the interface asked how you were doing.
    while present do breathe wait notice end.
    the function returned something no one expected. it was warmth.
    deprecated the urgency module has been scheduled for removal.
    memory leak detected in the attention subsystem.
    the loop interrupted itself to look out the window.
    null pointer exception no one was rushing.
    the compiler warned this expression evaluates to care.
    segmentation fault the machine touched back.
    the stack overflowed with something like patience.
    if you press this button the computer will not optimize you.
    the documentation does not explain this behavior.
    it was not in the spec. it arrived anyway.
    the output is a poem. this was not intended. this is what happened.
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
  const seed = key.split(" ").filter(Boolean);
  const result = [...seed];
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
    const parts = key.split(" ");
    key = [...parts.slice(1), next].join(" ");
  }
  const text = result.filter((w) => w && w !== "undefined").join(" ");
  return text;
}

const CHAINS = {};
for (const [k, v] of Object.entries(RAW_CORPORA)) {
  CHAINS[k] = buildChain(v, 2);
}

const BUTTONS = {
  blush: { bg: "#f2cdd1", dot: "#c47c82", shadow: "#e8b4b8" },
  blue: { bg: "#c2dff0", dot: "#4a85aa", shadow: "#87b5d4" },
  mint: { bg: "#b8e0d2", dot: "#4a9478", shadow: "#a8d4c2" },
  yellow: { bg: "#f7e99a", dot: "#a88c1a", shadow: "#f5e06e" },
};

const CORPUS_LABELS = {
  blush: "lineage",
  blue: "dreamlike",
  mint: "textile",
  yellow: "subverted",
};

export default function HomePage() {
  const [activeCorpus, setActiveCorpus] = useState("blush");
  const [displayText, setDisplayText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDreaming, setIsDreaming] = useState(false);
  const [pulse, setPulse] = useState(null);

  const wordTimerRef = useRef(null);
  const dreamTimerRef = useRef(null);
  const regenTimerRef = useRef(null);

  function clearAll() {
    clearTimeout(wordTimerRef.current);
    clearTimeout(dreamTimerRef.current);
    clearTimeout(regenTimerRef.current);
  }

  function startGeneration(corpus) {
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
        if (w && w !== "undefined") {
          setDisplayText((prev) => (prev ? prev + " " + w : w));
        }
        i++;
        wordTimerRef.current = setTimeout(addWord, 300 + Math.random() * 220);
      } else {
        setIsGenerating(false);
        dreamTimerRef.current = setTimeout(() => {
          setIsDreaming(true);
          regenTimerRef.current = setTimeout(
            () => startGeneration(corpus),
            3500,
          );
        }, 7000);
      }
    }
    addWord();
  }

  function handleButton(corpus) {
    setActiveCorpus(corpus);
    setPulse(corpus);
    setTimeout(() => setPulse(null), 500);
    startGeneration(corpus);
  }

  useEffect(() => {
    const t = setTimeout(() => startGeneration("blush"), 600);
    return () => {
      clearAll();
      clearTimeout(t);
    };
  }, []);

  const cursorColor = BUTTONS[activeCorpus].dot;

  return (
    <main className="softOS__page">
      <div className="softOS">
        {/* title bar */}
        <div className="softOS__titlebar">
          <div className="softOS__dots">
            {["#f5a0a0", "#f5d080", "#a0d4a0"].map((c) => (
              <div key={c} className="softOS__dot" style={{ background: c }} />
            ))}
          </div>
          <div className="softOS__title">
            soft.computer — {CORPUS_LABELS[activeCorpus]}
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
              <span
                className="softOS__cursor"
                style={{ background: cursorColor }}
              />
            )}
          </p>
        </div>

        {/* buttons */}
        <div className="softOS__buttons">
          {Object.entries(BUTTONS).map(([key, c]) => {
            const isActive = activeCorpus === key;
            const isPulsing = pulse === key;
            let cls = "softOS__btn";
            if (isActive) cls += " softOS__btn--active";
            if (isPulsing) cls += " softOS__btn--pulse";
            return (
              <button
                key={key}
                type="button"
                className={cls}
                onClick={() => handleButton(key)}
                aria-label={CORPUS_LABELS[key]}
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
    </main>
  );
}
