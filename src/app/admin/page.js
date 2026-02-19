import PunchCard from "@/components/PunchCard";
import ConceptGallery from "@/components/ConceptGallery";
import { redis } from "@/lib/redis";

async function getEntries() {
  try {
    const raw = await redis.get("softcomputer:logs");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const entries = await getEntries();

  return (
    <main className="wrap">
      <section className="panel">
        <PunchCard readOnly={false} publishedEntries={entries} />
      </section>
      <section className="panel">
        <ConceptGallery admin={true} />
      </section>
    </main>
  );
}
