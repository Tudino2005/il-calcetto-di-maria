"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error:", error);
  }, [error]);

  return (
    <html lang="it" className="dark">
      <body className="bg-slate-900 text-slate-50 antialiased min-h-screen">
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-6 text-red-400 animate-bounce">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 uppercase tracking-wide text-white">
            Si è verificato un errore
          </h1>
          <p className="text-slate-400 max-w-lg mb-4 text-sm sm:text-base">
            {error.message || "Errore imprevisto nel caricamento dell'applicazione."}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg mb-6">
              Digest: {error.digest}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap justify-center mt-2">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Riprova</span>
            </button>
            <Link
              href="/admin"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-2 transition active:scale-95 border border-slate-700"
            >
              <Home className="w-5 h-5" />
              <span>Pannello di Controllo</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
