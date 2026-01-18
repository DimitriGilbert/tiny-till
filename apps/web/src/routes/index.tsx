import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: TallyPage,
});

function TallyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Tally</h1>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <p className="text-muted-foreground">
            Product grid will be displayed here.
          </p>
        </section>
      </div>
    </div>
  );
}

