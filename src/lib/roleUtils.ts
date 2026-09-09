export type Role = "portiere" | "attaccante" | "entrambi";

export type PlayerRoleInfo = {
  id: string;
  name: string;
  preferredRole?: string;
};

export type ResolvedTeamRoles = {
  goalkeeperId: string;
  strikerId: string;
  isAdapted: boolean;
  adaptedPlayerName?: string;
  adaptationNote?: string;
};

/**
 * Risolve i ruoli di una squadra (Portiere e Attaccante).
 * Supporta la pre-assegnazione intelligente in base a preferredRole,
 * la gestione automatica dei casi limite (2 portieri o 2 attaccanti con segnalazione 'adattato')
 * e rispetta gli override manuali (tasto ⇄ Scambia).
 */
export function resolveTeamRoles(
  player1: PlayerRoleInfo,
  player2: PlayerRoleInfo,
  currentOverride?: { goalkeeperId?: string; strikerId?: string } | null
): ResolvedTeamRoles {
  const p1Role = (player1.preferredRole || "entrambi").toLowerCase();
  const p2Role = (player2.preferredRole || "entrambi").toLowerCase();

  // Controlla se entrambi hanno dichiarato lo stesso ruolo specifico
  const bothGoalkeepers = p1Role === "portiere" && p2Role === "portiere";
  const bothStrikers = p1Role === "attaccante" && p2Role === "attaccante";
  const isAdapted = bothGoalkeepers || bothStrikers;

  // Se c'è un override manuale valido che include entrambi i giocatori
  if (
    currentOverride &&
    ((currentOverride.goalkeeperId === player1.id && currentOverride.strikerId === player2.id) ||
      (currentOverride.goalkeeperId === player2.id && currentOverride.strikerId === player1.id))
  ) {
    const gkId = currentOverride.goalkeeperId;
    const stId = currentOverride.strikerId;
    const gkPlayer = gkId === player1.id ? player1 : player2;
    const stPlayer = stId === player1.id ? player1 : player2;

    let adaptedPlayerName: string | undefined;
    let adaptationNote: string | undefined;

    if (bothGoalkeepers) {
      adaptedPlayerName = stPlayer.name;
      adaptationNote = `Coppia di Portieri: ${stPlayer.name} gioca in Attacco (adattato)`;
    } else if (bothStrikers) {
      adaptedPlayerName = gkPlayer.name;
      adaptationNote = `Coppia di Attaccanti: ${gkPlayer.name} gioca in Porta (adattato)`;
    }

    return {
      goalkeeperId: gkId,
      strikerId: stId,
      isAdapted,
      adaptedPlayerName,
      adaptationNote,
    };
  }

  // Pre-assegnazione automatica intelligente
  let gkId = player1.id;
  let stId = player2.id;
  let adaptedPlayerName: string | undefined;
  let adaptationNote: string | undefined;

  if (bothGoalkeepers) {
    // Entrambi portieri: p1 resta in porta, p2 si sacrifica avanti
    gkId = player1.id;
    stId = player2.id;
    adaptedPlayerName = player2.name;
    adaptationNote = `Coppia di Portieri: ${player2.name} gioca in Attacco (adattato)`;
  } else if (bothStrikers) {
    // Entrambi attaccanti: p1 si sacrifica dietro, p2 resta avanti
    gkId = player1.id;
    stId = player2.id;
    adaptedPlayerName = player1.name;
    adaptationNote = `Coppia di Attaccanti: ${player1.name} gioca in Porta (adattato)`;
  } else if (p1Role === "portiere" || p2Role === "attaccante") {
    gkId = player1.id;
    stId = player2.id;
  } else if (p2Role === "portiere" || p1Role === "attaccante") {
    gkId = player2.id;
    stId = player1.id;
  } else {
    // Entrambi "entrambi" o non specificato: p1 in porta, p2 in attacco
    gkId = player1.id;
    stId = player2.id;
  }

  return {
    goalkeeperId: gkId,
    strikerId: stId,
    isAdapted,
    adaptedPlayerName,
    adaptationNote,
  };
}

