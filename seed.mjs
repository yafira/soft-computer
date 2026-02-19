import { Redis } from "@upstash/redis";
import { readFileSync } from "fs";

const redis = new Redis({
  url: "YOUR_NEW_URL_AFTER_ROTATING",
  token: "YOUR_NEW_TOKEN_AFTER_ROTATING",
});

const file = JSON.parse(readFileSync("./process-memory.json", "utf8"));
const entries = (file.entries ?? file).map((e) => ({
  ...e,
  createdAt: e.createdAt
    ? typeof e.createdAt === "number"
      ? e.createdAt
      : new Date(e.createdAt).getTime()
    : new Date(e.date || Date.now()).getTime(),
}));

await redis.set("softcomputer:logs", entries);
console.log("seeded", entries.length, "entries");
