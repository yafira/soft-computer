import { NextResponse } from "next/server";

const ZOTERO_API_BASE = "https://api.zotero.org";
const API_VERSION = "3";

function zoteroHeaders(apiKey) {
  const headers = {
    "Zotero-API-Version": API_VERSION,
    Accept: "application/json",
  };

  // zotero supports this header (most reliable)
  if (apiKey) headers["Zotero-API-Key"] = apiKey;

  return headers;
}

async function fetchAllPages(url, headers) {
  // zotero pagination uses Link headers; we can do a simple loop using start
  const out = [];
  let start = 0;
  const limit = 100;

  while (true) {
    const u = new URL(url);
    u.searchParams.set("limit", String(limit));
    u.searchParams.set("start", String(start));

    const res = await fetch(u.toString(), { headers, cache: "no-store" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `zotero fetch failed (${res.status}): ${text.slice(0, 300)}`,
      );
    }

    const page = await res.json();
    const arr = Array.isArray(page) ? page : [];
    out.push(...arr);

    if (arr.length < limit) break;
    start += limit;
  }

  return out;
}

function buildCollectionMaps(collections) {
  // zotero collections have: key, data.name, data.parentCollection
  const byKey = new Map();
  const children = new Map();

  for (const c of collections) {
    const key = c?.key;
    const name = c?.data?.name || "untitled";
    const parent = c?.data?.parentCollection || null;

    if (!key) continue;

    byKey.set(key, { key, name, parent });

    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(key);
  }

  function pathFor(key) {
    const parts = [];
    let cur = byKey.get(key);

    while (cur) {
      parts.push(cur.name);
      cur = cur.parent ? byKey.get(cur.parent) : null;
    }

    return parts.reverse().join(" / ");
  }

  function collectDescendants(rootKey) {
    const acc = [];
    const stack = [rootKey];
    const seen = new Set();

    while (stack.length) {
      const k = stack.pop();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      acc.push(k);

      const kids = children.get(k) || [];
      for (const childKey of kids) stack.push(childKey);
    }

    return acc;
  }

  return { byKey, pathFor, collectDescendants };
}

function normalizeYear(yearRaw) {
  const s = String(yearRaw || "").trim();
  if (!s) return "";
  const m = s.match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : s.slice(0, 4);
}

export async function GET() {
  const userId = process.env.ZOTERO_USER_ID; // you said: 18019341
  const rootCollectionKey = process.env.ZOTERO_COLLECTION_KEY || ""; // optional
  const apiKey = process.env.ZOTERO_API_KEY || ""; // optional (private libraries)

  if (!userId) {
    return NextResponse.json(
      { error: "missing ZOTERO_USER_ID" },
      { status: 500 },
    );
  }

  try {
    const headers = zoteroHeaders(apiKey);

    // 1) fetch collections so we can build subcollection paths
    const collectionsUrl = `${ZOTERO_API_BASE}/users/${encodeURIComponent(
      userId,
    )}/collections?format=json`;

    const collections = await fetchAllPages(collectionsUrl, headers);
    const { pathFor, collectDescendants } = buildCollectionMaps(collections);

    // 2) decide which collections to include
    let collectionKeysToFetch = null;

    if (rootCollectionKey) {
      collectionKeysToFetch = collectDescendants(rootCollectionKey);
      // if key is wrong, descendants will just be [rootKey] but fetch might return 0
    }

    // 3) fetch items
    const items = [];
    const seenItemKeys = new Set();

    if (collectionKeysToFetch && collectionKeysToFetch.length) {
      // fetch each collection’s items (zotero does NOT recurse automatically)
      for (const ck of collectionKeysToFetch) {
        const itemsUrl =
          `${ZOTERO_API_BASE}/users/${encodeURIComponent(userId)}` +
          `/collections/${encodeURIComponent(ck)}/items?format=json&include=data&itemType=-attachment`;

        const page = await fetchAllPages(itemsUrl, headers);
        for (const it of page) {
          const k = it?.key;
          if (!k || seenItemKeys.has(k)) continue;
          seenItemKeys.add(k);
          items.push(it);
        }
      }
    } else {
      // fetch all items in the user library
      const itemsUrl =
        `${ZOTERO_API_BASE}/users/${encodeURIComponent(userId)}` +
        `/items?format=json&include=data&itemType=-attachment`;

      const all = await fetchAllPages(itemsUrl, headers);
      items.push(...all);
    }

    // 4) map resources with collection paths
    const resources = (Array.isArray(items) ? items : [])
      .filter(
        (it) =>
          it?.data?.itemType !== "attachment" && it?.data?.itemType !== "note",
      )
      .map((it) => {
        const d = it.data || {};
        const creators = Array.isArray(d.creators) ? d.creators : [];
        const author = creators[0]
          ? [creators[0].firstName, creators[0].lastName]
              .filter(Boolean)
              .join(" ")
          : "";

        const membership = Array.isArray(d.collections) ? d.collections : [];
        const collectionPaths = membership
          .map((k) => pathFor(k))
          .filter(Boolean);

        return {
          key: it.key,
          title: d.title || "untitled",
          author,
          year: normalizeYear(d.date),
          url: d.url || "",
          itemType: d.itemType || "",
          tags: (d.tags || []).map((t) => t.tag).filter(Boolean),
          collections: collectionPaths, // ✅ this is what your UI groups by
        };
      });

    // newest first (best-effort)
    resources.sort((a, b) =>
      String(b.year || "").localeCompare(String(a.year || "")),
    );

    return NextResponse.json({ resources });
  } catch (err) {
    return NextResponse.json(
      { error: "zotero route crashed", details: String(err) },
      { status: 500 },
    );
  }
}
