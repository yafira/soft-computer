"use client";

import { useEffect, useMemo, useState } from "react";

function pickGroupName(r) {
  const cols = Array.isArray(r?.collections) ? r.collections : [];
  // use the most specific label (often the subcollection) if present
  // if your api returns multiple, the first is usually fine
  return (cols[0] || "uncategorized").toLowerCase();
}

function sortGroupNames(a, b) {
  // keep "uncategorized" last
  if (a === "uncategorized" && b !== "uncategorized") return 1;
  if (b === "uncategorized" && a !== "uncategorized") return -1;
  return a.localeCompare(b);
}

export default function ResourcesList() {
  const [resources, setResources] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setError("");
        const res = await fetch("/api/zotero", { cache: "no-store" });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`api failed (${res.status}): ${text.slice(0, 200)}`);
        }

        const data = await res.json();
        const list = Array.isArray(data?.resources) ? data.resources : [];

        if (!alive) return;
        setResources(list);
        setLoaded(true);
      } catch (e) {
        if (!alive) return;
        setResources([]);
        setLoaded(true);
        setError(String(e?.message || e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = Array.isArray(resources) ? resources : [];

    // filter first
    const filtered = !q
      ? list
      : list.filter((r) => {
          const title = String(r?.title || "").toLowerCase();
          const group = pickGroupName(r);
          return title.includes(q) || group.includes(q);
        });

    // group
    const map = new Map();
    for (const r of filtered) {
      const group = pickGroupName(r);
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(r);
    }

    // sort titles inside group
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) =>
        String(a?.title || "").localeCompare(String(b?.title || "")),
      );
      map.set(k, arr);
    }

    // return sorted groups
    const keys = Array.from(map.keys()).sort(sortGroupNames);
    return keys.map((k) => ({ name: k, items: map.get(k) || [] }));
  }, [resources, query]);

  const totalCount = useMemo(() => {
    return grouped.reduce((sum, g) => sum + g.items.length, 0);
  }, [grouped]);

  if (!loaded) return <div className="emptyState">loading…</div>;

  if (error) {
    return (
      <div className="emptyState">
        failed to load resources.
        <div className="small subtle" style={{ marginTop: 8 }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          className="input"
          placeholder="search resources…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 420 }}
        />
        <div className="small subtle">
          {totalCount} item{totalCount === 1 ? "" : "s"}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="emptyState">
          no items found in this zotero collection.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {grouped.map((g) => (
            <section key={g.name} style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <div className="h2" style={{ margin: 0, fontSize: 16 }}>
                  {g.name}
                </div>
                <div className="small subtle">{g.items.length}</div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {g.items.map((r) => (
                  <div
                    key={r.key}
                    className="cardRow"
                    style={{ padding: "10px 12px" }}
                  >
                    {r.url ? (
                      <a
                        className="link"
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontWeight: 600 }}
                      >
                        {r.title}
                      </a>
                    ) : (
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}