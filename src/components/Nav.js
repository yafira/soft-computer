import Link from "next/link";

export default function Nav() {
  return (
    <header style={{ padding: "18px 18px 0" }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <div className="brandRow">
            <span className="brandName">the soft computer</span>
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
