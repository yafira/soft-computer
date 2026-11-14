"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import s from "../app/eink.module.css";
import SoftDock from "./SoftDock";

// the pad and felt buttons stay under every page, so a page never leaves the frame
export default function OsDock() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // lets the homepage know the computer is already awake
    if (pathname !== "/") window.__softAwake = true;
  }, [pathname]);

  // no dock on the homepage (it has its own) or in admin (kept plain)
  if (pathname === "/" || pathname.startsWith("/admin")) return null;

  function press(key) {
    try {
      window.sessionStorage.setItem("softcomputer-play", key);
    } catch {}
    router.push("/");
  }

  return (
    <SoftDock
      active={null}
      onPress={press}
      onTouch={() => {}}
      padGone
      side={
        <Link href="/" className={s.play}>
          home
        </Link>
      }
    />
  );
}
