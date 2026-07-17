export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading page" className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-6 py-16">
      <div className="h-10 w-2/3 bg-slate-200" />
      <div className="mt-5 h-5 w-full max-w-2xl bg-slate-100" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((item) => <div key={item} className="h-72 bg-slate-100" />)}
      </div>
      <span className="sr-only">Loading content</span>
    </main>
  );
}
