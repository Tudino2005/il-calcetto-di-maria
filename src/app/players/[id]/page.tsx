export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, User, Trophy, Swords, Calendar, Trash2, Users, Shield, Sparkles } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import PlayerHistoryView from "@/components/PlayerHistoryView";
import { deletePlayer } from "@/app/actions/matchActions";
import RoleIcon from "@/components/RoleIcon";
import { getLeaderboardData } from "@/lib/leaderboardData";
import { formatSetScores } from "@/lib/scoreUtils";
import { calculatePlayerRoleStats, getEffectiveMatchRole } from "@/lib/roleUtils";

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

  // Calculate role statistics & indices
  const roleStats = calculatePlayerRoleStats(id, allMatches);

  // Calculate current leaderboard ranking
  const { playerStats, teamStats } = await getLeaderboardData();
  const playerRankMap = new Map<string, number>();
  playerStats.forEach((p: any, idx: number) => {
    playerRankMap.set(p.id, idx + 1);
  });
  const myRank = playerRankMap.get(id) || null;

  const teamRankMap = new Map<string, number>();
  teamStats.forEach((t: any, idx: number) => {
    teamRankMap.set(t.id, idx + 1);
  });

  // Group statistics by teammate / partner
  const partnerMap = new Map<string, { partner: any; played: number; wins: number; teamId: string; goalsConceded: number; goalsScored: number; setsWon: number; setsLost: number }>();

  allMatches.forEach((m: any) => {
    const isTeamA = m.teamA?.player1Id === id || m.teamA?.player2Id === id;
    const myTeam = isTeamA ? m.teamA : m.teamB;
    if (!myTeam) return;

    const partner = myTeam.player1Id === id ? myTeam.player2 : myTeam.player1;
    if (!partner) return;

    const iWon = m.winnerTeamId === myTeam.id;
    
    // Set vinti e persi
    const setsW = isTeamA ? (m.scoreTeamA || 0) : (m.scoreTeamB || 0);
    const setsL = isTeamA ? (m.scoreTeamB || 0) : (m.scoreTeamA || 0);
    
    let goalsAgainst = 0;
    let goalsFor = 0;
    
    if (m.setScores) {
      try {
        const parsedSets = typeof m.setScores === 'string' ? JSON.parse(m.setScores) : m.setScores;
        if (Array.isArray(parsedSets)) {
          parsedSets.forEach((set: any) => {
            if (isTeamA) {
              goalsFor += Number(set.scoreA || 0);
              goalsAgainst += Number(set.scoreB || 0);
            } else {
              goalsFor += Number(set.scoreB || 0);
              goalsAgainst += Number(set.scoreA || 0);
            }
          });
        }
      } catch (e) {
        console.error("Error parsing setScores:", e);
      }
    }

    if (!partnerMap.has(partner.id)) {
      partnerMap.set(partner.id, { partner, played: 0, wins: 0, teamId: myTeam.id, goalsConceded: 0, goalsScored: 0, setsWon: 0, setsLost: 0 });
    }
    const entry = partnerMap.get(partner.id)!;
    entry.played += 1;
    if (iWon) entry.wins += 1;
    entry.setsWon += setsW;
    entry.setsLost += setsL;
    entry.goalsConceded += goalsAgainst;
    entry.goalsScored += goalsFor;
  });

  const partnerStats = Array.from(partnerMap.values())
    .map(p => {
      const partnerRank = playerRankMap.get(p.partner.id) || null;
      const teamRank = teamRankMap.get(p.teamId) || null;
      return {
        ...p,
        partnerRank,
        teamRank,
        winRate: p.played > 0 ? ((p.wins / p.played) * 100).toFixed(1) : "0.0"
      };
    })
    .sort((a, b) => {
      if (b.played !== a.played) return b.played - a.played;
      return Number(b.winRate) - Number(a.winRate);
    });

  // --- ALGORITMO PARTNER IDEALE ---
  // Trova i compagni con almeno 3 partite, ordinati con le nuove regole
  let idealPartner = partnerStats.filter(p => p.played >= 3);
  if (idealPartner.length > 0) {
    idealPartner = idealPartner.sort((a, b) => {
      // Regola 1: Win Rate più alto
      const wrDiff = Number(b.winRate) - Number(a.winRate);
      if (wrDiff !== 0) return wrDiff;
      
      // Regola 2: Più partite giocate
      if (b.played !== a.played) return b.played - a.played;
      
      // Regola 3: Meno gol subiti
      if (a.goalsConceded !== b.goalsConceded) return a.goalsConceded - b.goalsConceded;
      
      // Regola 4: Posizione in classifica generale (rank numerico più basso = migliore)
      const rankA = playerRankMap.get(a.partner.id) || 999;
      const rankB = playerRankMap.get(b.partner.id) || 999;
      return rankA - rankB;
    });
  }
  const suggestedPartner = idealPartner.length > 0 ? idealPartner[0] : null;

  async function handleDelete() {
    "use server";
    await deletePlayer(id);
    redirect("/players");
  }

  return (
    <main className="flex-1 p-4 sm:p-8 xl:p-12 w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/players" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Fascicolo Giocatore</h1>
        </div>
      </header>

      <div className="bg-slate-800 rounded-3xl p-6 lg:p-8 mb-8 border border-slate-700 shadow-xl flex flex-col xl:flex-row gap-8 xl:items-center justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">{player.name}</h2>
            {myRank && (
              <span className="text-3xl lg:text-4xl font-black text-purple-400">{myRank}°</span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="px-4 py-2 bg-slate-900 text-slate-300 rounded-lg text-sm uppercase tracking-wider font-bold border border-slate-700">
              {player.preferredRole}
            </span>
            <form action={handleDelete}>
              <DeleteButton />
            </form>
          </div>
        </div>

        {/* 4 Compact Stat Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          {/* GK Stats */}
          <div className="bg-slate-900/50 border border-blue-500/30 rounded-2xl p-4 w-full shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-sm">🛡️</div>
              <div className="text-[10px] uppercase font-black tracking-wider text-blue-400 leading-tight">In Porta</div>
            </div>
            <div className="text-2xl font-black text-white mb-2 leading-none flex items-baseline gap-1">
              {roleStats.defensiveIndex !== null ? roleStats.defensiveIndex : "-"} 
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Gol Sub.</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-700/50 pt-2.5 mt-1">
              <span className="text-slate-400">{roleStats.gkMatches} G</span>
              <span className="text-yellow-500">{roleStats.gkWinRate ? `${roleStats.gkWinRate}%` : "-"}</span>
            </div>
          </div>

          {/* Striker Stats */}
          <div className="bg-slate-900/50 border border-red-500/30 rounded-2xl p-4 w-full shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center text-sm">⚔️</div>
              <div className="text-[10px] uppercase font-black tracking-wider text-red-400 leading-tight">In Attacco</div>
            </div>
            <div className="text-2xl font-black text-white mb-2 leading-none flex items-baseline gap-1">
              {roleStats.offensiveIndex !== null ? roleStats.offensiveIndex : "-"} 
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Gol Fatti</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-700/50 pt-2.5 mt-1">
              <span className="text-slate-400">{roleStats.stMatches} G</span>
              <span className="text-yellow-500">{roleStats.stWinRate ? `${roleStats.stWinRate}%` : "-"}</span>
            </div>
          </div>

          {/* Ideal Partner */}
          <div className="bg-slate-900/50 border border-purple-500/30 rounded-2xl p-4 w-full shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
              <div className="text-[10px] uppercase font-black tracking-wider text-purple-400 leading-tight">Partner</div>
            </div>
            <div className="text-xl font-black text-white mb-2 leading-none truncate">
              {suggestedPartner ? suggestedPartner.partner.name : "-"}
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold border-t border-slate-700/50 pt-2.5 mt-2">
              <span className="text-slate-400">{suggestedPartner ? `${suggestedPartner.played} G` : "-"}</span>
              <span className="text-emerald-400">{suggestedPartner ? `${suggestedPartner.winRate}% V` : "-"}</span>
            </div>
          </div>

          {/* Total Stats */}
          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-4 w-full shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center"><Trophy className="w-4 h-4" /></div>
              <div className="text-[10px] uppercase font-black tracking-wider text-emerald-400 leading-tight">Totale</div>
            </div>
            <div className="text-3xl font-black text-white mb-1.5 leading-none flex items-baseline gap-1">
              {totalPlayed}
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Partite</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-t border-slate-700/50 pt-2 mt-1">
              <span className="text-emerald-400">{totalWins} Vinte</span>
              <span className="text-yellow-500">{winRate}%</span>
            </div>
          </div>
        </div>
      </div>

            <PlayerHistoryView 
        playerId={id} 
        partnerStats={partnerStats} 
        allMatches={allMatches} 
      />
    </main>
  );
}
