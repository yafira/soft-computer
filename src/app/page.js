import Link from "next/link";

export default function HomePage() {
  return (
    <section className="panel">
      <div className="h1">soft computer</div>
      <p className="p">
        a minimal log of my thesis process — research, prototypes,
        conversations, doubts, breakthroughs. each time i show up, i write to
        memory.
      </p>

      <div className="grid">
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>punch card</div>
          <p className="p">
            click a day → write a tiny log → the slot becomes punched.
          </p>
          <Link href="/punch" className="kbd">
            open punch card →
          </Link>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 6 }}>timeline</div>
          <p className="p">
            a chronological list of everything you’ve written so far.
          </p>
          <Link href="/log" className="kbd">
            open timeline →
          </Link>
        </div>
      </div>

      <hr />

      <p className="p">
        tip: this demo saves to <span className="kbd">localStorage</span> so it
        persists on your browser. later we’ll swap to a real backend (md files,
        json, notion, etc).
      </p>
    </section>
  );
}
