export async function saveLogToRedis({ label, text }) {
  const res = await fetch("/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ label, text }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`save failed (${res.status}): ${t.slice(0, 200)}`);
  }

  // let /log + timeline preview refresh if they’re open
  window.dispatchEvent(new Event("softcomputer-logs-updated"));

  return res.json();
}