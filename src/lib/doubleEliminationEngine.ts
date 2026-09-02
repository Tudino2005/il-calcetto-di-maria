import { prisma } from "@/lib/prisma";

export async function advanceDoubleElimination(
  tournament: any,
  matchId: string,
  winnerTeamId: string,
  bracketData: { wbRounds: string[][], lbRounds: string[][], gfMatches?: string[] }
) {
  let isWB = false;
  let isLB = false;
  let isGF = false;
  let currentRoundIndex = -1;
  let matchIndex = -1;

  // Find match location
  for (let r = 0; r < bracketData.wbRounds.length; r++) {
    const idx = bracketData.wbRounds[r].indexOf(matchId);
    if (idx !== -1) { isWB = true; currentRoundIndex = r; matchIndex = idx; break; }
  }
  
  if (!isWB) {
    if (!bracketData.lbRounds) bracketData.lbRounds = [];
    for (let r = 0; r < bracketData.lbRounds.length; r++) {
      const idx = bracketData.lbRounds[r].indexOf(matchId);
      if (idx !== -1) { isLB = true; currentRoundIndex = r; matchIndex = idx; break; }
    }
  }

  if (!isWB && !isLB && bracketData.gfMatches) {
    const idx = bracketData.gfMatches.indexOf(matchId);
    if (idx !== -1) { isGF = true; currentRoundIndex = 0; matchIndex = idx; }
  }

  const match = tournament.matches.find((m: any) => m.id === matchId);
  const loserTeamId = match.teamAId === winnerTeamId ? match.teamBId : match.teamAId;
  const N = bracketData.wbRounds[0].length * 2; // initial teams count

  async function ensureMatchExists(roundType: 'wbRounds' | 'lbRounds' | 'gfMatches', roundIdx: number, matchIdx: number, bracketType: string) {
    if (roundType === 'gfMatches') {
      if (!bracketData.gfMatches) bracketData.gfMatches = [];
      if (!bracketData.gfMatches[matchIdx]) {
        const m = await prisma.match.create({ data: { tournamentId: tournament.id, bracketType } });
        bracketData.gfMatches[matchIdx] = m.id;
      }
      return bracketData.gfMatches[matchIdx];
    }

    if (!bracketData[roundType][roundIdx]) bracketData[roundType][roundIdx] = [];
    if (!bracketData[roundType][roundIdx][matchIdx]) {
      const m = await prisma.match.create({ data: { tournamentId: tournament.id, bracketType } });
      bracketData[roundType][roundIdx][matchIdx] = m.id;
    }
    return bracketData[roundType][roundIdx][matchIdx];
  }

  async function setMatchTeam(targetMatchId: string, teamSlot: 'teamAId' | 'teamBId', teamId: string) {
    await prisma.match.update({ where: { id: targetMatchId }, data: { [teamSlot]: teamId } });
  }

  if (isWB) {
    const expectedMatches = bracketData.wbRounds[0].length / Math.pow(2, currentRoundIndex);
    const isWbFinal = expectedMatches === 1;

    // 1. Advance Winner in WB (or to GF)
    if (isWbFinal) {
      // Winner goes to Grand Final (Slot A)
      const gfMatchId = await ensureMatchExists('gfMatches', 0, 0, 'grand_final');
      await setMatchTeam(gfMatchId, 'teamAId', winnerTeamId);
    } else {
      // Advance to next WB round
      const nextRoundIndex = currentRoundIndex + 1;
      const nextMatchIndex = Math.floor(matchIndex / 2);
      const slot = matchIndex % 2 === 0 ? 'teamAId' : 'teamBId';
      const targetMatchId = await ensureMatchExists('wbRounds', nextRoundIndex, nextMatchIndex, 'winners');
      await setMatchTeam(targetMatchId, slot, winnerTeamId);
    }

    // 2. Drop Loser to LB
    const targetLbRound = currentRoundIndex === 0 ? 0 : (currentRoundIndex * 2) - 1;
    const matchesInTargetLbRound = N / Math.pow(2, Math.floor(targetLbRound / 2) + 2);
    
    let targetLbMatchIndex = -1;
    let slot: 'teamAId' | 'teamBId' = 'teamAId';

    if (currentRoundIndex === 0) {
      targetLbMatchIndex = Math.floor(matchIndex / 2);
      slot = matchIndex % 2 === 0 ? 'teamAId' : 'teamBId';
    } else {
      // Cross routing: invert index
      targetLbMatchIndex = (matchesInTargetLbRound - 1) - matchIndex;
      slot = 'teamBId'; // Winner from previous LB round takes teamAId
    }

    const dropMatchId = await ensureMatchExists('lbRounds', targetLbRound, targetLbMatchIndex, 'losers');
    await setMatchTeam(dropMatchId, slot, loserTeamId);
  }

  if (isLB) {
    const totalLbRounds = (2 * Math.log2(N)) - 2;
    const isLbFinal = currentRoundIndex === totalLbRounds - 1;

    if (isLbFinal) {
      // Winner goes to Grand Final (Slot B)
      const gfMatchId = await ensureMatchExists('gfMatches', 0, 0, 'grand_final');
      await setMatchTeam(gfMatchId, 'teamBId', winnerTeamId);
    } else {
      // Advance in LB
      const nextRoundIndex = currentRoundIndex + 1;
      
      let nextMatchIndex = -1;
      let slot: 'teamAId' | 'teamBId' = 'teamAId';

      // If current round is EVEN, next round is ODD and maintains same number of matches. 
      // The winners just slide horizontally into Team A of next round.
      if (currentRoundIndex % 2 === 0) {
        nextMatchIndex = matchIndex;
        slot = 'teamAId';
      } else {
        // If current round is ODD, next round is EVEN and has HALF the matches.
        nextMatchIndex = Math.floor(matchIndex / 2);
        slot = matchIndex % 2 === 0 ? 'teamAId' : 'teamBId';
      }

      const targetMatchId = await ensureMatchExists('lbRounds', nextRoundIndex, nextMatchIndex, 'losers');
      await setMatchTeam(targetMatchId, slot, winnerTeamId);
    }
  }

  if (isGF) {
    if (matchIndex === 0) {
      // First GF match
      // If WB winner (teamA) wins -> Tournament over.
      if (winnerTeamId === match.teamAId) {
        await prisma.tournament.update({
          where: { id: tournament.id },
          data: { status: "completed", winnerTeamId: winnerTeamId }
        });
      } else {
        // Bracket reset! Create GF Match 2
        const resetMatchId = await ensureMatchExists('gfMatches', 0, 1, 'grand_final_reset');
        await setMatchTeam(resetMatchId, 'teamAId', match.teamAId!);
        await setMatchTeam(resetMatchId, 'teamBId', match.teamBId!);
      }
    } else {
      // Second GF match (Reset). Tournament over unconditionally.
      await prisma.tournament.update({
        where: { id: tournament.id },
        data: { status: "completed", winnerTeamId: winnerTeamId }
      });
    }
  }

  // Save the modified bracket data
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { bracketData: JSON.stringify(bracketData) }
  });
}
