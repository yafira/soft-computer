import ResourcesList from "@/components/ResourcesList";

export default function ResourcesPage() {
  return (
    <main className="wrap">
      <section className="panel">
        <div className="h1" style={{ marginBottom: 6 }}>
          resources
        </div>
        <p className="p subtle" style={{ marginTop: 0 }}>
          pulled from zotero.
        </p>
        <ResourcesList />
      </section>
    </main>
  );
}
