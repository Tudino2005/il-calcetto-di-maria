export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Trophy, Swords, Calendar, Trash2, Users } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import { deletePlayer } from "@/app/actions/matchActions";
import RoleIcon from "@/components/RoleIcon";

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const player = await prisma.player.findUnique({
    where: { id },
    include: {
      teamsAsPlayer1: {
        include: {
          matchesAsTeamA: { where: { winnerTeamId: { not: null } }, include: { teamA: { include: { player1: true, player2: true } }, teamB: { include: { player1: true, player2: true } }, tournament: true } },
          matchesAsTeamB: { where: { winnerTeamId: { not: null } }, include: { teamA: { include: { player1: true, player2: true } }, teamB: { include: { player1: true, player2: true } }, tournament: true } }
        }
      },
      teamsAsPlayer2: {
        include: {
          matchesAsTeamA: { where: { winnerTeamId: { not: null } }, include: { teamA: { include: { player1: true, player2: true } }, teamB: { include: { player1: true, player2: true } }, tournament: true } },
          matchesAsTeamB: { where: { winnerTeamId: { not: null } }, include: { teamA: { include: { player1: true, player2: true } }, teamB: { include: { player1: true, player2: true } }, tournament: true } }
        }
      }
    }
  });

  if (!player) {
    notFound();
  }

  // Extract all completed matches
  let allMatches: any[] = [];
  const addMatches = (teams: any[]) => {
    teams.forEach(t => {
      allMatches = [...allMatches, ...t.matchesAsTeamA, ...t.matchesAsTeamB];
    });
  };
  addMatches(player.teamsAsPlayer1);
  addMatches(player.teamsAsPlayer2);

  // Sort by most recent
  allMatches.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

  // Calculate stats
  const totalPlayed = allMatches.length;
  const totalWins = allMatches.filter(m => 
    (m.teamA?.player1Id === id || m.teamA?.player2Id === id) && m.winnerTeamId === m.teamAId ||
    (m.teamB?.player1Id === id || m.teamB?.player2Id === id) && m.winnerTeamId === m.teamBId
  ).length;
  const winRate = totalPlayed > 0 ? ((totalWins / totalPlayed) * 100).toFixed(1) : "0.0";

  // Group statistics by teammate / partner
  const partnerMap = new Map<string, { partner: any; played: number; wins: number }>();

  allMatches.forEach((m: any) => {
    const isTeamA = m.teamA?.player1Id === id || m.teamA?.player2Id === id;
    const myTeam = isTeamA ? m.teamA : m.teamB;
    if (!myTeam) return;

    const partner = myTeam.player1Id === id ? myTeam.player2 : myTeam.player1;
    if (!partner) return;

    const iWon = m.winnerTeamId === myTeam.id;

    if (!partnerMap.has(partner.id)) {
      partnerMap.set(partner.id, { partner, played: 0, wins: 0 });
    }
    const entry = partnerMap.get(partner.id)!;
    entry.played += 1;
    if (iWon) entry.wins += 1;
  });

  const partnerStats = Array.from(partnerMap.values())
    .map(p => ({
      ...p,
      winRate: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0"
    }))
    .sort((a, b) => {
      if (b.played !== a.played) return b.played - a.played;
      return Number(b.winRate) - Number(a.winRate);
    });

  async function handleDelete() {
    "use server";
    await deletePlayer(id);
    redirect("/players");
  }

  return (
    <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/players" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Fascicolo Giocatore</h1>
        </div>
      </header>

      <div className="bg-slate-800 rounded-3xl p-8 mb-8 border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white mb-2">{player.name}</h2>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-slate-900 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-bold border border-slate-700">
                  {player.preferredRole}
                </span>
                <form action={handleDelete}>
                  <DeleteButton />
                </form>
              </div>
            </div>
          </div>
          <div className="flex gap-8 text-right">
            <div>
              <div className="text-slate-400 font-bold mb-1">Partite Giocate</div>
              <div className="text-3xl font-black text-white">{totalPlayed}</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold mb-1">Vittorie</div>
              <div className="text-3xl font-black text-emerald-400">{totalWins}</div>
            </div>
            <div>
              <div className="text-yellow-500 font-bold mb-1">Win Rate</div>
              <div className="text-3xl font-black text-yellow-500">{winRate}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIEPILOGO PER COMPAGNO */}
      <section className="mb-8">
        <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-6 flex items-center gap-3">
          <Users className="w-7 h-7 text-purple-400" /> RIEPILOGO PER COMPAGNO
        </h3>

        {partnerStats.length === 0 ? (
          <div className="bg-slate-800 p-6 rounded-2xl text-center text-slate-400 border border-slate-700">
            Nessuna coppia registrata finora.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partnerStats.map(({ partner, played, wins, winRate }) => {
              const winRateNum = Number(winRate);
              const isHigh = winRateNum >= 60;
              const isMid = winRateNum >= 40 && winRateNum < 60;

              return (
                <div key={partner.id} className="bg-slate-800/90 border border-slate-700 hover:border-purple-500/50 transition-all p-5 rounded-2xl shadow-lg flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-slate-700/80 rounded-full flex items-center justify-center shrink-0">
                      <RoleIcon role={partner.preferredRole || "entrambi"} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/players/${partner.id}`} className="text-lg font-black text-white hover:text-purple-400 transition-colors truncate block">
                        {partner.name}
                      </Link>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {partner.preferredRole || "Giocatore"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Giocate</div>
                      <div className="text-lg font-black text-white">{played}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Vinte</div>
                      <div className="text-lg font-black text-emerald-400">{wins}</div>
                    </div>
                    <div className="min-w-[70px]">
                      <div className="text-[11px] text-yellow-500 font-bold uppercase tracking-wider">Win Rate</div>
                      <div className={`text-lg font-black ${
                        isHigh ? 'text-emerald-400' : isMid ? 'text-yellow-400' : 'text-slate-300'
                      }`}>
                        {winRate}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-blue-400" /> Storico Partite Giocate
      </h3>

      <div className="flex flex-col gap-4">
        {allMatches.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-3xl text-center text-slate-400">
            Nessuna partita giocata finora.
          </div>
        ) : (
          allMatches.map((m: any) => {
            const isTeamA = m.teamA?.player1Id === player.id || m.teamA?.player2Id === player.id;
            const myTeam = isTeamA ? m.teamA : m.teamB;
            const enemyTeam = isTeamA ? m.teamB : m.teamA;
            const myScore = isTeamA ? m.scoreTeamA : m.scoreTeamB;
            const enemyScore = isTeamA ? m.scoreTeamB : m.scoreTeamA;
            const iWon = m.winnerTeamId === myTeam?.id;

            return (
              <div key={m.id} className={`p-6 rounded-2xl flex items-center justify-between border-2 bg-slate-900 ${
                iWon ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-400 font-bold mb-2 flex-wrap">
                    <span>
                      {new Date(m.playedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-600">•</span>
                    {m.tournament ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Trophy className="w-3.5 h-3.5 text-purple-400" />
                        {m.tournament.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Swords className="w-3.5 h-3.5 text-emerald-400" />
                        Partita Libera
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xl font-bold">
                    <span className="text-white">Con: {myTeam?.player1Id === player.id ? myTeam?.player2?.name : myTeam?.player1?.name}</span>
                    <span className="text-slate-500 text-sm mx-2">VS</span>
                    <span className="text-slate-400">{enemyTeam?.player1?.name} & {enemyTeam?.player2?.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="bg-slate-900 px-6 py-2 rounded-xl text-3xl font-black shadow-inner">
                    <span className={iWon ? "text-emerald-400" : "text-white"}>{myScore}</span>
                    <span className="text-slate-600 mx-2">-</span>
                    <span className={!iWon ? "text-emerald-400" : "text-slate-400"}>{enemyScore}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    iWon ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {iWon ? <Trophy className="w-6 h-6" /> : <span className="font-black">L</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
