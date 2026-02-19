import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";

const redis = new Redis({
  url: "https://lasting-hagfish-21868.upstash.io",
  token: "AVVsAAIncDIyMjZhNTA0OTk2ZTM0MjIxOTkwM2JlOTlkYTdjY2Q2ZXAyMjE4Njg",
});

const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

function labelToTimestamp(label) {
  const parts = String(label || "")
    .toLowerCase()
    .trim()
    .split(/\s+/);
  if (parts.length < 2) return Date.now();
  const m = months.indexOf(parts[0]);
  const d = parseInt(parts[1]);
  if (m < 0 || isNaN(d)) return Date.now();
  return new Date(2026, m, d, 12, 0, 0).getTime();
}

const file = JSON.parse(readFileSync("./process-memory.json", "utf8"));
const entries = (file.entries ?? file).map((e) => ({
  ...e,
  createdAt: labelToTimestamp(e.label),
}));

await redis.set("softcomputer:logs", entries);
console.log("seeded", entries.length, "entries");
