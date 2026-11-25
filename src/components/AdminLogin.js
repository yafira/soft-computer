"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// shown on admin pages until the password is entered, as an old system dialog
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
      setStatus("that's not it. try again.");
      setPassword("");
    }
  }

  return (
    <main className="loginScreen">
      <form className="loginDialog" onSubmit={onSubmit}>
        <div className="loginTitle">
          <span className="loginTitleName">sign in</span>
        </div>
        <div className="loginBody">
          <span className="blossom loginBlossom" aria-hidden="true" />
          <div className="loginFields">
            <p className="loginText">
              welcome to soft os.
              <br />
              enter the password to open admin.
            </p>
            <label className="loginLabel">
              password
              <input
                className="loginInput"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </label>
            <p className="loginStatus" role="status">
              {status}
            </p>
          </div>
        </div>
        <div className="loginActions">
          <Link href="/" className="loginButton">
            cancel
          </Link>
          <span className="loginDefault">
            <button type="submit" className="loginButton">
              sign in
            </button>
          </span>
        </div>
      </form>
    </main>
  );
}
