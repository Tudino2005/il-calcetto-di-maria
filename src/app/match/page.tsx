export const dynamic = "force-dynamic";
import { getPlayers, createTeam, createMatch } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import MatchLobbyClient from "@/components/MatchLobbyClient";
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
        <MatchLobbyClient players={players} />
      )}
    </main>
  );
}