/**
 * Determina il ruolo effettivo giocato da un giocatore in uno specifico match.
 */
export function getEffectiveMatchRole(
  match: any,
  playerId: string
): "portiere" | "attaccante" | null {
  const isTeamA = match.teamA?.player1Id === playerId || match.teamA?.player2Id === playerId;
  const isTeamB = match.teamB?.player1Id === playerId || match.teamB?.player2Id === playerId;

  if (isTeamA) {
    if (match.teamA_goalkeeperId === playerId) return "portiere";
    if (match.teamA_strikerId === playerId) return "attaccante";
    if (match.teamA?.player1 && match.teamA?.player2) {
      const resolved = resolveTeamRoles(match.teamA.player1, match.teamA.player2);
      return resolved.goalkeeperId === playerId ? "portiere" : "attaccante";
    }
  }

  if (isTeamB) {
    if (match.teamB_goalkeeperId === playerId) return "portiere";
    if (match.teamB_strikerId === playerId) return "attaccante";
    if (match.teamB?.player1 && match.teamB?.player2) {
      const resolved = resolveTeamRoles(match.teamB.player1, match.teamB.player2);
      return resolved.goalkeeperId === playerId ? "portiere" : "attaccante";
    }
  }

  return null;
}

export type PlayerRoleStats = {
  gkMatches: number;
  gkWins: number;
  gkGoalsConceded: number;
  defensiveIndex: string | null; // media gol subiti a partita (più basso è, meglio è)
  gkWinRate: string | null;

  stMatches: number;
  stWins: number;
  stGoalsScored: number;
  offensiveIndex: string | null; // media gol fatti a partita (più alto è, meglio è)
  stWinRate: string | null;

  verdettoAlchimia: {
    titolo: string;
    descrizione: string;
    consiglio: string;
    tag: "difesa" | "attacco" | "jolly" | "neutro";
  };
};

/**
 * Calcola l'Indice Difensivo, l'Indice Offensivo e il Verdetto Alchimia per un giocatore
 * analizzando tutte le sue partite completate.
 */
