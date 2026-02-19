import AdminLogEditor from "@/components/AdminLogEditor";
import ConceptGallery from "@/components/ConceptGallery";
import PunchCard from "@/components/PunchCard";

export default function AdminPage() {
  return (
    <main className="wrap">
      <section className="panel">
        <div className="h2" style={{ marginBottom: 8 }}>
          punch card
        </div>
        <PunchCard readOnly={false} />
      </section>
      <section className="panel">
        <AdminLogEditor />
      </section>
      <section className="panel">
        <ConceptGallery />
      </section>
    </main>
  );
}
