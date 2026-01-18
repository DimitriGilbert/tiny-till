import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Theme Management</h2>
          <p className="text-muted-foreground">Theme options will be displayed here.</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Display Preferences</h2>
          <p className="text-muted-foreground">Display options will be displayed here.</p>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Data Portability</h2>
          <p className="text-muted-foreground">Export/Import options will be displayed here.</p>
        </section>
      </div>
    </div>
  );
}
