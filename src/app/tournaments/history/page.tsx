export const dynamic = "force-dynamic";
import { getTournaments } from "@/app/actions/tournamentActions";
import Link from "next/link";
import DeleteTournamentButton from "@/components/DeleteTournamentButton";
import { ArrowLeft, Archive, Trophy } from "lucide-react";

export default async function HistoryPage() {
  const allTournaments = await getTournaments();
  const tournaments = allTournaments.filter(t => t.status === 'completed');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4">
          <Link href="/tournaments" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Archive className="w-8 h-8 text-slate-400" /> Archivio Tornei
          </h1>
        </div>
      </header>

      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg">
        {tournaments.length === 0 ? (
          <div className="text-center py-20">
            <Archive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-xl font-medium">L'archivio è ancora vuoto.</p>
            <p className="text-slate-500 mt-2">I tornei completati appariranno qui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {tournaments.map((t) => (
              <Link key={t.id} href={`/tournaments/${t.id}`}>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-slate-500 transition-colors group h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-white group-hover:text-slate-300 transition-colors line-clamp-2">{t.name}</h3>
                    <div className="flex items-center ml-4 shrink-0">
                      <DeleteTournamentButton tournamentId={t.id} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold w-24">Formato:</span>
                      <span className="bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded text-xs border border-purple-500/20">{t.format.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold w-24">Tipo:</span>
                      <span className="bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded text-xs border border-blue-500/20">{t.type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold w-24">Data:</span>
                      <span className="text-slate-300 font-medium">
                        {new Date(t.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold">
                      <Trophy className="w-5 h-5" /> 
                      <span className="text-sm">Completato</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
