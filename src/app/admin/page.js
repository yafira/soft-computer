import AdminLogEditor from "@/components/AdminLogEditor";
import ConceptGallery from "@/components/ConceptGallery";

export default function AdminPage() {
  return (
    <main className="wrap">
      <section className="panel">
        <AdminLogEditor />
      </section>
      <section className="panel">
        <ConceptGallery />
      </section>
    </main>
  );
}
