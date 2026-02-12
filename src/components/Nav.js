import Link from "next/link";

export default function Nav() {
  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link href="/" className="brand">
          <div className="brandRow">
            <div className="brandName">soft.computer</div>
            <div className="small subtle">process memory</div>
          </div>
        </Link>

        <nav className="nav">
          <Link href="/log" className="kbd">
            log
          </Link>
        </nav>
      </div>
    </header>
  );
}
