import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Trophy, Shield, Star, Crown } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export const dynamic = "force-dynamic";

export default async function CeremonyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id }
  });

  if (!tournament || !tournament.awardsData) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-900">
        <Trophy className="w-24 h-24 text-slate-700 mb-6" />
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Premi non disponibili</h1>
        <p className="text-slate-400">Questo torneo non ha premi salvati o è antecedente all'introduzione dell'Albo d'Oro.</p>
        <Link href="/hall-of-fame" className="mt-8 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">Torna all'Albo d'Oro</Link>
      </main>
    );
  }

  const awards = typeof tournament.awardsData === 'string' ? JSON.parse(tournament.awardsData) : tournament.awardsData;
  const { winningTeam, goldenGloves, goldenBoots } = awards as any;

  return (
    <main className="flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* HEADER */}
      <header className="h-[15vh] flex items-center justify-center flex-col relative z-10 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 uppercase tracking-widest drop-shadow-lg">
          {tournament.name}
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Cerimonia di Premiazione</p>
        
        {/* Back button (hidden on real TV, useful for admin) */}
        <Link href="/hall-of-fame" className="absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-500 hover:text-white transition-colors hover:scale-110">
          ✕
        </Link>
      </header>

      {/* SPLIT SCREEN AWARDS */}
      <div className="flex-1 flex flex-col lg:flex-row w-full h-[65vh]">
        {/* LEFT: GUANTONI D'ORO */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-slate-800/50 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950 z-0"></div>
          <div className="absolute -left-32 -top-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-1000"></div>
          
          <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="w-32 h-32 mb-6 rounded-full bg-blue-500/10 border-4 border-blue-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
              <Shield className="w-16 h-16 text-blue-400" />
            </div>
            <h2 className="text-4xl font-black text-blue-400 uppercase tracking-widest mb-2 drop-shadow-md">Guantoni d'Oro</h2>
            <p className="text-blue-200/60 font-bold tracking-widest uppercase text-sm mb-12">Il Muro Invalicabile</p>

            {goldenGloves && goldenGloves.length > 0 ? (
              <div className="flex flex-col items-center gap-6">
                {goldenGloves.map((gk: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 text-center">
                      {gk.player.name}
                    </span>
                    <div className="flex gap-4">
                      <div className="px-6 py-2 bg-blue-950/50 border border-blue-900/50 rounded-xl flex flex-col items-center">
                        <span className="text-blue-400 text-3xl font-black">{gk.stats.defensiveIndex}</span>
                        <span className="text-[10px] text-blue-300/50 font-bold uppercase tracking-widest">Gol Subiti / Match</span>
                      </div>
                      <div className="px-6 py-2 bg-blue-950/50 border border-blue-900/50 rounded-xl flex flex-col items-center">
                        <span className="text-blue-400 text-3xl font-black">{gk.stats.gkWinRate}%</span>
                        <span className="text-[10px] text-blue-300/50 font-bold uppercase tracking-widest">Vittorie</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Nessun portiere qualificato</p>
            )}
          </div>
        </div>

        {/* RIGHT: SCARPA D'ORO */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-bl from-red-900/30 to-slate-950 z-0"></div>
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-1000"></div>

          <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-1000 delay-300 fill-mode-both">
            <div className="w-32 h-32 mb-6 rounded-full bg-red-500/10 border-4 border-red-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <Star className="w-16 h-16 text-red-400" />
            </div>
            <h2 className="text-4xl font-black text-red-400 uppercase tracking-widest mb-2 drop-shadow-md">Scarpa d'Oro</h2>
            <p className="text-red-200/60 font-bold tracking-widest uppercase text-sm mb-12">Il Cecchino Implacabile</p>

            {goldenBoots && goldenBoots.length > 0 ? (
              <div className="flex flex-col items-center gap-6">
                {goldenBoots.map((st: any, idx: number) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-4 text-center">
                      {st.player.name}
                    </span>
                    <div className="flex gap-4">
                      <div className="px-6 py-2 bg-red-950/50 border border-red-900/50 rounded-xl flex flex-col items-center">
                        <span className="text-red-400 text-3xl font-black">{st.stats.offensiveIndex}</span>
                        <span className="text-[10px] text-red-300/50 font-bold uppercase tracking-widest">Gol Fatti / Match</span>
                      </div>
                      <div className="px-6 py-2 bg-red-950/50 border border-red-900/50 rounded-xl flex flex-col items-center">
                        <span className="text-red-400 text-3xl font-black">{st.stats.stWinRate}%</span>
                        <span className="text-[10px] text-red-300/50 font-bold uppercase tracking-widest">Vittorie</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">Nessun attaccante qualificato</p>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: WINNING TEAM */}
      <div className="h-[20vh] relative z-20 flex flex-col items-center justify-center bg-gradient-to-t from-yellow-900/40 via-yellow-950/20 to-transparent border-t border-yellow-900/30 overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/5 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 fill-mode-both">
          <div className="flex items-center gap-4 mb-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h3 className="text-2xl font-black text-yellow-500 uppercase tracking-widest">Campioni del Torneo</h3>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
          
          {winningTeam ? (
            <div className="flex flex-col items-center">
              <div className="text-4xl lg:text-5xl font-black text-white uppercase tracking-widest mb-4">
                {winningTeam.team?.player1?.name} <span className="text-yellow-600 px-2">&</span> {winningTeam.team?.player2?.name}
              </div>
              <div className="flex gap-8 text-yellow-200/70 font-bold text-sm tracking-widest uppercase">
                <span>{winningTeam.stats?.matchesWon}/{winningTeam.stats?.matchesPlayed} Vittorie</span>
                <span>•</span>
                <span>{winningTeam.stats?.winRate}% Win Rate</span>
                <span>•</span>
                <span>{winningTeam.stats?.goalsScored} Gol Fatti</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-500">Dati squadra vincitrice non disponibili</span>
          )}
        </div>
      </div>
    </main>
  );
}
