"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = ["about", "process", "make", "language", "resources", "log"];

function Flower() {
  return (
    <span
      className="blossom"
      style={{ width: 18, height: 18 }}
      aria-hidden="true"
    />
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
