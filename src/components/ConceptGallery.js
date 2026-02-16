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

export default function ConceptGallery() {
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);

  /* load admin state from localStorage */
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
      /* 1) upload file to vercel blob */
      const blob = await upload(`concept/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob",
      });

      /* 2) persist metadata */
      const res = await fetch("/api/concept-images", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          url: blob.url,
          caption,
        }),
      });

      let json = null;
      let text = "";

      try {
        json = await res.json();
      } catch {
        text = await res.text();
      }

      if (!res.ok) {
        const details = {
          status: res.status,
          statusText: res.statusText,
          json,
          text,
        };

        console.error(
          "concept save failed:\n" + JSON.stringify(details, null, 2),
        );

        alert(
          `save failed (${res.status})\n` +
            (json?.error || text || "check env vars / admin token"),
        );

        return;
      }

      /* success → refresh gallery */
      setCaption("");
      const next = await fetchImages();
      setImages(next);
    } catch (err) {
      console.error("upload pipeline failed", err);
      alert("upload failed. check console.");
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

      if (!res.ok) {
        const text = await res.text();
        console.error("delete failed:", text);
        alert("delete failed");
        return;
      }

      const next = await fetchImages();
      setImages(next);
    } catch (err) {
      console.error("delete pipeline failed", err);
      alert("delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* admin controls */}
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

            <label className="btn">
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

      {/* gallery */}
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
                  sizes="(max-width: 900px) 100vw, 33vw"
                />
              </div>

              {img.caption ? (
                <figcaption className="small subtle">{img.caption}</figcaption>
              ) : null}

              {adminEnabled ? (
                <button
                  type="button"
                  className="btn danger"
                  disabled={busy}
                  onClick={() => removeImage(img.id)}
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
