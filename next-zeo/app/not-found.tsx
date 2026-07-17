import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-950">This journey could not be found</h1>
      <p className="mt-4 max-w-xl text-slate-600">
        The page may have moved or the address may be incorrect. Continue exploring our current tours and travel guides.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/tours" className="bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">Explore tours</Link>
        <Link href="/" className="border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">Return home</Link>
      </div>
    </main>
  );
}
