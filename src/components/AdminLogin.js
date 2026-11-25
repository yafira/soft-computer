"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// shown on admin pages until the password is entered
export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("checking…");
    const res = await fetch("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setStatus("");
      router.refresh();
    } else {
      setStatus("that's not it");
    }
  }

  return (
    <main className="wrap">
      <form className="panel adminLogin" onSubmit={onSubmit}>
        <div className="h2">admin</div>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn">
          sign in
        </button>
        {status && <span className="small subtle">{status}</span>}
      </form>
    </main>
  );
}
