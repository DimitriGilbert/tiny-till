import { createFileRoute, Link } from "@tanstack/react-router";

import { ProductList } from "@/components/product-list";

export const Route = createFileRoute("/")({
  component: TallyPage,
});

function TallyPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tally</h1>
        <p className="text-muted-foreground mt-1">
          Select products to add to your tally
        </p>
      </header>
      <ProductList />
    </div>
  );
}

