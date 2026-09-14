import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Trophy, Star, Shield, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { recalculateTournamentAwards } from "@/app/actions/tournamentActions";

export const dynamic = "force-dynamic";

async function handleRecalculate(tournamentId: string): Promise<void> {
  "use server";
  await recalculateTournamentAwards(tournamentId);
}

export default async function HallOfFamePage() {
  const completedTournaments = await prisma.tournament.findMany({
    where: { status: "completed" },
    orderBy: { createdAt: "desc" },
    include: {
      winnerTeam: {
        include: { player1: true, player2: true }
      }
    }
  });

  return (
    <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" /> Torna al Menu
        </Link>
      </div>
      <header className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 mb-4 tracking-tighter uppercase drop-shadow-sm">
          Albo D&apos;Oro
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          La galleria immortale dei campioni. Qui celebriamo le squadre vincitrici e i migliori giocatori (Guantoni e Scarpa d&apos;Oro) di ogni competizione passata.
        </p>
      </header>

      {completedTournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-3xl">
          <Trophy className="w-16 h-16 text-slate-700 mb-4" />
          <h2 className="text-xl font-bold text-slate-500">Nessun torneo completato</h2>
          <p className="text-slate-600 mt-2">La storia è ancora da scrivere.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {completedTournaments.map((t) => {
            const hasAwards = !!t.awardsData;
            
            return (
              <div key={t.id} className="relative group">
                <Link href={`/tournaments/${t.id}/ceremony`}>
                  <div className="bg-slate-900 border-2 border-slate-800 hover:border-yellow-500/50 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-500/10 cursor-pointer overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                            {t.type.replace("_", " ")}
                          </span>
                          <span className="text-slate-500 text-xs font-bold">
                            {t.createdAt.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest">{t.name}</h2>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>

                    {t.winnerTeam && (
                      <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800 mb-4">
                        <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest mb-1 block">Squadra Vincitrice</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-white">{t.winnerTeam.player1.name}</span>
                          <span className="text-slate-600">&</span>
                          <span className="text-lg font-black text-white">{t.winnerTeam.player2.name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
                      <div className="flex gap-4">
                        {hasAwards ? (
                          <>
                            <div className="flex items-center gap-2 text-blue-400">
                              <Shield className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">Guantoni d&apos;Oro</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-400">
                              <Star className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">Scarpa d&apos;Oro</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-amber-500/70 italic flex items-center gap-1.5">
                            <RefreshCw className="w-3 h-3" /> Premi non calcolati
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm group-hover:translate-x-1 transition-transform">
                        Vedi Trofei <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Recalculate button – only shows when awardsData is missing */}
                {!hasAwards && t.winnerTeamId && (
                  <form
                    action={handleRecalculate.bind(null, t.id)}
                    className="absolute bottom-[5.5rem] left-6 z-10"
                  >
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Calcola Premi
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
