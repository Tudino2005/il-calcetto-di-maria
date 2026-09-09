export const dynamic = "force-dynamic";
import Link from "next/link";
import { Trophy, Users, Play, Swords, Zap } from "lucide-react";
import WipeDataButton from "@/components/WipeDataButton";
import { prisma } from "@/lib/prisma";
import GlobalInbox from "@/components/GlobalInbox";

export default async function AdminHome() {
  const pendingRequests = await prisma.registrationRequest.findMany({
    where: { status: "pending" },
    include: { tournament: { include: { _count: { select: { registrations: true } } } } },
    orderBy: { createdAt: "asc" }
  });
  return (
    <main className="flex-1 p-4 sm:p-8 xl:p-12 w-full flex flex-col items-center min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
          IL CALCETTO DI MARIA
        </h1>
        <p className="text-slate-400 mt-3 text-2xl font-medium uppercase tracking-widest">Pannello di Controllo</p>
      </header>

      <GlobalInbox requests={pendingRequests} />

      {/* MENU */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-8">
        
        <Link href="/tournaments/quick" className="group col-span-1 md:col-span-2 lg:col-span-4 bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border-2 border-slate-700 hover:border-orange-500 hover:bg-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-center gap-6 transition-all shadow-xl text-center sm:text-left">
          <div className="bg-orange-500/20 p-5 rounded-2xl group-hover:scale-110 transition-transform shrink-0">
            <Zap className="w-10 h-10 text-orange-500" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mb-1">Torneo Volante</h2>
            <p className="text-slate-400 font-bold text-base sm:text-lg">Crea un torneo lampo in 1 click (Senza attesa)</p>
          </div>
        </Link>
<Link href="/match" className="group bg-slate-900 border-2 border-slate-700 hover:border-blue-500 hover:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all shadow-xl text-center">
          <div className="bg-blue-500/20 p-6 rounded-full group-hover:scale-110 transition-transform">
            <Play className="w-12 h-12 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Partita Libera</h2>
            <p className="text-slate-400 font-bold">Sfida 2v2 al volo</p>
          </div>
        </Link>
        
        <Link href="/tournaments" className="group bg-slate-900 border-2 border-slate-700 hover:border-purple-500 hover:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all shadow-xl text-center">
          <div className="bg-purple-500/20 p-6 rounded-full group-hover:scale-110 transition-transform">
            <Swords className="w-12 h-12 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">I Tornei</h2>
            <p className="text-slate-400 font-bold">Gestione, tabelloni, calendari</p>
          </div>
        </Link>

        <Link href="/leaderboard" className="group bg-slate-900 border-2 border-slate-700 hover:border-yellow-500 hover:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all shadow-xl text-center">
          <div className="bg-yellow-500/20 p-6 rounded-full group-hover:scale-110 transition-transform">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Classifiche</h2>
            <p className="text-slate-400 font-bold">Statistiche globali</p>
          </div>
        </Link>

        <Link href="/players" className="group bg-slate-900 border-2 border-slate-700 hover:border-emerald-500 hover:bg-slate-800 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all shadow-xl text-center">
          <div className="bg-emerald-500/20 p-6 rounded-full group-hover:scale-110 transition-transform">
            <Users className="w-12 h-12 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Anagrafica</h2>
            <p className="text-slate-400 font-bold">Iscrizione e Storico Giocatori</p>
          </div>
        </Link>
      </div>
      <WipeDataButton />
    </main>
  );
}
