"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import s from "./eink.module.css";
import SoftDock from "../components/SoftDock";
import { BUTTONS } from "../lib/feltButtons";

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

const CORPUS_LABELS = {
  blush: "lineage",
  blue: "dreamlike",
  mint: "textile",
  yellow: "subverted",
};

const FOLDERS = [
  { href: "/about", label: "about" },
  { href: "/process", label: "process" },
  { href: "/make", label: "make" },
  { href: "/resources", label: "resources" },
  { href: "/log", label: "log" },
];

// stays true while moving between pages, resets on a reload
let awake = false;

function Flower({ size }) {
  const petals = [0, 1, 2, 3, 4].map((i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    return (
      <circle
        key={i}
        cx={(50 + 26 * Math.cos(a)).toFixed(2)}
        cy={(50 + 26 * Math.sin(a)).toFixed(2)}
        r="24"
      />
    );
  });
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      {petals}
      <circle cx="50" cy="50" r="20" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 64 52" className={s.folderIcon} aria-hidden="true">
      <defs>
        <pattern id="sc-dither" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="2" height="2" fill="currentColor" />
          <rect x="2" y="2" width="2" height="2" fill="currentColor" />
        </pattern>
      </defs>
      <path
        d="M3 8 h20 l6 7 h32 v34 h-58 z"
        fill="var(--paper)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M3 22 h58" stroke="currentColor" strokeWidth="3" />
      <rect x="9" y="29" width="46" height="14" fill="url(#sc-dither)" />
    </svg>
  );
}

// same pacing as before: words arrive one at a time, then the screen rests, dreams, and draws again
function useSoftText(corpus, run) {
  const [words, setWords] = useState([]);
  const [ghost, setGhost] = useState("");
  const [mode, setMode] = useState("wake");
  const [cycle, setCycle] = useState(0);
  const shown = useRef([]);

  useEffect(() => {
    if (!corpus) return;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    later(() => {
      const list = generate(CHAINS[corpus], 30)
        .split(" ")
        .filter((w) => w && w !== "undefined");
      setGhost(shown.current.join(" "));
      shown.current = [];
      setWords([]);
      setMode("play");
      let i = 0;
      function addWord() {
        if (i < list.length) {
          shown.current = list.slice(0, i + 1);
          setWords(shown.current);
          i++;
          later(addWord, 300 + Math.random() * 220);
        } else {
          setMode("wake");
          later(() => {
            setMode("dream");
            later(() => setCycle((c) => c + 1), 3500);
          }, 7000);
        }
      }
      addWord();
    }, 400);

    return () => timers.forEach(clearTimeout);
  }, [corpus, run, cycle]);

  return { words, ghost, mode, id: run + "-" + cycle };
}

