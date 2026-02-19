"use client";

import { useEffect, useMemo, useState } from "react";

const ADMIN_FLAG_KEY = "softcomputer_admin_logs_enabled";
const ADMIN_TOKEN_KEY = "softcomputer_admin_logs_token";

function readAdminState() {
  try {
    const flag = localStorage.getItem(ADMIN_FLAG_KEY) === "true";
    const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
    return { flag, token };
  } catch {
    return { flag: false, token: "" };
  }
}

export default function AdminLogEditor() {
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");

  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const { flag, token } = readAdminState();
    setAdminEnabled(flag);
    setAdminToken(token);
  }, []);

  function saveAdmin(flag, token) {
    setAdminEnabled(flag);
    setAdminToken(token);

    try {
      localStorage.setItem(ADMIN_FLAG_KEY, String(flag));
      localStorage.setItem(ADMIN_TOKEN_KEY, token || "");
    } catch {}
  }

  async function refresh() {
    setError("");
    const res = await fetch("/api/logs", { cache: "no-store" });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`logs api failed (${res.status}): ${t.slice(0, 200)}`);
    }
    const data = await res.json();
    const list = Array.isArray(data?.entries) ? data.entries : [];
    setEntries(
      [...list].sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0)),
    );
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await refresh();
        if (!alive) return;
        setLoaded(true);
      } catch (e) {
        if (!alive) return;
        setLoaded(true);
        setError(String(e?.message || e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const isDev = process.env.NODE_ENV === "development";
  const canShowEditor = adminEnabled || isDev;

  const canSubmit = useMemo(() => {
    return (
      adminToken.trim().length > 0 &&
      label.trim().length > 0 &&
      text.trim().length > 0 &&
      !busy
    );
  }, [adminToken, label, text, busy]);

  async function onCreate() {
    if (!canSubmit) return;

    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ label, text }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`create failed (${res.status}): ${t.slice(0, 200)}`);
      }

      setLabel("");
      setText("");
      await refresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("delete this entry?")) return;

    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/logs", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`delete failed (${res.status}): ${t.slice(0, 200)}`);
      }

      await refresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <div className="emptyState">loading…</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="panelTitleRow">
        <div>
          <div className="h2" style={{ margin: 0 }}>
            admin log editor
          </div>
          <div className="small subtle">
            hidden tool for posting live without redeploying
          </div>
        </div>

        <button
          type="button"
          className="btn ghost"
          onClick={() => saveAdmin(!adminEnabled, adminToken)}
        >
          {adminEnabled ? "editor: on" : "editor: off"}
        </button>
      </div>

      {!canShowEditor ? (
        <div className="emptyState">editor is off.</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="input"
              style={{ maxWidth: 320 }}
              placeholder="admin token"
              value={adminToken}
              onChange={(e) => saveAdmin(true, e.target.value)}
            />
            <input
              className="input"
              style={{ maxWidth: 320 }}
              placeholder="label (e.g. week 3)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <textarea
            className="input"
            rows={8}
            placeholder="write entry text…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn" disabled={!canSubmit} onClick={onCreate}>
              {busy ? "saving…" : "add entry"}
            </button>
            {error ? <div className="small subtle">{error}</div> : null}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {entries.map((e) => (
              <div key={e.id} className="cardRow">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "baseline",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className="chip">{e.label}</span>
                    <span className="small subtle">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="btn danger"
                    disabled={busy}
                    onClick={() => onDelete(e.id)}
                  >
                    delete
                  </button>
                </div>

                <div className="small subtle" style={{ marginTop: 8 }}>
                  {(e.text || "").slice(0, 140)}
                  {(e.text || "").length > 140 ? "…" : ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
