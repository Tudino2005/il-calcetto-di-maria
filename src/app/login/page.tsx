"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/authActions";
import { Lock, ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("password", password);

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/admin");
      router.refresh(); // Force refresh to update layouts/middleware
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-center text-white mb-2 tracking-widest uppercase">
          Accesso Admin
        </h1>
        <p className="text-slate-400 text-center mb-8 font-medium">
          Inserisci la password segreta per accedere all'area gestionale.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-center text-xl tracking-widest"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? "Verifica..." : "Entra"} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 font-bold transition-colors">
            <Home className="w-4 h-4" /> Torna alla Home TV
          </Link>
        </div>
      </div>
    </div>
  );
}