export default function HomePage() {
  const router = useRouter();
  // null = blank paper, then "boot" (flower), "hello", "desktop"
  const [stage, setStage] = useState(null);
  const [corpus, setCorpus] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const [flash, setFlash] = useState(0);
  const flashTimer = useRef(null);
  const folderRefs = useRef([]);

  const { words, mode, id } = useSoftText(
    stage === "desktop" && playing ? corpus : null,
    run,
  );

  // full e-ink refresh: the screen flickers, and the content swaps while it is black
  function refresh(swap) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setFlash((f) => f + 1);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(swap, reduce ? 150 : 260);
  }

  function remember() {
    awake = true;
  }

  // every fresh load starts at the flower; coming back from a page lands on the desktop,
  // and a felt button pressed on another page lands straight in play
  useEffect(() => {
    const t = setTimeout(() => {
      let play = null;
      try {
        play = window.sessionStorage.getItem("softcomputer-play");
        window.sessionStorage.removeItem("softcomputer-play");
      } catch {}
      const back = awake || window.__softAwake;
      refresh(() => {
        if (play && BUTTONS[play]) {
          setCorpus(play);
          setPlaying(true);
          setStage("desktop");
        } else {
          setStage(back ? "desktop" : "boot");
        }
      });
    }, 250);
    return () => {
      clearTimeout(t);
      clearTimeout(flashTimer.current);
    };
  }, []);

  // the flower waits, like the real screen, until someone touches the matrix pad
  function wake() {
    if (stage !== "boot") return;
    refresh(() => setStage("hello"));
  }

  // enter (or a touch on the pad) goes on to the desktop
  function goOn() {
    if (stage !== "hello") return;
    remember();
    refresh(() => setStage("desktop"));
  }

  // a felt button always leads to play, with that button's text
  function press(key) {
    if (!stage || stage === "boot") return;
    remember();
    if (stage === "hello" || !playing) {
      refresh(() => {
        setCorpus(key);
        setPlaying(true);
        setStage("desktop");
      });
      return;
    }
    setCorpus(key);
    setRun((r) => r + 1);
  }

  function openPlay() {
    refresh(() => {
      setCorpus((c) => c || "blush");
      setPlaying(true);
    });
  }

  function closePlay() {
    refresh(() => setPlaying(false));
  }

  // presence: touching the pad moves things along, or stirs a resting poem
  function touchPad() {
    if (stage === "boot") {
      wake();
    } else if (stage === "hello") {
      goOn();
    } else if (stage === "desktop" && playing && mode !== "play") {
      setRun((r) => r + 1);
    }
  }

  function openFolder(e, href) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    refresh(() => router.push(href));
  }

  // keyboard stands in for the hardware too: 1-4 are the felt buttons, arrows walk the folders
  useEffect(() => {
    if (!stage) return;
    const keys = Object.keys(BUTTONS);
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= keys.length) {
        press(keys[n - 1]);
        return;
      }
      if (e.key === "Enter" && stage === "boot") {
        wake();
        return;
      }
      if (e.key === "Enter" && stage === "hello") {
        goOn();
        return;
      }
      if (stage !== "desktop") return;
      if (e.key === "Escape" && playing) {
        closePlay();
        return;
      }
      const dir =
        e.key === "ArrowRight" || e.key === "ArrowDown"
          ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
            ? -1
            : 0;
      if (!dir) return;
      e.preventDefault();
      const els = folderRefs.current.filter(Boolean);
      const at = els.indexOf(document.activeElement);
      const next = at === -1 ? 0 : (at + dir + els.length) % els.length;
      els[next].focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className={s.computer}>
      <div className={s.screen}>
        {stage === "boot" && (
          <section className={s.boot} onClick={wake}>
            <span className={s.bootFlower}>
              <Flower size="100%" />
            </span>
            <p className={s.bootHint}>touch the matrix pad</p>
          </section>
        )}

        {stage && stage !== "boot" && (
          <header className={s.bar}>
            <span className={s.barName}>
              <Flower size={18} />
              soft os
            </span>
            <span className={s.barMid}>
              {stage === "desktop" && playing ? mode : ""}
            </span>
            <span>404 time not found</span>
          </header>
        )}

        {stage === "hello" && (
          <section className={s.hello} onClick={goOn}>
            <div className={s.helloText}>
              <h1 className={s.helloTitle}>
                hello, i am
                <br />
                the soft computer.
              </h1>
              <p>
                what can a soft computer do
                <br />
                that a hard computer never could?
              </p>
              <p>
                what becomes possible when we design
                <br />
                around care rather than command?
              </p>
              <p className={s.helloHint}>
                press a button to begin
                <br />
                or press enter to continue
              </p>
            </div>
            <footer className={s.helloFoot}>
              warning: this computer prefers slowness.
              <br />[ soft computer v1.0 ]
            </footer>
          </section>
        )}

        {stage === "desktop" && !playing && (
          <section className={s.desk}>
            <nav className={s.folders} aria-label="pages">
              {FOLDERS.map((f, i) => (
                <Link
                  key={f.href}
                  href={f.href}
                  className={s.folder}
                  ref={(el) => {
                    folderRefs.current[i] = el;
                  }}
                  onClick={(e) => openFolder(e, f.href)}
                >
                  <FolderIcon />
                  <span className={s.folderLabel}>{f.label}</span>
                </Link>
              ))}
            </nav>
          </section>
        )}

        {stage === "desktop" && playing && (
          <section className={s.playScreen}>
            <div
              key={run}
              className={
                s.playBody + (mode === "dream" ? " " + s.dreaming : "")
              }
            >
              <p className={s.poem}>
                {words.map((w, i) => (
                  <span key={id + "-" + i} className={s.word}>
                    {w}{" "}
                  </span>
                ))}
                {mode === "play" && <span className={s.caret} />}
              </p>
            </div>
            <footer className={s.playFoot}>
              <span>[ {CORPUS_LABELS[corpus]} ]</span>
              <button
                type="button"
                className={s.again}
                onClick={() => setRun((r) => r + 1)}
                disabled={mode === "play"}
              >
                draw again
              </button>
              <button type="button" className={s.again} onClick={closePlay}>
                home
              </button>
            </footer>
          </section>
        )}

        {flash > 0 && (
          <div key={flash} className={s.refresh} aria-hidden="true">
            <i className={s.inv} />
            <i className={s.blk} />
            <i className={s.wht} />
          </div>
        )}
      </div>

      <SoftDock
        active={playing ? corpus : null}
        onPress={press}
        onTouch={touchPad}
        side={
          <>
            {stage === "desktop" && playing && (
              <button type="button" className={s.play} onClick={closePlay}>
                home
              </button>
            )}
            {stage === "desktop" && !playing && (
              <button type="button" className={s.play} onClick={openPlay}>
                play
              </button>
            )}
            <span className={s.keys}>
              1–4 buttons
              <br />
              arrows + enter
            </span>
          </>
        }
      />
    </div>
  );
}
