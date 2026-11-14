"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import s from "./eink.module.css";
import SoftDock from "../components/SoftDock";
import { BUTTONS } from "../lib/feltButtons";
import { CHAINS, CORPUS_LABELS, generate } from "../lib/softText";


const FOLDERS = [
  { href: "/about", label: "about" },
  { href: "/process", label: "process" },
  { href: "/diy", label: "diy" },
  { href: "/language", label: "language" },
  { href: "/resources", label: "resources" },
  { href: "/log", label: "log" },
];

// stays true while moving between pages, resets on a reload
let awake = false;

// the blossom from the real screen, drawn in whatever the text color is
function Flower({ size }) {
  return (
    <span
      className="blossom"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
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
            <span className={"blossom " + s.bootFlower} aria-hidden="true" />
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
            <span className={"blossom " + s.deskBlossom} aria-hidden="true" />
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
        padGone={Boolean(stage) && stage !== "boot"}
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
