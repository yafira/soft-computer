"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

const ADMIN_FLAG_KEY = "softcomputer_admin_enabled";
const ADMIN_TOKEN_KEY = "softcomputer_admin_token";

async function fetchImages() {
  try {
    const res = await fetch("/api/concept-images", { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data?.images) ? data.images : [];
  } catch (err) {
    console.error("failed to load images", err);
    return [];
  }
}

export default function ConceptGallery({ admin = false }) {
  const canAdmin = admin;

  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [index, setIndex] = useState(0);
  const [reordering, setReordering] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [editCaptionValue, setEditCaptionValue] = useState("");

  // drag state for reorder mode
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);
  useEffect(() => {
    if (!canAdmin) setAdminEnabled(false);
  }, [canAdmin]);
  useEffect(() => {
    if (!canAdmin) return;
    try {
      const flag = localStorage.getItem(ADMIN_FLAG_KEY) === "true";
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      setAdminEnabled(flag);
      setAdminToken(token);
    } catch {}
  }, [canAdmin]);

  function saveAdmin(flag, token) {
    setAdminEnabled(flag);
    setAdminToken(token);
    try {
      localStorage.setItem(ADMIN_FLAG_KEY, String(flag));
      localStorage.setItem(ADMIN_TOKEN_KEY, token || "");
    } catch {}
  }

  // in reorder mode we use a local copy the user can drag around
  const [reorderList, setReorderList] = useState([]);

  function enterReorder() {
    setReorderList([...images]); // preserve current display order
    setReordering(true);
  }

  async function saveOrder() {
    setBusy(true);
    try {
      const res = await fetch("/api/concept-images", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ images: reorderList }),
      });
      if (!res.ok) {
        alert("save order failed");
        return;
      }
      const next = await fetchImages();
      setImages(next);
      setReordering(false);
      setIndex(0);
    } catch (err) {
      console.error("save order failed", err);
      alert("save order failed");
    } finally {
      setBusy(false);
    }
  }

  function cancelReorder() {
    setReordering(false);
  }

  // drag handlers for reorder list
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
    setReorderList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragIdx.current = null;
    dragOverIdx.current = null;
  }

  function moveItem(i, dir) {
    const to = i + dir;
    if (to < 0 || to >= reorderList.length) return;
    setReorderList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(i, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  // respect stored order from API — no re-sort
  const sorted = useMemo(() => [...images], [images]);

  useEffect(() => {
    if (sorted.length === 0) {
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(i, sorted.length - 1));
    setEditingCaption(false);
  }, [sorted.length]);

  useEffect(() => {
    setEditingCaption(false);
  }, [index]);

  const current = sorted.length > 0 ? sorted[index] : null;
  const hasMany = sorted.length > 1;

  function goPrev() {
    if (!hasMany) return;
    setIndex((i) => (i - 1 + sorted.length) % sorted.length);
  }
  function goNext() {
    if (!hasMany) return;
    setIndex((i) => (i + 1) % sorted.length);
  }

  function startEditCaption() {
    setEditCaptionValue(current?.caption || "");
    setEditingCaption(true);
  }

  async function saveCaption() {
    if (!current) return;
    setBusy(true);
    try {
      const res = await fetch("/api/concept-images", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ id: current.id, caption: editCaptionValue }),
      });
      if (!res.ok) {
        alert(`caption save failed (${res.status})`);
        return;
      }
      const next = await fetchImages();
      setImages(next);
      setEditingCaption(false);
    } catch (err) {
      alert("caption save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onPickFile(file) {
    if (!file || !canAdmin) return;
    setBusy(true);
    try {
      const blob = await upload(`concept/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob",
      });
      const res = await fetch("/api/concept-images", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ url: blob.url, caption }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(
          `save failed (${res.status})\n${json?.error || "check env vars / admin token"}`,
        );
        return;
      }
      setCaption("");
      const next = await fetchImages();
      setImages(next);
      setIndex(0);
    } catch (err) {
      alert("upload failed. check console.");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(id) {
    if (!canAdmin || !confirm("delete this image?")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/concept-images", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        alert("delete failed");
        return;
      }
      const next = await fetchImages();
      setImages(next);
      setIndex((i) => Math.max(0, i - (i >= next.length ? 1 : 0)));
    } catch (err) {
      alert("delete failed");
    } finally {
      setBusy(false);
    }
  }

  // ── reorder mode UI ──
  if (reordering) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div className="small subtle">drag or use ↑↓ to reorder</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={saveOrder}
            >
              {busy ? "saving..." : "save order"}
            </button>
            <button type="button" className="btn ghost" onClick={cancelReorder}>
              cancel
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {reorderList.map((img, i) => (
            <div
              key={img.id}
              onDragEnter={() => onDragEnter(i)}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: 10,
                borderRadius: 12,
                border: "1px solid rgba(60,35,110,0.14)",
                background: "rgba(255,255,255,0.7)",
              }}
            >
              {/* drag handle */}
              <span
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnd={onDragEnd}
                style={{
                  cursor: "grab",
                  userSelect: "none",
                  fontSize: 16,
                  opacity: 0.5,
                }}
              >
                ⠿
              </span>

              {/* thumbnail */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  overflow: "hidden",
                  flexShrink: 0,
                  border: "1px solid rgba(60,35,110,0.1)",
                }}
              >
                <img
                  src={img.url}
                  alt={img.caption || `image ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* caption or index */}
              <div className="small" style={{ flex: 1, opacity: 0.7 }}>
                {img.caption || `image ${i + 1}`}
              </div>

              {/* arrow buttons */}
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ padding: "2px 7px" }}
                  disabled={i === 0}
                  onClick={() => moveItem(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  style={{ padding: "2px 7px" }}
                  disabled={i === reorderList.length - 1}
                  onClick={() => moveItem(i, 1)}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── normal gallery UI ──
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {canAdmin ? (
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
            onClick={() => saveAdmin(!adminEnabled, adminToken)}
          >
            {adminEnabled ? "uploader: on" : "uploader: off"}
          </button>
          {adminEnabled ? (
            <>
              <input
                className="input"
                style={{ maxWidth: 260 }}
                placeholder="admin token"
                value={adminToken}
                onChange={(e) => saveAdmin(true, e.target.value)}
              />
              <input
                className="input"
                style={{ maxWidth: 260 }}
                placeholder="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <label
                className="btn"
                style={{
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? "uploading..." : "add image"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={busy}
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                />
              </label>
              {images.length > 1 && (
                <button
                  type="button"
                  className="btn ghost"
                  onClick={enterReorder}
                >
                  reorder
                </button>
              )}
            </>
          ) : null}
        </div>
      ) : null}

      {current ? (
        <figure className="conceptCard" style={{ margin: 0 }}>
          <div className="conceptImg">
            <Image
              src={current.url}
              alt={current.caption || "concept image"}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              priority
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: hasMany ? "space-between" : "flex-end",
              gap: 10,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {hasMany ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={goPrev}
                  disabled={busy}
                  aria-label="previous image"
                >
                  ←
                </button>
                <div className="small subtle" style={{ whiteSpace: "nowrap" }}>
                  {index + 1} / {sorted.length}
                </div>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={goNext}
                  disabled={busy}
                  aria-label="next image"
                >
                  →
                </button>
              </div>
            ) : (
              <div />
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {canAdmin && adminEnabled ? (
                editingCaption ? (
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      className="input"
                      style={{ maxWidth: 220 }}
                      value={editCaptionValue}
                      onChange={(e) => setEditCaptionValue(e.target.value)}
                      placeholder="edit caption"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn"
                      disabled={busy}
                      onClick={saveCaption}
                    >
                      {busy ? "saving..." : "save"}
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      disabled={busy}
                      onClick={() => setEditingCaption(false)}
                    >
                      cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={startEditCaption}
                  >
                    {current.caption ? `"${current.caption}"` : "add caption"}
                  </button>
                )
              ) : current.caption ? (
                <figcaption className="small subtle">
                  {current.caption}
                </figcaption>
              ) : null}

              {canAdmin && adminEnabled ? (
                <button
                  type="button"
                  className="btn danger"
                  disabled={busy}
                  onClick={() => removeImage(current.id)}
                >
                  delete
                </button>
              ) : null}
            </div>
          </div>
        </figure>
      ) : (
        <div className="emptyState">no concept images yet.</div>
      )}
    </div>
  );
}
