import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/catalog")({
  component: CatalogPage,
});

function CatalogPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <Link to="/settings" className="text-blue-500 hover:underline">
        ← Back to Settings
      </Link>
      <h1 className="text-2xl font-bold mb-4 mt-2">Catalog Management</h1>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Product List</h2>
          <p className="text-muted-foreground">Products will be displayed here.</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Add Product</h2>
          <p className="text-muted-foreground">Add product form will be displayed here.</p>
        </section>
      </div>
    </div>
  );
}
