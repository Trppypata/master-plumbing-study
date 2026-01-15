'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-[var(--color-text-secondary)] mb-8 max-w-md">
        An unexpected error occurred. Don't worry, your progress is safe.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="btn btn-primary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
        <Link href="/" className="btn btn-secondary flex items-center gap-2">
          <Home className="w-4 h-4" />
          Go home
        </Link>
      </div>
    </div>
  );
}
