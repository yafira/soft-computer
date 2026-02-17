import { NextResponse } from "next/server";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function creatorToName(c) {
  if (!c) return "";
  const parts = [c.firstName, c.lastName].filter(Boolean);
  return parts.join(" ").trim();
}

export async function GET() {
  const userId = process.env.ZOTERO_USER_ID;
  const rootCollectionKey = process.env.ZOTERO_COLLECTION_KEY; // required
  const apiKey = process.env.ZOTERO_API_KEY || "";

  if (!userId) {
    return NextResponse.json(
      { error: "missing ZOTERO_USER_ID" },
      { status: 500 },
    );
  }
  if (!rootCollectionKey) {
    return NextResponse.json(
      { error: "missing ZOTERO_COLLECTION_KEY" },
      { status: 500 },
    );
  }

  const headers = {
    "Zotero-API-Version": "3",
    Accept: "application/json",
  };

  // zotero supports api key header like this
  if (apiKey) headers["Zotero-API-Key"] = apiKey;

  const base = `https://api.zotero.org/users/${encodeURIComponent(userId)}`;

  try {
    // 1) fetch all collections so we can find subcollections of the root
    const colRes = await fetch(`${base}/collections?limit=500`, {
      headers,
      cache: "no-store",
    });

    if (!colRes.ok) {
      const t = await colRes.text();
      return NextResponse.json(
        {
          error: "zotero collections fetch failed",
          status: colRes.status,
          details: t.slice(0, 500),
        },
        { status: 500 },
      );
    }

    const collections = safeArray(await colRes.json());

    // build parent -> children map and key -> name map
    const childrenByParent = new Map();
    const nameByKey = new Map();

    for (const c of collections) {
      const key = c?.key;
      const name = c?.data?.name || "";
      const parent = c?.data?.parentCollection || null;

      if (key) nameByKey.set(key, name);

      if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
      if (key) childrenByParent.get(parent).push(key);
    }

    // collect all collection keys in the subtree of rootCollectionKey
    const subtreeKeys = new Set([rootCollectionKey]);
    const stack = [rootCollectionKey];

    while (stack.length) {
      const k = stack.pop();
      const kids = childrenByParent.get(k) || [];
      for (const childKey of kids) {
        if (!subtreeKeys.has(childKey)) {
          subtreeKeys.add(childKey);
          stack.push(childKey);
        }
      }
    }

    // 2) fetch items for EACH collection in that subtree
    // (zotero does not have a single “recursive items” endpoint)
    const allItems = [];
    const byKey = new Map(); // de-dupe items across multiple collections

    for (const colKey of subtreeKeys) {
      const itemsUrl =
        `${base}/collections/${encodeURIComponent(colKey)}/items` +
        `?format=json&include=data&limit=100`;

      const itemsRes = await fetch(itemsUrl, { headers, cache: "no-store" });

      if (!itemsRes.ok) {
        const t = await itemsRes.text();
        return NextResponse.json(
          {
            error: "zotero items fetch failed",
            status: itemsRes.status,
            details: t.slice(0, 500),
            failedCollection: colKey,
          },
          { status: 500 },
        );
      }

      const items = safeArray(await itemsRes.json());

      for (const it of items) {
        const itemKey = it?.key;
        const d = it?.data || {};
        const itemType = d.itemType;

        // skip attachments + notes
        if (itemType === "attachment" || itemType === "note") continue;

        if (!itemKey) continue;

        // track which collection(s) it came from
        const existing = byKey.get(itemKey);
        if (existing) {
          existing.collectionKeys.add(colKey);
        } else {
          byKey.set(itemKey, { raw: it, collectionKeys: new Set([colKey]) });
        }
      }
    }

    // 3) map into UI shape, include collection names
    for (const { raw, collectionKeys } of byKey.values()) {
      const d = raw?.data || {};
      const creators = safeArray(d.creators);

      const author = creators.length > 0 ? creatorToName(creators[0]) : "";

      const year = (d.date || "").slice(0, 4);

      const colNames = [...collectionKeys]
        .map((k) => nameByKey.get(k) || k)
        .filter(Boolean);

      allItems.push({
        key: raw.key,
        title: d.title || "untitled",
        author,
        year,
        url: d.url || "",
        itemType: d.itemType || "",
        tags: safeArray(d.tags)
          .map((t) => t?.tag)
          .filter(Boolean),
        collections: colNames, // ✅ add this
      });
    }

    // sort newest-ish (year desc, then title)
    allItems.sort((a, b) => {
      const ay = Number(a.year) || 0;
      const by = Number(b.year) || 0;
      if (by !== ay) return by - ay;
      return String(a.title).localeCompare(String(b.title));
    });

    return NextResponse.json({ resources: allItems });
  } catch (err) {
    return NextResponse.json(
      { error: "zotero route crashed", details: String(err) },
      { status: 500 },
    );
  }
}
