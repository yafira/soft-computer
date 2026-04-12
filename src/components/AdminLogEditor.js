"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

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

function newTextBlock(value = "") {
  return { id: crypto.randomUUID(), type: "text", value };
}

function newImageBlock(url) {
  return { id: crypto.randomUUID(), type: "image", url };
}

function stripIds(blocks) {
  return blocks.map(({ id: _id, ...rest }) => rest);
}

// convert a saved entry's content/imageUrls/text into local blocks with ids
function entryToBlocks(entry) {
  if (Array.isArray(entry.content) && entry.content.length > 0) {
    return entry.content.map((b) => ({ ...b, id: crypto.randomUUID() }));
  }
  const blocks = [];
  const text = typeof entry.text === "string" ? entry.text.trim() : "";
  if (text) blocks.push(newTextBlock(text));
  const urls = Array.isArray(entry.imageUrls)
    ? entry.imageUrls
    : entry.imageUrl
      ? [entry.imageUrl]
      : [];
  for (const url of urls) {
    if (url) blocks.push(newImageBlock(url));
  }
  return blocks.length > 0 ? blocks : [newTextBlock()];
}

export default function AdminLogEditor() {
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");

  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // editing state — null means "new entry"
  const [editingId, setEditingId] = useState(null);
  const [label, setLabel] = useState("");
  const [blocks, setBlocks] = useState([newTextBlock()]);

  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);
  const composerRef = useRef(null);

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

  const hasContent = useMemo(() => {
    return blocks.some((b) =>
      b.type === "text" ? b.value.trim().length > 0 : !!b.url,
    );
  }, [blocks]);

  const canSubmit =
    adminToken.trim().length > 0 &&
    label.trim().length > 0 &&
    hasContent &&
    !busy &&
    !uploading;

  function resetComposer() {
    setEditingId(null);
    setLabel("");
    setBlocks([newTextBlock()]);
    setError("");
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setLabel(entry.label || "");
    setBlocks(entryToBlocks(entry));
    setError("");
    // scroll composer into view
    setTimeout(() => {
      composerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  // block mutations
  function updateBlock(id, patch) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  function removeBlock(id) {
    setBlocks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      return next.length === 0 ? [newTextBlock()] : next;
    });
  }

  function addTextBlock() {
    setBlocks((prev) => [...prev, newTextBlock()]);
  }

  async function onImagePick(file) {
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(`logs/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob",
      });
      setBlocks((prev) => [...prev, newImageBlock(blob.url)]);
    } catch (e) {
      console.error("image upload failed", e);
      setError("image upload failed");
    } finally {
      setUploading(false);
    }
  }

  // drag handlers
  function onDragStart(i) {
    dragIdx.current = i;
  }
  function onDragEnter(i) {
    dragOverIdx.current = i;
  }
  function onDragEnd() {
    const from = dragIdx.current;
    const to = dragOverIdx.current;
    if (from == null || to == null || from === to) {
      dragIdx.current = null;
      dragOverIdx.current = null;
      return;
    }
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIdx.current = null;
    dragOverIdx.current = null;
  }

  function moveBlock(i, dir) {
    const to = i + dir;
    if (to < 0 || to >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(i, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function onSave() {
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
        body: JSON.stringify({
          // if editing, pass the existing id so the API updates in place
          ...(editingId ? { id: editingId } : {}),
          label,
          content: stripIds(blocks),
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`save failed (${res.status}): ${t.slice(0, 200)}`);
      }

      resetComposer();
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

      if (editingId === id) resetComposer();
      await refresh();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <div className="emptyState">loading…</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
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
          {/* token input — always visible when editor is on */}
          <input
            className="input"
            style={{ maxWidth: 320 }}
            placeholder="admin token"
            value={adminToken}
            onChange={(e) => saveAdmin(true, e.target.value)}
          />

          {/* composer */}
          <div
            ref={composerRef}
            style={{
              display: "grid",
              gap: 12,
              padding: 14,
              borderRadius: 12,
              border: editingId
                ? "1.5px solid rgba(100,60,200,0.3)"
                : "1px solid rgba(60,35,110,0.12)",
              background: editingId ? "rgba(220,214,247,0.15)" : "transparent",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="small subtle">
                {editingId ? `editing: ${label || "…"}` : "new entry"}
              </div>
              {editingId && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={resetComposer}
                >
                  cancel edit
                </button>
              )}
            </div>

            <input
              className="input"
              style={{ maxWidth: 320 }}
              placeholder="label (e.g. apr 11)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            {/* blocks */}
            <div style={{ display: "grid", gap: 8 }}>
              {blocks.map((block, i) => (
                <div
                  key={block.id}
                  onDragEnter={() => onDragEnter(i)}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    display: "grid",
                    gap: 6,
                    padding: 10,
                    borderRadius: 10,
                    border: "1px solid rgba(60,35,110,0.12)",
                    background: "rgba(255,255,255,0.6)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      className="small subtle"
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragEnd={onDragEnd}
                      style={{ userSelect: "none", cursor: "grab" }}
                    >
                      ⠿ {block.type === "text" ? "text" : "image"}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 7px" }}
                        disabled={i === 0}
                        onClick={() => moveBlock(i, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        style={{ padding: "2px 7px" }}
                        disabled={i === blocks.length - 1}
                        onClick={() => moveBlock(i, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        style={{ padding: "2px 7px" }}
                        onClick={() => removeBlock(block.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {block.type === "text" ? (
                    <textarea
                      className="input"
                      rows={5}
                      placeholder="write entry text… (markdown supported)"
                      value={block.value}
                      onChange={(e) =>
                        updateBlock(block.id, { value: e.target.value })
                      }
                      style={{ resize: "vertical" }}
                    />
                  ) : (
                    <div
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid rgba(60,35,110,0.1)",
                      }}
                    >
                      <img
                        src={block.url}
                        alt="block image"
                        style={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                          display: "block",
                          background: "#fff",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* add block controls */}
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="btn ghost"
                onClick={addTextBlock}
              >
                + text block
              </button>
              <label
                className="btn ghost"
                style={{
                  cursor: uploading ? "not-allowed" : "pointer",
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? "uploading…" : "+ image"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={uploading}
                  onChange={(e) => onImagePick(e.target.files?.[0])}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="btn" disabled={!canSubmit} onClick={onSave}>
                {busy ? "saving…" : editingId ? "save changes" : "add entry"}
              </button>
              {error ? <div className="small subtle">{error}</div> : null}
            </div>
          </div>

          {/* existing entries list */}
          <div style={{ display: "grid", gap: 8 }}>
            {entries.map((e) => {
              const imgCount = e.imageUrls?.length ?? 0;
              const isEditing = e.id === editingId;
              return (
                <div
                  key={e.id}
                  className="cardRow"
                  style={
                    isEditing
                      ? {
                          border: "1.5px solid rgba(100,60,200,0.3)",
                          background: "rgba(220,214,247,0.15)",
                        }
                      : {}
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "baseline",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <span className="chip">{e.label}</span>
                      <span className="small subtle">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </span>
                      {imgCount > 0 && (
                        <span className="small subtle">
                          {imgCount} image{imgCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className={isEditing ? "btn ghost" : "btn ghost"}
                        disabled={busy}
                        onClick={() =>
                          isEditing ? resetComposer() : startEdit(e)
                        }
                      >
                        {isEditing ? "cancel" : "edit"}
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        disabled={busy}
                        onClick={() => onDelete(e.id)}
                      >
                        delete
                      </button>
                    </div>
                  </div>
                  <div className="small subtle" style={{ marginTop: 8 }}>
                    {(e.text || "").slice(0, 140)}
                    {(e.text || "").length > 140 ? "…" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
