export default function ConceptGallery() {
  const isDev = process.env.NODE_ENV === "development";

  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [index, setIndex] = useState(0);

  // ...

  // only allow admin mode in dev
  const canAdmin = isDev;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* admin controls (dev only) */}
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

      {/* single-image gallery */}
      {current ? (
        <figure className="conceptCard" style={{ margin: 0 }}>
          {/* ... */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {current.caption ? (
              <figcaption className="small subtle">
                {current.caption}
              </figcaption>
            ) : null}

            {/* delete button should also be dev-only */}
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
          {/* ... */}
        </figure>
      ) : (
        <div className="emptyState">no concept images yet.</div>
      )}
    </div>
  );
}
