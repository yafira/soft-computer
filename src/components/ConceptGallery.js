"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

const ADMIN_FLAG_KEY = "softcomputer_admin_enabled";
const ADMIN_TOKEN_KEY = "softcomputer_admin_token";

async function fetchImages() {
  const res = await fetch("/api/concept-images", { cache: "no-store" });
  const data = await res.json();
  return Array.isArray(data?.images) ? data.images : [];
}

export default function ConceptGallery() {
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);

  // load local admin toggle/token
  useEffect(() => {
    try {
      const flag = localStorage.getItem(ADMIN_FLAG_KEY) === "true";
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
      setAdminEnabled(flag);
      setAdminToken(token);
    } catch {}
  }, []);

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

  async function onPickFile(file) {
    if (!file) return;
    setBusy(true);
    try {
      // 1) upload to vercel blob (client uploads)
      const blob = await upload(`concept/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob",
      });

      // 2) store metadata in kv (protected)
      const res = await fetch("/api/concept-images", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ url: blob.url, caption }),
      });

      if (!res.ok) throw new Error("save failed");

      setCaption("");
      const next = await fetchImages();
      setImages(next);
    } catch (err) {
      console.error(err);
      alert("upload failed. check console + ADMIN token.");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(id) {
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
      if (!res.ok) throw new Error("delete failed");
      const next = await fetchImages();
      setImages(next);
    } catch (err) {
      console.error(err);
      alert("delete failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* admin-only controls (local toggle) */}
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
          aria-pressed={adminEnabled}
          title="toggle uploader (local only)"
        >
          {adminEnabled ? "uploader: on" : "uploader: off"}
        </button>

        {adminEnabled ? (
          <>
            <input
              className="input"
              style={{ maxWidth: 280 }}
              placeholder="admin token (stored locally)"
              value={adminToken}
              onChange={(e) => saveAdmin(true, e.target.value)}
            />

            <input
              className="input"
              style={{ maxWidth: 280 }}
              placeholder="caption (optional)"
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
                style={{ display: "none" }}
                disabled={busy}
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
            </label>
          </>
        ) : null}
      </div>

      {/* public gallery */}
      {sorted.length === 0 ? (
        <div className="emptyState">no concept images yet.</div>
      ) : (
        <div className="conceptGrid">
          {sorted.map((img) => (
            <figure key={img.id} className="conceptCard">
              <div className="conceptImg">
                <Image
                  src={img.url}
                  alt={img.caption || "concept image"}
                  fill
                  sizes="(max-width: 860px) 100vw, 50vw"
                />
              </div>

              {img.caption ? (
                <figcaption className="small subtle">{img.caption}</figcaption>
              ) : null}

              {adminEnabled ? (
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => removeImage(img.id)}
                  disabled={busy}
                >
                  delete
                </button>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
