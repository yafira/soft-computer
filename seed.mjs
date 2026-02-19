import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";

const redis = new Redis({
  url: "https://lasting-hagfish-21868.upstash.io",
  token: "AVVsAAIncDIyMjZhNTA0OTk2ZTM0MjIxOTkwM2JlOTlkYTdjY2Q2ZXAyMjE4Njg",
});

const file = JSON.parse(readFileSync("./process-memory.json", "utf8"));
const entries = file.entries ?? file;

await redis.set("softcomputer:logs", entries);
console.log("seeded", entries.length, "entries");
