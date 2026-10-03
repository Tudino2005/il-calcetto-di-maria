export const dynamic = "force-dynamic";
import { getPlayers, createPlayer } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import RoleIcon from "@/components/RoleIcon";
import WipeAllDataButton from "@/components/WipeAllDataButton";
import PlayerForm from "@/components/PlayerForm";
import { revalidatePath } from "next/cache";

export default async function PlayersPage() {
  const players = await getPlayers();


  return (
    <main className="flex-1 p-4 sm:p-8 xl:p-12 w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Anagrafica Giocatori</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-4">
          <PlayerForm />
        </div>

        <section className="lg:col-span-8 xl:col-span-8 bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-start md:gap-10 gap-4 mb-8">
            <h2 className="text-xl font-bold text-white whitespace-nowrap">Giocatori Registrati ({players.length})</h2>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <RoleIcon role="attaccante" className="w-5 h-5 opacity-90" />
                <span className="text-slate-400 font-bold text-sm tracking-wide">Attaccanti</span>
                <span className="text-white font-black text-base">{players.filter(p => p.preferredRole === 'attaccante').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <RoleIcon role="portiere" className="w-5 h-5 opacity-90" />
                <span className="text-slate-400 font-bold text-sm tracking-wide">Difensori</span>
                <span className="text-white font-black text-base">{players.filter(p => p.preferredRole === 'portiere').length}</span>
              </div>
              <div className="flex items-center gap-2">
                <RoleIcon role="entrambi" className="w-5 h-5 opacity-90" />
                <span className="text-slate-400 font-bold text-sm tracking-wide">Entrambi</span>
                <span className="text-white font-black text-base">{players.filter(p => p.preferredRole === 'entrambi').length}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-8 col-span-full">Nessun giocatore registrato.</p>
            ) : (
              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} title="Clicca per aprire la scheda del giocatore" className="flex flex-col items-center justify-start transition-all group cursor-pointer py-2">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3">
                    {p.avatarUrl ? (
                      <img src={`/players/${p.avatarUrl}`} alt={p.name} className="w-full h-full object-cover rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-slate-800 flex items-center justify-center text-xl font-black text-emerald-400 group-hover:scale-105 transition-transform">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-sm text-white truncate w-full text-center mb-2">{p.name}</span>
                  <RoleIcon role={p.preferredRole} className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
      <div className="mt-16 border-t border-slate-800 pt-8">
        <WipeAllDataButton />
      </div>
    </main>
  );
}
