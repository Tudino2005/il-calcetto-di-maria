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
    <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Anagrafica Giocatori</h1>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <PlayerForm />

        <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <div className="flex flex-col mb-6">
            <h2 className="text-xl font-bold text-white">Giocatori Registrati ({players.length})</h2>
            <div className="flex gap-3 mt-3">
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="attaccante" className="w-6 h-6" /></div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'attaccante').length}</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="portiere" className="w-6 h-6" /></div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'portiere').length}</div>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-center">
                <div className="text-xs text-slate-500 font-bold uppercase flex justify-center mb-1"><RoleIcon role="entrambi" className="w-6 h-6" /></div>
                <div className="text-lg font-black text-white">{players.filter(p => p.preferredRole === 'entrambi').length}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nessun giocatore registrato.</p>
            ) : (
              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700 hover:border-emerald-500 transition-colors">
                  <span className="font-bold text-lg text-white">{p.name}</span>
                  <span className="bg-slate-800 p-2 rounded-lg">
                    <RoleIcon role={p.preferredRole} className="w-8 h-8" />
                  </span>
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
