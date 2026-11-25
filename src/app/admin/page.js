import PunchCard from "@/components/PunchCard";
import ConceptGallery from "@/components/ConceptGallery";
import { redis } from "@/lib/redis";
import { isAdmin } from "@/lib/adminAuth";
import AdminLogin from "@/components/AdminLogin";

async function getEntries() {
  try {
    const raw = await redis.get("softcomputer:logs");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;
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