export function calculatePlayerRoleStats(
  playerId: string,
  matches: any[]
): PlayerRoleStats {
  let gkMatches = 0;
  let gkWins = 0;
  let gkGoalsConceded = 0;

  let stMatches = 0;
  let stWins = 0;
  let stGoalsScored = 0;

  for (const m of matches) {
    const isTeamA = m.teamA?.player1Id === playerId || m.teamA?.player2Id === playerId;
    const isTeamB = m.teamB?.player1Id === playerId || m.teamB?.player2Id === playerId;
    if (!isTeamA && !isTeamB) continue;

    const myTeamId = isTeamA ? m.teamAId : m.teamBId;
    const won = m.winnerTeamId === myTeamId;

    // Calcolo gol fatti e subiti dalla squadra del giocatore nel match
    let teamGoals = 0;
    let opponentGoals = 0;

    if (m.setScores && Array.isArray(m.setScores) && m.setScores.length > 0) {
      for (const set of m.setScores) {
        const scoreA = Number(set.scoreA) || 0;
        const scoreB = Number(set.scoreB) || 0;
        if (isTeamA) {
          teamGoals += scoreA;
          opponentGoals += scoreB;
        } else {
          teamGoals += scoreB;
          opponentGoals += scoreA;
        }
      }
    } else {
      // Fallback sui set o punteggi totali
      const scoreA = Number(m.scoreTeamA) || 0;
      const scoreB = Number(m.scoreTeamB) || 0;
      if (isTeamA) {
        teamGoals += scoreA;
        opponentGoals += scoreB;
      } else {
        teamGoals += scoreB;
        opponentGoals += scoreA;
      }
    }

    const role = getEffectiveMatchRole(m, playerId);

    if (role === "portiere") {
      gkMatches++;
      gkGoalsConceded += opponentGoals;
      if (won) gkWins++;
    } else if (role === "attaccante") {
      stMatches++;
      stGoalsScored += teamGoals;
      if (won) stWins++;
    }
  }

  const defensiveIndex =
    gkMatches > 0 ? (gkGoalsConceded / gkMatches).toFixed(2) : null;
  const gkWinRate =
    gkMatches > 0 ? ((gkWins / gkMatches) * 100).toFixed(1) : null;

  const offensiveIndex =
    stMatches > 0 ? (stGoalsScored / stMatches).toFixed(2) : null;
  const stWinRate =
    stMatches > 0 ? ((stWins / stMatches) * 100).toFixed(1) : null;

  // Costruzione verdetto Alchimia dinamico
  let verdetto: PlayerRoleStats["verdettoAlchimia"];

  if (gkMatches > 0 && stMatches > 0) {
    const gkWRNum = Number(gkWinRate);
    const stWRNum = Number(stWinRate);

    if (gkWRNum >= stWRNum + 10) {
      verdetto = {
        titolo: "Pilastro Difensivo 🛡️",
        descrizione: `Quando giochi in Porta hai il ${gkWinRate}% di vittorie (media ${defensiveIndex} gol subiti), contro il ${stWinRate}% in Attacco.`,
        consiglio: "Il tuo rendimento migliore è nettamente tra i pali: schierati in difesa per massimizzare la vittoria!",
        tag: "difesa",
      };
    } else if (stWRNum >= gkWRNum + 10) {
      verdetto = {
        titolo: "Bocca da Fuoco ⚔️",
        descrizione: `Quando giochi in Attacco hai il ${stWinRate}% di vittorie (media ${offensiveIndex} gol fatti), contro il ${gkWinRate}% in Porta.`,
        consiglio: "Sei un finalizzatore naturale: la tua squadra ha bisogno della tua incisività in avanti!",
        tag: "attacco",
      };
    } else {
      verdetto = {
        titolo: "Jolly Completo 🎭",
        descrizione: `Grande equilibrio tra i ruoli: ${gkWinRate}% Win Rate in Porta (media ${defensiveIndex} subiti) e ${stWinRate}% in Attacco (media ${offensiveIndex} fatti).`,
        consiglio: "Altissima versatilità tattica: puoi alternarti con qualsiasi compagno senza cali di rendimento!",
        tag: "jolly",
      };
    }
  } else if (gkMatches > 0) {
    verdetto = {
      titolo: "Specialista della Porta 🛡️",
      descrizione: `Hai disputato ${gkMatches} partite da Portiere con media ${defensiveIndex} gol subiti e ${gkWinRate}% Win Rate.`,
      consiglio: "Un vero guardiano dei pali. Mettiti alla prova anche in attacco per scoprire la tua flessibilità!",
      tag: "difesa",
    };
  } else if (stMatches > 0) {
    verdetto = {
      titolo: "Punta di Diamante ⚔️",
      descrizione: `Hai disputato ${stMatches} partite da Attaccante con media ${offensiveIndex} gol fatti e ${stWinRate}% Win Rate.`,
      consiglio: "Attaccante instancabile! Prova qualche match in difesa per testare la tua tenuta tra i pali.",
      tag: "attacco",
    };
  } else {
    verdetto = {
      titolo: "In Attesa di Dati ⏳",
      descrizione: "Gioca le tue prime partite per generare l'analisi dettagliata di rendimento per ruolo.",
      consiglio: "Completa almeno una partita da portiere o attaccante per sbloccare gli indici.",
      tag: "neutro",
    };
  }

  return {
    gkMatches,
    gkWins,
    gkGoalsConceded,
    defensiveIndex,
    gkWinRate,
    stMatches,
    stWins,
    stGoalsScored,
    offensiveIndex,
    stWinRate,
    verdettoAlchimia: verdetto,
  };
}
