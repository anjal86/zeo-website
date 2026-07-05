export const revalidate = 3600;
export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
        Phase 1 / Phase 2
      </p>
      <h1 className="mt-3 text-4xl font-bold text-primary">
        Zeo Tourism Next.js migration shell
      </h1>
      <p className="mt-4 text-lg text-slate-700">
        This app currently contains infrastructure only: environment validation,
        MySQL utilities, migrations, admin bootstrap, and JSON import tooling.
        UI migration starts in a later phase.
      </p>
    </main>
  );
}
