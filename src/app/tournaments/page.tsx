import TournamentForm from "@/components/TournamentForm";
import { getTournaments, createTournament } from "@/app/actions/tournamentActions";
import { getPlayers, getTeams } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  const players = await getPlayers();
  const teams = await getTeams();

  async function startTournament(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const type = formData.get("type") as "sorteggio_ruoli" | "sorteggio_integrale" | "coppie_fisse";
    
    let selectionIds: string[] = [];

    if (type === "coppie_fisse") {
      // Collect manual teams pairwise in the format "p1_id,p2_id"
      for (let i = 0; i < 32; i++) {
        const p1 = formData.get(`manual_team_${i}_p1`) as string;
        const p2 = formData.get(`manual_team_${i}_p2`) as string;
        if (p1 && p2) {
          selectionIds.push(`${p1},${p2}`);
        }
      }
      
      const count = selectionIds.length;
      if (![4, 8, 16, 32].includes(count)) return;
    } else {
      selectionIds = formData.getAll("players") as string[];
      const count = selectionIds.length;
      if (![8, 16, 32, 64].includes(count)) return;
    }

    if (!name || selectionIds.length === 0) return;

    const format = formData.get("format") as string;
    const teamsPerGroup = parseInt(formData.get("teamsPerGroup") as string) || 4;

    const t = await createTournament(name, selectionIds, type, format, { teamsPerGroup });
    
    if (type !== "coppie_fisse") {
      redirect(`/tournaments/${t.id}?draw=true`);
    } else {
      redirect(`/tournaments/${t.id}`);
    }
  }

  return (
    <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Tornei</h1>
        </div>
      </header>

      <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-8">
        <section className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg">
          <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" /> Nuovo Torneo
          </h2>
          <TournamentForm players={players} teams={teams} action={startTournament} />
        </section>

        <section className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg h-fit">
          <h2 className="text-2xl font-bold text-white mb-6">Tornei Recenti</h2>
          <div className="flex flex-col gap-4">
            {tournaments.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nessun torneo creato.</p>
            ) : (
              tournaments.map((t) => (
                <Link key={t.id} href={`/tournaments/${t.id}`}>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 hover:border-purple-500 transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-xl text-white group-hover:text-purple-400 transition-colors">{t.name}</h3>
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs uppercase tracking-wider font-medium border border-slate-700">
                        {t.status === "completed" ? "Completato" : "In Corso"}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-4">
                      <div className="text-xs font-medium text-slate-400">
                        <span className="text-slate-500 uppercase tracking-wider">Formato:</span> 
                        <span className="ml-2 text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">{(t.format || "eliminazione_diretta").replace(/_/g, " ")}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-400">
                        <span className="text-slate-500 uppercase tracking-wider">Composizione:</span> 
                        <span className="ml-2 text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded">{(t.type || "sconosciuta").replace(/_/g, " ")}</span>
                      </div>
                    </div>

                    {t.winnerTeam && (
                      <p className="text-yellow-500 font-medium text-sm flex items-center gap-2">
                        🏆 Vincitori: {t.winnerTeam.player1.name} & {t.winnerTeam.player2.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
