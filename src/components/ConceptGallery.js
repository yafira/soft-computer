"use client";

import { useEffect, useMemo, useState } from "react";
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
  const isDev = process.env.NODE_ENV === "development";
  const canAdmin = admin;

  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);

  // force uploader off if not admin
  useEffect(() => {
    if (!canAdmin) {
      setAdminEnabled(false);
    }
  }, [canAdmin]);

  // load admin state from localStorage (only matters when canAdmin=true)
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

  const sorted = useMemo(() => {
    return [...images].sort(
      (a, b) => (b?.createdAt || 0) - (a?.createdAt || 0),
    );
  }, [images]);

  useEffect(() => {
    if (sorted.length === 0) {
      setIndex(0);
      return;
    }
    setIndex((i) => Math.min(i, sorted.length - 1));
  }, [sorted.length]);

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

  async function onPickFile(file) {
    if (!file) return;
    if (!canAdmin) return;

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

      let json = null;
      let text = "";

      try {
        json = await res.json();
      } catch {
        text = await res.text();
      }

      if (!res.ok) {
        console.error("concept save failed:", {
          status: res.status,
          json,
          text,
        });
        alert(
          `save failed (${res.status})\n` +
            (json?.error || text || "check env vars / admin token"),
        );
        return;
      }

      setCaption("");
      const next = await fetchImages();
      setImages(next);
      setIndex(0);
    } catch (err) {
      console.error("upload pipeline failed", err);
      alert("upload failed. check console.");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(id) {
    if (!canAdmin) return;
    if (!confirm("delete this image?")) return;

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
        const text = await res.text();
        console.error("delete failed:", text);
        alert("delete failed");
        return;
      }

      const next = await fetchImages();
      setImages(next);
      setIndex((i) => Math.max(0, i - (i >= next.length ? 1 : 0)));
    } catch (err) {
      console.error("delete pipeline failed", err);
      alert("delete failed");
    } finally {
      setBusy(false);
    }
  }

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

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {current.caption ? (
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
