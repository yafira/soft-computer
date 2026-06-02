import Link from "next/link";

export default function Nav() {
  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="brandRow">
            <span className="brandName">soft.computer</span>
            <span className="brandSub">process memory</span>
          </div>
        </Link>
        <nav className="nav">
          <Link href="/about" className="kbd">
            about
          </Link>
          <Link href="/process" className="kbd">
            process
          </Link>
          <Link href="/resources" className="kbd">
            resources
          </Link>
          <Link href="/log" className="kbd">
            log
          </Link>
        </nav>
      </div>
    </header>
  );
}
