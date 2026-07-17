'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Route error', error.digest || error.message);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-950">We could not load this page</h1>
      <p className="mt-4 text-slate-600">Please try again. If the problem continues, our travel team can help you directly.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">Try again</button>
        <Link href="/contact" className="border border-slate-300 px-6 py-3 font-semibold text-slate-800 hover:bg-slate-50">Contact support</Link>
      </div>
    </main>
  );
}
