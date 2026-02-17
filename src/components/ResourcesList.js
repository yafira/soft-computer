"use client";

import { useEffect, useMemo, useState } from "react";

function pickGroupName(r) {
  const cols = Array.isArray(r?.collections) ? r.collections : [];
  return String(cols[0] || "uncategorized").trim();
}

function sortGroupNames(a, b) {
  const aa = String(a || "").toLowerCase();
  const bb = String(b || "").toLowerCase();

  if (aa === "uncategorized" && bb !== "uncategorized") return 1;
  if (bb === "uncategorized" && aa !== "uncategorized") return -1;

  return aa.localeCompare(bb);
}

function prettyLabel(s) {
  const raw = String(s || "").trim();
  if (!raw) return "uncategorized";

  return raw
    .split(" / ")
    .map((part) =>
      part
        .split(/\s+/)
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(" "),
    )
    .join(" / ");
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

    const filtered = !q
      ? list
      : list.filter((r) => {
          const title = String(r?.title || "").toLowerCase();
          const group = pickGroupName(r).toLowerCase();
          return title.includes(q) || group.includes(q);
        });

    const map = new Map();

    for (const r of filtered) {
      const group = pickGroupName(r);
      if (!map.has(group)) map.set(group, []);
      map.get(group).push(r);
    }

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) =>
        String(a?.title || "").localeCompare(String(b?.title || "")),
      );
      map.set(k, arr);
    }

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
    <div className="resourcesWrap">
      <div className="resourcesTopBar">
        <input
          className="input"
          placeholder="search resources…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="small subtle">
          {totalCount} item{totalCount === 1 ? "" : "s"}
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="emptyState">no items found.</div>
      ) : (
        <div className="resourcesGroups">
          {grouped.map((g) => (
            <section key={g.name} className="resourcesGroup">
              <div className="resourcesGroupHeader">
                <div className="resourcesGroupTitle">{prettyLabel(g.name)}</div>
                <div className="resourcesGroupCount">{g.items.length}</div>
              </div>

              <div className="resourcesItems">
                {g.items.map((r) => (
                  <div key={r.key} className="resourcesItem">
                    {r.url ? (
                      <a
                        className="resourcesLink"
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        title={r.title}
                      >
                        {r.title}
                      </a>
                    ) : (
                      <span className="resourcesTitle">{r.title}</span>
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
