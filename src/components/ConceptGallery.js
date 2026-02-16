"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";

export default function ConceptGallery() {
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const isDev = process.env.NODE_ENV === "development";

  async function refresh() {
    try {
      const res = await fetch("/api/concept/images", { cache: "no-store" });
      const data = await res.json();
      setImages(Array.isArray(data?.images) ? data.images : []);
    } catch {
      setImages([]);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      // uses vercel blob client upload flow :contentReference[oaicite:2]{index=2}
      await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/concept/upload",
      });

      await refresh();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const hasImages = images.length > 0;

  return (
    <div>
      <div className="panelTitleRow">
        <div className="h2">the soft computer concept</div>

        {/* dev-only uploader (private to you) */}
        {isDev ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickFile}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              title="upload a concept image"
            >
              {busy ? "uploading…" : "add image"}
            </button>
          </div>
        ) : null}
      </div>

      {!hasImages ? (
        <div
          className="coverFrame"
          style={{ display: "grid", placeItems: "center" }}
        >
          <div className="small subtle">no concept images yet.</div>
        </div>
      ) : (
        <div className="conceptGrid">
          {images.map((img) => (
            <div key={img.url} className="conceptTile">
              <Image
                src={img.url}
                alt="soft computer concept image"
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                className="coverImg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
