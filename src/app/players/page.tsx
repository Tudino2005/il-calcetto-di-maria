export const dynamic = "force-dynamic";
import { getPlayers, createPlayer } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function PlayersPage() {
  const players = await getPlayers();

  async function addPlayer(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const preferredRole = formData.get("preferredRole") as string;
    if (name && preferredRole) {
      await createPlayer(name, preferredRole);
      revalidatePath("/players");
    }
  }

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
        <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6" /> Aggiungi Giocatore
          </h2>
          <form action={addPlayer} className="flex flex-col gap-4">
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Nome (Nickname)</label>
              <input 
                name="name" 
                type="text" 
                required 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-lg focus:border-emerald-500 focus:outline-none"
                placeholder="Es. Mario Rossi"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Ruolo Preferito</label>
              <select 
                name="preferredRole" 
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-lg focus:border-emerald-500 focus:outline-none"
              >
                <option value="attaccante">Attaccante</option>
                <option value="portiere">Portiere</option>
                <option value="entrambi">Entrambi (Flessibile)</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              Salva Giocatore
            </button>
          </form>
        </section>

        <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-6">Giocatori Registrati ({players.length})</h2>
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {players.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nessun giocatore registrato.</p>
            ) : (
              players.map((p) => (
                <Link href={`/players/${p.id}`} key={p.id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700 hover:border-emerald-500 transition-colors">
                  <span className="font-bold text-lg text-white">{p.name}</span>
                  <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-medium">
                    {p.preferredRole}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
