"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "softcomputer_process_2026";
const NOTES_KEY = "softcomputer_notebook_2026";

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

function loadPunchState() {
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

function savePunchState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function daysInMonth(monthIndex, year = 2026) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildEntriesNewestFirst(state) {
  const entries = [];
  for (let m = 0; m < 12; m++) {
    const max = daysInMonth(m, 2026);
    for (let d = 0; d < max; d++) {
      const text = (state.logs?.[m]?.[d] || "").trim();
      if (!text) continue;

      entries.push({
        id: `2026-${String(m + 1).padStart(2, "0")}-${String(d + 1).padStart(
          2,
          "0",
        )}`,
        monthIndex: m,
        dayIndex: d,
        label: `${months[m]} ${d + 1}`,
        text,
        dateValue: new Date(2026, m, d + 1).getTime(),
      });
    }
  }
  entries.sort((a, b) => b.dateValue - a.dateValue);
  return entries;
}

function loadNotebook() {
  try {
    if (typeof window === "undefined") return "";
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return typeof parsed?.text === "string" ? parsed.text : "";
  } catch {
    return "";
  }
}

function saveNotebook(text) {
  try {
    localStorage.setItem(
      NOTES_KEY,
      JSON.stringify({ text, updatedAt: new Date().toISOString() }),
    );
  } catch {}
}

async function fetchAdminStatus() {
  try {
    const res = await fetch("/api/admin/me", { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data?.admin;
  } catch {
    return false;
  }
}

export default function LogNotebookPage() {
  const [state, setState] = useState(() => loadPunchState());
  const [admin, setAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [notes, setNotes] = useState(() => loadNotebook());

  // quick filter/search
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onUpdate = () => setState(loadPunchState());
    window.addEventListener("softcomputer-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("softcomputer-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const isAdmin = await fetchAdminStatus();
      setAdmin(isAdmin);
      setCheckingAdmin(false);
    })();
  }, []);

  const entries = useMemo(() => {
    const all = buildEntriesNewestFirst(state);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (e) =>
        e.text.toLowerCase().includes(q) || e.label.toLowerCase().includes(q),
    );
  }, [state, query]);

  async function unlockAdmin() {
    const pw = window.prompt("admin password");
    if (!pw) return;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });

      if (!res.ok) {
        alert("nope");
        return;
      }

      setAdmin(true);
      alert("admin mode on");
    } catch {
      alert("could not log in");
    }
  }

  async function logoutAdmin() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    setAdmin(false);
  }

  function saveNotesNow() {
    saveNotebook(notes);
  }

  function updateEntryText(monthIndex, dayIndex, nextText) {
    const next = loadPunchState();
    next.logs[monthIndex][dayIndex] = nextText;
    next.punched[monthIndex][dayIndex] = nextText.trim().length > 0;
    savePunchState(next);
    setState(next);
    window.dispatchEvent(new Event("softcomputer-update"));
  }

  return (
    <div className="wrap">
      <section className="panel notebookHeader">
        <div className="notebookTopRow">
          <div>
            <div className="h1" style={{ marginBottom: 6 }}>
              log
            </div>
            <p className="p subtle" style={{ margin: 0 }}>
              notebook view of punched entries + a freeform notes page.
            </p>
          </div>

          <div className="notebookAdmin">
            {checkingAdmin ? (
              <div className="small">checking…</div>
            ) : admin ? (
              <div className="adminRow">
                <span className="chip">admin mode</span>
                <button className="btn ghost" onClick={logoutAdmin}>
                  log out
                </button>
              </div>
            ) : (
              <button className="btn" onClick={unlockAdmin}>
                unlock writing
              </button>
            )}
          </div>
        </div>

        <div className="notebookControls">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search entries…"
          />
          <div className="small">
            {entries.length} entr{entries.length === 1 ? "y" : "ies"}
          </div>
        </div>
      </section>

      <section className="notebookGrid">
        {/* left page: entries */}
        <div className="panel notebookPage">
          <div className="notebookPageTitleRow">
            <div className="h2">entries</div>
          </div>

          {entries.length === 0 ? (
            <div className="emptyState">no entries yet. punch the card ✿</div>
          ) : (
            <div className="entryList">
              {entries.map((e) => (
                <div key={e.id} className="entryCard">
                  <div className="entryMeta">
                    <a
                      className="chip"
                      href={`/#punch-card?m=${e.monthIndex}&d=${e.dayIndex}`}
                      title="open on punch card"
                    >
                      {e.label}
                    </a>

                    <div className="entryActions">
                      <a
                        className="kbd"
                        href={`/#punch-card?m=${e.monthIndex}&d=${e.dayIndex}`}
                        title="open on punch card"
                      >
                        open →
                      </a>
                    </div>
                  </div>

                  {admin ? (
                    <textarea
                      className="entryTextarea"
                      value={e.text}
                      onChange={(ev) =>
                        updateEntryText(
                          e.monthIndex,
                          e.dayIndex,
                          ev.target.value,
                        )
                      }
                      rows={3}
                    />
                  ) : (
                    <div className="entryText">{e.text}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* right page: freeform notes */}
        <div className="panel notebookPage">
          <div className="notebookPageTitleRow">
            <div className="h2">notes</div>
            <div className="small subtle">
              {admin ? "editable" : "read-only"}
            </div>
          </div>

          {admin ? (
            <>
              <textarea
                className="notebookTextarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="freeform notes…"
                rows={18}
              />
              <div className="notebookNotesActions">
                <button className="btn" onClick={saveNotesNow}>
                  save notes
                </button>
                <div className="small subtle">
                  saved locally (we can move this to a real db later)
                </div>
              </div>
            </>
          ) : (
            <div className="notebookReadonly">
              {notes.trim().length ? (
                <pre className="notesPre">{notes}</pre>
              ) : (
                <div className="emptyState">no notes yet.</div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
