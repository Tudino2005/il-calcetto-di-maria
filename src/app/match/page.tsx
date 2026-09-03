export const dynamic = "force-dynamic";
import { getPlayers, createTeam, createMatch } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { redirect } from "next/navigation";

export default async function NewMatchPage() {
  const players = await getPlayers();

  async function startMatch(formData: FormData) {
    "use server";
    const teamA1 = formData.get("teamA1") as string;
    const teamA2 = formData.get("teamA2") as string;
    const teamB1 = formData.get("teamB1") as string;
    const teamB2 = formData.get("teamB2") as string;

    if (!teamA1 || !teamA2 || !teamB1 || !teamB2) return;
    if (new Set([teamA1, teamA2, teamB1, teamB2]).size !== 4) {
      // Must select 4 distinct players
      return;
    }

    const teamA = await createTeam(teamA1, teamA2);
    const teamB = await createTeam(teamB1, teamB2);

    const match = await createMatch(teamA.id, teamB.id);
    redirect(`/match/${match.id}`);
  }

  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Nuova Partita Libera</h1>
        </div>
      </header>

      {players.length < 4 ? (
        <div className="bg-slate-800 p-8 rounded-3xl text-center">
          <p className="text-xl text-slate-300">Servono almeno 4 giocatori registrati per iniziare una partita.</p>
          <Link href="/players" className="inline-block mt-6 px-6 py-3 bg-emerald-500 rounded-xl font-bold text-white">
            Vai in Anagrafica
          </Link>
        </div>
      ) : (
        <form action={startMatch} className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Squadra Rossa */}
            <div className="bg-red-950/30 p-6 rounded-2xl border border-red-900/50">
              <h2 className="text-2xl font-black text-red-500 mb-6 text-center">SQUADRA ROSSA</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-400 mb-2 font-medium">Giocatore 1 (Attacco)</label>
                  <select name="teamA1" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-lg focus:border-red-500 focus:outline-none">
                    <option value="">Seleziona...</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.preferredRole})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-2 font-medium">Giocatore 2 (Difesa)</label>
                  <select name="teamA2" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-lg focus:border-red-500 focus:outline-none">
                    <option value="">Seleziona...</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.preferredRole})</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Squadra Blu */}
            <div className="bg-blue-950/30 p-6 rounded-2xl border border-blue-900/50">
              <h2 className="text-2xl font-black text-blue-500 mb-6 text-center">SQUADRA BLU</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-slate-400 mb-2 font-medium">Giocatore 1 (Attacco)</label>
                  <select name="teamB1" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-lg focus:border-blue-500 focus:outline-none">
                    <option value="">Seleziona...</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.preferredRole})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-2 font-medium">Giocatore 2 (Difesa)</label>
                  <select name="teamB2" required className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-lg focus:border-blue-500 focus:outline-none">
                    <option value="">Seleziona...</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.preferredRole})</option>)}
                  </select>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-12 text-center">
            <button type="submit" className="inline-flex items-center gap-3 bg-slate-100 hover:bg-white text-slate-900 font-black py-5 px-12 rounded-full text-2xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
              <Play className="w-8 h-8" fill="currentColor" />
              AVVIA MATCH
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
