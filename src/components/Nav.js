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
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <div style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              soft.computer
            </div>
            <div className="small">process memory</div>
          </div>
        </Link>

        <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
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
