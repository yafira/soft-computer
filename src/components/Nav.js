"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = ["about", "process", "make", "resources", "log"];

function Flower() {
  const petals = [0, 1, 2, 3, 4].map((i) => {
    const a = ((i * 72 - 90) * Math.PI) / 180;
    return (
      <circle
        key={i}
        cx={(50 + 26 * Math.cos(a)).toFixed(2)}
        cy={(50 + 26 * Math.sin(a)).toFixed(2)}
        r="24"
      />
    );
  });
  return (
    <svg viewBox="0 0 100 100" width="18" height="18" fill="currentColor" aria-hidden="true">
      {petals}
      <circle cx="50" cy="50" r="20" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  // the homepage is the full e-ink screen, it draws its own bar
  if (pathname === "/") return null;

  const here = pathname.split("/")[1] || "";

  return (
    <>
      <header className="osBar">
        <Link href="/" className="osHome">
          <Flower />
          soft os
        </Link>
        <nav className="osMenu">
          {PAGES.map((p) => (
            <Link
              key={p}
              href={"/" + p}
              className={"osItem" + (p === here ? " osItemOn" : "")}
            >
              {p}
            </Link>
          ))}
        </nav>
        <span className="osTime">404 time not found</span>
      </header>

      {/* title bar of the window the page sits in; the box closes it back to the desktop */}
      <div className="osTitle">
        <Link href="/" className="osClose" aria-label="close, back to the desktop" />
        <span className="osTitleName">{here}</span>
      </div>

      {/* the screen refreshes every time a folder opens */}
      <div key={pathname} className="osRefresh" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </>
  );
}
