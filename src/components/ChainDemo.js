"use client";

import { useState } from "react";
import { CHAINS, CORPUS_LABELS } from "../lib/softText";

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function startFrom(corpus) {
  const key = randomOf(Object.keys(CHAINS[corpus]));
  return { corpus, words: key.split(" "), picked: null, jumped: false };
}

// count repeats so "the the poem" reads as "the ×2, poem"
function tally(options) {
  const counts = {};
  for (const w of options) counts[w] = (counts[w] || 0) + 1;
  return Object.entries(counts);
}

// one word at a time, showing the list the chain is choosing from
export default function ChainDemo() {
  const [state, setState] = useState(null);

  const corpus = state ? state.corpus : null;
  const lastTwo = state ? state.words.slice(-2).join(" ") : "";
  const options = state ? CHAINS[corpus][lastTwo] || [] : [];

  function next() {
    setState((prev) => {
      const key = prev.words.slice(-2).join(" ");
      const opts = CHAINS[prev.corpus][key];
      if (!opts || !opts.length) {
        // dead end: nothing ever followed these two words, so jump somewhere else
        const jump = randomOf(Object.keys(CHAINS[prev.corpus])).split(" ");
        return { ...prev, words: [...prev.words, ...jump], picked: null, jumped: true };
      }
      const word = randomOf(opts);
      return { ...prev, words: [...prev.words, word], picked: word, jumped: false };
    });
  }

  return (
    <div className="chainDemo">
      <div className="chainRow">
        <span className="small subtle">pick a corpus</span>
        {Object.entries(CORPUS_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={"btn" + (corpus === key ? "" : " ghost")}
            onClick={() => setState(startFrom(key))}
          >
            {label}
          </button>
        ))}
      </div>

      {state && (
        <>
          <p className="chainLine">
            {state.words.slice(0, -2).join(" ")}{" "}
            <span className="chainKey">{lastTwo}</span>
          </p>

          <div className="chainBox">
            <div className="small subtle">
              {options.length
                ? "words that came after “" + lastTwo + "” in the corpus"
                : "nothing ever came after “" + lastTwo + "”. the chain will jump somewhere else."}
            </div>
            <div className="chainOptions">
              {tally(options).map(([w, n]) => (
                <span key={w} className="chip">
                  {w}
                  {n > 1 ? " ×" + n : ""}
                </span>
              ))}
            </div>
            <div className="small subtle">
              {state.jumped
                ? "it jumped."
                : state.picked
                  ? "last pick: " + state.picked
                  : "these two words are where it starts."}
            </div>
          </div>

          <div className="chainRow">
            <button type="button" className="btn" onClick={next}>
              next word
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setState(startFrom(corpus))}
            >
              start over
            </button>
          </div>
        </>
      )}
    </div>
  );
}
