export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import QuickTournamentForm from "@/components/QuickTournamentForm";

export default async function QuickTournamentPage() {
  const players = await prisma.player.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" /> Torneo Volante
          </h1>
          <p className="text-slate-400 font-bold mt-1">Configura formato e appello dei presenti per generare subito il tabellone.</p>
        </div>
      </header>

      <QuickTournamentForm players={players} />
    </main>
  );
}
