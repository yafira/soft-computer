"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function login() {
    setStatus("checking…");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setStatus("authorized ✿");
    } else {
      setStatus("wrong password");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setStatus("logged out");
  }

  return (
    <main className="wrap">
      <section className="panel" style={{ maxWidth: 460 }}>
        <div className="h1">admin</div>

        <input
          className="input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button className="btn" onClick={login}>
            login
          </button>

          <button className="btn ghost" onClick={logout}>
            logout
          </button>
        </div>

        {status ? (
          <div className="small subtle" style={{ marginTop: 10 }}>
            {status}
          </div>
        ) : null}
      </section>
    </main>
  );
}
