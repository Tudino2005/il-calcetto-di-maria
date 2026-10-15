"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { updateMatchScore, updateExactMatchScore, updateMatchRoles } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, RotateCcw, Settings, Check, ChevronRight, Play, ArrowLeftRight, X, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { resolveTeamRoles } from "@/lib/roleUtils";
import { formatSetScores } from "@/lib/scoreUtils";

type PlayerInfo = { id: string; name: string; preferredRole?: string };
type TeamInfo = { id: string; player1: PlayerInfo; player2: PlayerInfo };
type MatchInfo = {
  id: string;
  scoreTeamA: number; // Sets won by Team A
  scoreTeamB: number; // Sets won by Team B
  winnerTeamId: string | null;
  tournamentId: string | null;
  bracketType?: string | null;
  teamA: TeamInfo | null;
  teamB: TeamInfo | null;
  tournament?: any;
  setScores?: any;
  teamA_goalkeeperId?: string | null;
  teamA_strikerId?: string | null;
  teamB_goalkeeperId?: string | null;
  teamB_strikerId?: string | null;
};

type ScorerMode = "goals" | "sets";
type MatchFormat = "single" | "bo3";

type CompletedSet = {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  inAdvantages: boolean;
  winner: "A" | "B";
  scorers?: Record<string, number>; // playerId -> gol attribuiti nel set
};

const buildSetPayload = (sets: CompletedSet[]) => sets.map(s => ({
  setNumber: s.setNumber,
  scoreA: s.scoreA,
  scoreB: s.scoreB,
  ...(s.scorers && Object.keys(s.scorers).length > 0 ? { scorers: s.scorers } : {})
}));

const countScorers = (goals: ("A" | "B")[], scorers: (string | null)[]) => {
  const out: Record<string, number> = {};
  goals.forEach((_, i) => {
    const id = scorers[i];
    if (id) out[id] = (out[id] || 0) + 1;
  });
  return out;
};

export default function MatchScorer({ match }: { match: MatchInfo }) {
  const [isPending, startTransition] = useTransition();

  // Role specialization state
  const [teamARoles, setTeamARoles] = useState(() => {
    if (match.teamA?.player1 && match.teamA?.player2) {
      const override = match.teamA_goalkeeperId && match.teamA_strikerId
        ? { goalkeeperId: match.teamA_goalkeeperId, strikerId: match.teamA_strikerId }
        : null;
      return resolveTeamRoles(match.teamA.player1, match.teamA.player2, override);
    }
    return null;
  });

  const [teamBRoles, setTeamBRoles] = useState(() => {
    if (match.teamB?.player1 && match.teamB?.player2) {
      const override = match.teamB_goalkeeperId && match.teamB_strikerId
        ? { goalkeeperId: match.teamB_goalkeeperId, strikerId: match.teamB_strikerId }
        : null;
      return resolveTeamRoles(match.teamB.player1, match.teamB.player2, override);
    }
    return null;
  });

  const handleSwapTeamA = () => {
    if (!teamARoles || !match.teamA) return;
    const newGK = teamARoles.strikerId;
    const newST = teamARoles.goalkeeperId;
    const newRoles = resolveTeamRoles(match.teamA.player1, match.teamA.player2, {
      goalkeeperId: newGK,
      strikerId: newST,
    });
    setTeamARoles(newRoles);
    startTransition(async () => {
      await updateMatchRoles(match.id, {
        teamA_goalkeeperId: newGK,
        teamA_strikerId: newST,
        teamB_goalkeeperId: teamBRoles?.goalkeeperId,
        teamB_strikerId: teamBRoles?.strikerId,
      });
    });
  };

  const handleSwapTeamB = () => {
    if (!teamBRoles || !match.teamB) return;
    const newGK = teamBRoles.strikerId;
    const newST = teamBRoles.goalkeeperId;
    const newRoles = resolveTeamRoles(match.teamB.player1, match.teamB.player2, {
      goalkeeperId: newGK,
      strikerId: newST,
    });
    setTeamBRoles(newRoles);
    startTransition(async () => {
      await updateMatchRoles(match.id, {
        teamA_goalkeeperId: teamARoles?.goalkeeperId,
        teamA_strikerId: teamARoles?.strikerId,
        teamB_goalkeeperId: newGK,
        teamB_strikerId: newST,
      });
    });
  };

  // Best of 3 / Single Match session storage key
  const sessionStorageKey = `foosball_match_session_${match.id}`;

  // Settings with LocalStorage persistence
  const [mode, setMode] = useState<ScorerMode>("goals");
  const [targetGoals, setTargetGoals] = useState<number>(7);
  const [advantageThreshold, setAdvantageThreshold] = useState<number>(5);
  const [matchFormat, setMatchFormat] = useState<MatchFormat>(() => {
    if (match.tournamentId) return "bo3";
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(sessionStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.matchFormat === "single" || parsed.matchFormat === "bo3") {
            return parsed.matchFormat;
          }
        }
        const generalSaved = localStorage.getItem("foosball_scorer_settings");
        if (generalSaved) {
          const parsed = JSON.parse(generalSaved);
          if (parsed.matchFormat === "single" || parsed.matchFormat === "bo3") {
            return parsed.matchFormat;
          }
        }
      } catch {}
    }
    return match.bracketType === "single" ? "single" : "bo3";
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load saved general settings
  useEffect(() => {
    if (match.tournament) {
      setMode((match.tournament.scoringMode as ScorerMode) || "goals");
      setTargetGoals(match.tournament.targetGoals || 7);
      setAdvantageThreshold(match.tournament.advantageThreshold ?? 5);
      return;
    }
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.targetGoals) setTargetGoals(parsed.targetGoals);
        if (parsed.advantageThreshold) setAdvantageThreshold(parsed.advantageThreshold);
        if (parsed.matchFormat && !match.bracketType) setMatchFormat(parsed.matchFormat);
      }
    } catch {}
  }, [match.tournament, match.bracketType]);

  const updateSettings = (
    newMode: ScorerMode,
    newTarget: number,
    newThreshold: number,
    newFormat: MatchFormat = matchFormat
  ) => {
    setMode(newMode);
    setTargetGoals(newTarget);
    setAdvantageThreshold(newThreshold);
    setMatchFormat(newFormat);
    try {
      localStorage.setItem(
        "foosball_scorer_settings",
        JSON.stringify({
          mode: newMode,
          targetGoals: newTarget,
          advantageThreshold: newThreshold,
          matchFormat: newFormat,
        })
      );
      const existing = localStorage.getItem(sessionStorageKey);
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        sessionStorageKey,
        JSON.stringify({
          ...parsed,
          matchFormat: newFormat,
        })
      );
    } catch {}
  };

  const [completedSets, setCompletedSets] = useState<CompletedSet[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(sessionStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.completedSets)) return parsed.completedSets;
        }
      } catch {}
    }
    return [];
  });

  // Current set goals history
  const [currentSetGoals, setCurrentSetGoals] = useState<("A" | "B")[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(sessionStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.currentSetGoals)) return parsed.currentSetGoals;
        }
      } catch {}
    }
    return [];
  });

  // Marcatore di ogni gol del set corrente (parallelo a currentSetGoals; null = non attribuito)
  const [currentSetScorers, setCurrentSetScorers] = useState<(string | null)[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(sessionStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          const goals = Array.isArray(parsed.currentSetGoals) ? parsed.currentSetGoals : [];
          const sc = Array.isArray(parsed.currentSetScorers) ? parsed.currentSetScorers : [];
          return goals.map((_: any, i: number) => sc[i] ?? null);
        }
      } catch {}
    }
    return [];
  });

  // Inter-set modal state (shown after set is explicitly confirmed if match continues)
  const [setFinishedModal, setSetFinishedModal] = useState<CompletedSet | null>(null);

  // Sync session to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        sessionStorageKey,
        JSON.stringify({
          completedSets,
          currentSetGoals,
          currentSetScorers,
          matchFormat,
        })
      );
    } catch {}
  }, [completedSets, currentSetGoals, currentSetScorers, matchFormat, sessionStorageKey]);

  // Gol attribuiti per giocatore nel set corrente
  const currentScorerCounts = useMemo(
    () => countScorers(currentSetGoals, currentSetScorers),
    [currentSetGoals, currentSetScorers]
  );

  // Derived sets won count
  const setsWonA = completedSets.filter(s => s.winner === "A").length;
  const setsWonB = completedSets.filter(s => s.winner === "B").length;

  const targetSetsToWin = matchFormat === "single" ? 1 : 2;
  const currentSetNumber = completedSets.length + 1;

  // Compute live state of the CURRENT set
  const currentSetState = useMemo(() => {
    let scoreA = 0;
    let scoreB = 0;
    let inAdvantages = false;
    let advA = 0; // 0, 1, 2
    let advB = 0; // 0, 1, 2
    let setWinner: "A" | "B" | null = null;

    for (const team of currentSetGoals) {
      if (setWinner) break;

      if (team === "A") scoreA++;
      else scoreB++;

      if (!inAdvantages) {
        if (scoreA >= advantageThreshold && scoreB >= advantageThreshold) {
          inAdvantages = true;
          advA = 0;
          advB = 0;
        } else if (scoreA >= targetGoals && scoreB < advantageThreshold) {
          setWinner = "A";
          break;
        } else if (scoreB >= targetGoals && scoreA < advantageThreshold) {
          setWinner = "B";
          break;
        }
      } else {
        // In advantages
        if (team === "A") {
          if (advB === 1) {
            advB = 0;
            advA = 0;
          } else if (advA === 0 && advB === 0) {
            advA = 1;
          } else if (advA === 1) {
            advA = 2;
            setWinner = "A";
            break;
          }
        } else {
          // team === "B"
          if (advA === 1) {
            advA = 0;
            advB = 0;
          } else if (advA === 0 && advB === 0) {
            advB = 1;
          } else if (advB === 1) {
            advB = 2;
            setWinner = "B";
            break;
          }
        }
      }
    }

    return { scoreA, scoreB, inAdvantages, advA, advB, setWinner };
  }, [currentSetGoals, targetGoals, advantageThreshold]);

  // Check if MATCH is won
  const matchWinner: "A" | "B" | null = useMemo(() => {
    if (match.winnerTeamId && match.teamA) {
      return match.winnerTeamId === match.teamA.id ? "A" : "B";
    }
    if (setsWonA >= targetSetsToWin) return "A";
    if (setsWonB >= targetSetsToWin) return "B";
    return null;
  }, [setsWonA, setsWonB, match.winnerTeamId, match.teamA, targetSetsToWin]);

  const teamAWon = matchWinner === "A";
  const teamBWon = matchWinner === "B";
  const isMatchFinished = teamAWon || teamBWon;

  // Is the currently pending set the one that concludes the whole match?
  const isPendingSetWinningMatch = useMemo(() => {
    if (!currentSetState.setWinner) return false;
    const potentialSetsA = setsWonA + (currentSetState.setWinner === "A" ? 1 : 0);
    const potentialSetsB = setsWonB + (currentSetState.setWinner === "B" ? 1 : 0);
    return potentialSetsA >= targetSetsToWin || potentialSetsB >= targetSetsToWin;
  }, [currentSetState.setWinner, setsWonA, setsWonB, targetSetsToWin]);

  const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/admin";
  const backText = match.tournamentId ? "Torna al Tabellone" : "Torna al Pannello";

  // Add goal to current set
  // IMPORTANT: blocked if match is finished OR if current set has a pending winner!
  const addGoal = (team: "A" | "B", scorerId: string | null = null) => {
    if (isMatchFinished || currentSetState.setWinner || isPending) return;
    setCurrentSetGoals(prev => [...prev, team]);
    setCurrentSetScorers(prev => [...prev, scorerId]);
  };

  // Remove last goal in current set
  // IMPORTANT: works even when currentSetState.setWinner is true, allowing user to UNDO mistakes!
  const removeLastGoal = (team?: "A" | "B") => {
    if (currentSetGoals.length === 0 || isPending) return;
    let targetIdx = -1;
    if (team) {
      for (let i = currentSetGoals.length - 1; i >= 0; i--) {
        if (currentSetGoals[i] === team) {
          targetIdx = i;
          break;
        }
      }
    } else {
      targetIdx = currentSetGoals.length - 1;
    }
    if (targetIdx === -1) return;
    const next = [...currentSetGoals];
    next.splice(targetIdx, 1);
    setCurrentSetGoals(next);
    const nextScorers = [...currentSetScorers];
    nextScorers.splice(targetIdx, 1);
    setCurrentSetScorers(nextScorers);
  };

  // EXPLICIT CONFIRMATION: The set only ends when user taps the button!
  const handleConfirmSet = () => {
    if (!currentSetState.setWinner || isPending || isMatchFinished) return;
    const winner = currentSetState.setWinner;
    const newCompletedSet: CompletedSet = {
      setNumber: currentSetNumber,
      scoreA: currentSetState.scoreA,
      scoreB: currentSetState.scoreB,
      inAdvantages: currentSetState.inAdvantages,
      winner: winner,
      scorers: countScorers(currentSetGoals, currentSetScorers),
    };

    const nextSetsA = setsWonA + (winner === "A" ? 1 : 0);
    const nextSetsB = setsWonB + (winner === "B" ? 1 : 0);
    const willMatchFinish = nextSetsA >= targetSetsToWin || nextSetsB >= targetSetsToWin;

    const newCompletedList = [...completedSets, newCompletedSet];
    setCompletedSets(newCompletedList);
    setCurrentSetGoals([]);
    setCurrentSetScorers([]);

    let finalWinnerId: string | null = null;
    if (willMatchFinish) {
      finalWinnerId = nextSetsA >= targetSetsToWin ? match.teamA?.id || null : match.teamB?.id || null;
    }

    const formattedSetsPayload = buildSetPayload(newCompletedList);

    startTransition(() => {
      updateExactMatchScore(match.id, nextSetsA, nextSetsB, finalWinnerId, formattedSetsPayload);
    });

    if (!willMatchFinish) {
      setSetFinishedModal(newCompletedSet);
    }
  };

  // Undo entire last set in case of error
  const undoLastSet = () => {
    if (completedSets.length === 0) return;
    const last = completedSets[completedSets.length - 1];
    const newCompleted = completedSets.slice(0, -1);
    setCompletedSets(newCompleted);

    // Reconstruct goals of that set minus the winning goal
    const reconstructed: ("A" | "B")[] = [];
    const reconstructedScorers: (string | null)[] = [];
    const teamPlayerIds = (t: "A" | "B") => {
      const team = t === "A" ? match.teamA : match.teamB;
      return team ? [team.player1.id, team.player2.id] : [];
    };
    const pushTeam = (t: "A" | "B", total: number) => {
      const ids = teamPlayerIds(t);
      let used = 0;
      for (const id of ids) {
        const n = last.scorers?.[id] || 0;
        for (let i = 0; i < n && used < total; i++, used++) {
          reconstructed.push(t);
          reconstructedScorers.push(id);
        }
      }
      for (; used < total; used++) {
        reconstructed.push(t);
        reconstructedScorers.push(null);
      }
    };
    pushTeam("A", last.scoreA);
    pushTeam("B", last.scoreB);
    // Remove the last goal to keep set open
    {
      let idx = -1;
      for (let i = reconstructed.length - 1; i >= 0; i--) {
        if (reconstructed[i] === last.winner && reconstructedScorers[i] === null) {
          idx = i;
          break;
        }
      }
      if (idx === -1) idx = reconstructed.lastIndexOf(last.winner);
      if (idx !== -1) {
        reconstructed.splice(idx, 1);
        reconstructedScorers.splice(idx, 1);
      }
    }

    setCurrentSetGoals(reconstructed);
    setCurrentSetScorers(reconstructedScorers);
    setSetFinishedModal(null);

    const prevSetsA = newCompleted.filter(s => s.winner === "A").length;
    const prevSetsB = newCompleted.filter(s => s.winner === "B").length;

    const formattedSetsPayload = buildSetPayload(newCompleted);

    startTransition(() => {
      updateExactMatchScore(match.id, prevSetsA, prevSetsB, null, formattedSetsPayload);
    });
  };

  // Click on numbered box in current set
  const handleBoxClick = (team: "A" | "B", boxNum: number) => {
    if (isMatchFinished || currentSetState.inAdvantages || isPending) return;
    const currentScore = team === "A" ? currentSetState.scoreA : currentSetState.scoreB;
    if (boxNum === currentScore) {
      removeLastGoal(team);
    } else if (boxNum === currentScore + 1) {
      if (currentSetState.setWinner) return; // blocked if set is won
      addGoal(team);
    }
  };

  // Legacy Set Mode Handlers
  const handleLegacyScore = (team: "A" | "B", action: "add" | "remove") => {
    if (match.winnerTeamId || isPending) return;
    startTransition(() => {
      updateMatchScore(match.id, team, action);
    });
  };

  const handleResetMatch = () => {
    if (confirm("Vuoi davvero azzerare completamente la partita e ripartire dalla Partita 1 (0-0)?")) {
      setCompletedSets([]);
      setCurrentSetGoals([]);
      setCurrentSetScorers([]);
      setSetFinishedModal(null);
      try {
        localStorage.removeItem(sessionStorageKey);
      } catch {}
      startTransition(() => {
        updateExactMatchScore(match.id, 0, 0, null, null);
      });
    }
  };

  if (!match.teamA || !match.teamB) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-screen bg-slate-950">
        <h2 className="text-2xl font-bold text-slate-400 mb-4">In attesa degli avversari...</h2>
        <p className="text-slate-500 mb-8">
          Questa partita non ha ancora entrambe le squadre assegnate. Ritorna quando il tabellone sarà aggiornato.
        </p>
        <Link href={backLink} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition">
          {backText}
        </Link>
      </div>
    );
  }

  const renderGoalBtn = (team: "A" | "B", playerId: string, color: "red" | "blue") => {
    if (mode !== "goals" || isMatchFinished) return null;
    const n = currentScorerCounts[playerId] || 0;
    return (
      <button
        type="button"
        onClick={() => addGoal(team, playerId)}
        disabled={isPending || !!currentSetState.setWinner}
        title="Gol di questo giocatore (conta anche per la squadra)"
        className={clsx(
          "w-full py-1.5 sm:py-2.5 px-2 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider border transition active:scale-95 disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer",
          color === "red"
            ? "border-red-400/70 text-red-100 bg-red-600/30 hover:bg-red-600/50"
            : "border-blue-400/70 text-blue-100 bg-blue-600/30 hover:bg-blue-600/50"
        )}
      >
        <span>⚽ GOL</span>
        {n > 0 && <span className="px-1.5 py-0.2 rounded bg-white/20 text-white font-extrabold">{n}</span>}
      </button>
    );
  };

  const teamAName = `${match.teamA.player1.name} & ${match.teamA.player2.name}`;
  const teamBName = `${match.teamB.player1.name} & ${match.teamB.player2.name}`;

  return (
    <div className="w-full h-[100dvh] max-h-[100dvh] p-2 sm:p-4 md:p-6 flex flex-col justify-between overflow-hidden bg-slate-950 text-white select-none">
      {/* COMPACT TOP HEADER */}
      <header className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={backLink}
            onClick={() => {
              try {
                localStorage.removeItem(sessionStorageKey);
              } catch {}
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition shrink-0"
            title={backText}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-lg font-black text-white tracking-wider uppercase truncate">
                Segnapunti
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                {matchFormat === "single" ? "Partita Secca" : "Al Meglio delle 3"}
              </span>
            </div>
          </div>
        </div>

        {/* SETS RECAP PILL & SETTINGS COG */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Score Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm sm:text-base font-black text-red-400">
              {mode === "goals" ? setsWonA : match.scoreTeamA}
            </span>
            <span className="text-slate-600 font-bold text-xs">-</span>
            <span className="text-sm sm:text-base font-black text-blue-400">
              {mode === "goals" ? setsWonB : match.scoreTeamB}
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>

          {/* Mode Switch (Desktop only) */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-xs font-bold">
            <button
              onClick={() => updateSettings("goals", targetGoals, advantageThreshold, matchFormat)}
              className={clsx(
                "px-2.5 py-1 rounded-lg transition-all",
                mode === "goals" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              ⚽ Gol
            </button>
            <button
              onClick={() => updateSettings("sets", targetGoals, advantageThreshold, matchFormat)}
              className={clsx(
                "px-2.5 py-1 rounded-lg transition-all",
                mode === "sets" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              🏆 Partite
            </button>
          </div>

          {/* Settings Drawer Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer"
            title="Apri impostazioni partita"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Opzioni</span>
          </button>
        </div>
      </header>

      {/* CURRENT STATUS & CONFIRMATION NOTIFICATION (Middle bar) */}
      <div className="shrink-0 my-1">
        {/* Set completion confirmation banner */}
        {currentSetState.setWinner && !isMatchFinished ? (
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 border-2 border-emerald-400 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.35)] flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in zoom-in-95">
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-300">
                  {isPendingSetWinningMatch ? "🏆 Sfida Vinta!" : `Partita ${currentSetNumber} Conclusa`}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  ({currentSetState.scoreA} - {currentSetState.scoreB})
                </span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                Vince{" "}
                <strong className={currentSetState.setWinner === "A" ? "text-red-400" : "text-blue-400"}>
                  {currentSetState.setWinner === "A" ? teamAName : teamBName}
                </strong>
                . Premi <b className="text-amber-300">&quot;-&quot;</b> per correggere se hai sbagliato.
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmSet}
              disabled={isPending}
              className="w-full sm:w-auto px-5 py-2 bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {isPendingSetWinningMatch
                  ? "Conferma Vittoria Sfida 🏆"
                  : `Conferma e Passa a Partita ${currentSetNumber + 1} ➜`}
              </span>
            </button>
          </div>
        ) : (
          !isMatchFinished &&
          mode === "goals" && (
            <div className="flex items-center justify-between px-2 py-0.5 text-slate-400 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5">
                <Play className="w-3 h-3 text-purple-400 fill-purple-400" />
                <span>
                  {matchFormat === "single"
                    ? "Partita Secca Unica"
                    : `In corso: Partita ${currentSetNumber} di 3 ${currentSetNumber === 3 ? "(La Bella)" : ""}`}
                </span>
              </span>
              <span className="text-slate-500">
                Target: <b className="text-slate-300">{targetGoals} gol</b>{" "}
                {advantageThreshold !== 99 && "(Vantaggi SÌ)"}
              </span>
            </div>
          )
        )}
      </div>

      {/* MAIN TWO-COLUMN ARENA (ALWAYS SIDE BY SIDE ON BOTH MOBILE AND DESKTOP) */}
      <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 min-h-0 w-full">
        {/* SQUADRA ROSSA */}
        <div
          className={clsx(
            "relative flex flex-col justify-between p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex-1 min-h-0 overflow-hidden",
            teamAWon ? "bg-red-950/70 border-red-500" : "bg-slate-900/90 border-slate-800 hover:border-red-900/60",
            isMatchFinished && !teamAWon && "opacity-40"
          )}
        >
          {/* Header Team Rossa */}
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-red-400 uppercase tracking-wider truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="truncate">{teamAName}</span>
              </span>
              {mode === "goals" && currentSetState.inAdvantages && currentSetState.advA === 1 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-500 text-white animate-pulse shrink-0">
                  +1
                </span>
              )}
            </div>

            {/* Players & Roles with GOL buttons */}
            {teamARoles && (
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                  {/* Goalkeeper */}
                  <div className="flex flex-col gap-1 bg-slate-950/60 border border-red-500/20 p-1.5 rounded-xl">
                    {renderGoalBtn("A", teamARoles.goalkeeperId, "red")}
                    <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                      <span className="flex items-center gap-1 truncate font-bold">
                        <span>🛡️</span>
                        <span className="truncate">
                          {match.teamA.player1.id === teamARoles.goalkeeperId
                            ? match.teamA.player1.name
                            : match.teamA.player2.name}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Striker */}
                  <div className="flex flex-col gap-1 bg-slate-950/60 border border-red-500/20 p-1.5 rounded-xl">
                    {renderGoalBtn("A", teamARoles.strikerId, "red")}
                    <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                      <span className="flex items-center gap-1 truncate font-bold">
                        <span>⚔️</span>
                        <span className="truncate">
                          {match.teamA.player1.id === teamARoles.strikerId
                            ? match.teamA.player1.name
                            : match.teamA.player2.name}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {!isMatchFinished && (
                  <button
                    type="button"
                    onClick={handleSwapTeamA}
                    title="Inverti ruoli"
                    className="self-center px-2.5 py-0.5 hover:bg-red-950/80 bg-slate-900 border border-red-500/30 rounded-lg text-amber-300 hover:text-amber-200 transition active:scale-95 flex items-center gap-1 text-[10px] font-bold shadow-sm"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Inverti</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CENTER DISPLAY SCORE ROSSO */}
          <div className="my-auto flex flex-col items-center justify-center py-1">
            {mode === "goals" ? (
              <>
                <div className="text-6xl sm:text-8xl md:text-9xl font-black text-white tabular-nums tracking-tight drop-shadow-md leading-none">
                  {currentSetState.scoreA}
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Gol Partita {currentSetNumber}
                </span>

                {/* Vantaggi mini HUD */}
                {currentSetState.inAdvantages && (
                  <div className="mt-1 px-2.5 py-1 bg-slate-950/80 border border-red-500/40 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] font-black text-red-400 uppercase">Vantaggi</span>
                    <span
                      className={clsx(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black",
                        currentSetState.advA >= 1 ? "bg-red-600 text-white" : "bg-slate-800 text-slate-600"
                      )}
                    >
                      +1
                    </span>
                    <span
                      className={clsx(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black",
                        currentSetState.advA >= 2 ? "bg-red-600 text-white" : "bg-slate-800 text-slate-600"
                      )}
                    >
                      🏆
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-6xl sm:text-8xl md:text-9xl font-black text-white tabular-nums">
                  {match.scoreTeamA}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Partite Vinte</span>
              </>
            )}
          </div>

          {/* PROGRESS STECCA / DOTS */}
          {mode === "goals" && (
            <div className="shrink-0 mb-2">
              {/* Desktop Stecca 1-10 */}
              <div className="hidden sm:grid grid-cols-10 gap-1 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                  const isEnabled = num <= targetGoals || currentSetState.inAdvantages;
                  const isChecked = currentSetState.scoreA >= num;
                  const isTarget = num === targetGoals;

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={!isEnabled || isMatchFinished}
                      onClick={() => handleBoxClick("A", num)}
                      className={clsx(
                        "h-8 md:h-10 rounded-lg flex flex-col items-center justify-center transition-all relative font-black select-none text-xs",
                        isChecked
                          ? "bg-red-600 text-white shadow-sm border border-red-400"
                          : isEnabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-red-500/50 border border-slate-700"
                          : "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed",
                        isTarget && !isChecked && isEnabled && "ring-1 ring-red-500/50"
                      )}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : num}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Dots Bar (No vertical space stolen) */}
              <div className="flex sm:hidden items-center justify-center gap-1">
                {Array.from({ length: targetGoals }, (_, i) => i + 1).map(num => (
                  <span
                    key={num}
                    className={clsx(
                      "h-1.5 rounded-full transition-all",
                      currentSetState.scoreA >= num
                        ? "w-3 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                        : "w-1.5 bg-slate-800"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS TEAM A */}
          {!isMatchFinished && (
            <div className="shrink-0 flex gap-1.5 sm:gap-2">
              <button
                onClick={() => (mode === "goals" ? removeLastGoal("A") : handleLegacyScore("A", "remove"))}
                disabled={isPending || (mode === "goals" ? currentSetState.scoreA === 0 : match.scoreTeamA === 0)}
                className="w-11 sm:w-16 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg sm:text-2xl disabled:opacity-30 flex items-center justify-center shrink-0 border border-slate-700 transition active:scale-95 cursor-pointer"
                title="Annulla ultimo gol rosso (-)"
              >
                -
              </button>
              <button
                onClick={() => (mode === "goals" ? addGoal("A") : handleLegacyScore("A", "add"))}
                disabled={isPending || !!currentSetState.setWinner}
                className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xs sm:text-xl shadow-lg shadow-red-950/50 active:scale-95 transition-transform disabled:opacity-30 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
              >
                <span className="sm:hidden">+ GOL</span>
                <span className="hidden sm:inline">{mode === "goals" ? "+ GOL ROSSO" : "+ PARTITA ROSSA"}</span>
              </button>
            </div>
          )}
        </div>

        {/* SQUADRA BLU */}
        <div
          className={clsx(
            "relative flex flex-col justify-between p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 flex-1 min-h-0 overflow-hidden",
            teamBWon ? "bg-blue-950/70 border-blue-500" : "bg-slate-900/90 border-slate-800 hover:border-blue-900/60",
            isMatchFinished && !teamBWon && "opacity-40"
          )}
        >
          {/* Header Team Blu */}
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-blue-400 uppercase tracking-wider truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="truncate">{teamBName}</span>
              </span>
              {mode === "goals" && currentSetState.inAdvantages && currentSetState.advB === 1 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-blue-500 text-white animate-pulse shrink-0">
                  +1
                </span>
              )}
            </div>

            {/* Players & Roles with GOL buttons */}
            {teamBRoles && (
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                  {/* Goalkeeper */}
                  <div className="flex flex-col gap-1 bg-slate-950/60 border border-blue-500/20 p-1.5 rounded-xl">
                    {renderGoalBtn("B", teamBRoles.goalkeeperId, "blue")}
                    <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                      <span className="flex items-center gap-1 truncate font-bold">
                        <span>🛡️</span>
                        <span className="truncate">
                          {match.teamB.player1.id === teamBRoles.goalkeeperId
                            ? match.teamB.player1.name
                            : match.teamB.player2.name}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Striker */}
                  <div className="flex flex-col gap-1 bg-slate-950/60 border border-blue-500/20 p-1.5 rounded-xl">
                    {renderGoalBtn("B", teamBRoles.strikerId, "blue")}
                    <div className="flex items-center justify-between text-[11px] text-slate-300 px-1">
                      <span className="flex items-center gap-1 truncate font-bold">
                        <span>⚔️</span>
                        <span className="truncate">
                          {match.teamB.player1.id === teamBRoles.strikerId
                            ? match.teamB.player1.name
                            : match.teamB.player2.name}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {!isMatchFinished && (
                  <button
                    type="button"
                    onClick={handleSwapTeamB}
                    title="Inverti ruoli"
                    className="self-center px-2.5 py-0.5 hover:bg-blue-950/80 bg-slate-900 border border-blue-500/30 rounded-lg text-amber-300 hover:text-amber-200 transition active:scale-95 flex items-center gap-1 text-[10px] font-bold shadow-sm"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Inverti</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CENTER DISPLAY SCORE BLU */}
          <div className="my-auto flex flex-col items-center justify-center py-1">
            {mode === "goals" ? (
              <>
                <div className="text-6xl sm:text-8xl md:text-9xl font-black text-white tabular-nums tracking-tight drop-shadow-md leading-none">
                  {currentSetState.scoreB}
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Gol Partita {currentSetNumber}
                </span>

                {/* Vantaggi mini HUD */}
                {currentSetState.inAdvantages && (
                  <div className="mt-1 px-2.5 py-1 bg-slate-950/80 border border-blue-500/40 rounded-xl flex items-center gap-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase">Vantaggi</span>
                    <span
                      className={clsx(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black",
                        currentSetState.advB >= 1 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-600"
                      )}
                    >
                      +1
                    </span>
                    <span
                      className={clsx(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black",
                        currentSetState.advB >= 2 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-600"
                      )}
                    >
                      🏆
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-6xl sm:text-8xl md:text-9xl font-black text-white tabular-nums">
                  {match.scoreTeamB}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Partite Vinte</span>
              </>
            )}
          </div>

          {/* PROGRESS STECCA / DOTS */}
          {mode === "goals" && (
            <div className="shrink-0 mb-2">
              {/* Desktop Stecca 1-10 */}
              <div className="hidden sm:grid grid-cols-10 gap-1 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
                  const isEnabled = num <= targetGoals || currentSetState.inAdvantages;
                  const isChecked = currentSetState.scoreB >= num;
                  const isTarget = num === targetGoals;

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={!isEnabled || isMatchFinished}
                      onClick={() => handleBoxClick("B", num)}
                      className={clsx(
                        "h-8 md:h-10 rounded-lg flex flex-col items-center justify-center transition-all relative font-black select-none text-xs",
                        isChecked
                          ? "bg-blue-600 text-white shadow-sm border border-blue-400"
                          : isEnabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 border border-slate-700"
                          : "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed",
                        isTarget && !isChecked && isEnabled && "ring-1 ring-blue-500/50"
                      )}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : num}
                    </button>
                  );
                })}
              </div>

              {/* Mobile Dots Bar */}
              <div className="flex sm:hidden items-center justify-center gap-1">
                {Array.from({ length: targetGoals }, (_, i) => i + 1).map(num => (
                  <span
                    key={num}
                    className={clsx(
                      "h-1.5 rounded-full transition-all",
                      currentSetState.scoreB >= num
                        ? "w-3 bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                        : "w-1.5 bg-slate-800"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS TEAM B */}
          {!isMatchFinished && (
            <div className="shrink-0 flex gap-1.5 sm:gap-2">
              <button
                onClick={() => (mode === "goals" ? removeLastGoal("B") : handleLegacyScore("B", "remove"))}
                disabled={isPending || (mode === "goals" ? currentSetState.scoreB === 0 : match.scoreTeamB === 0)}
                className="w-11 sm:w-16 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-lg sm:text-2xl disabled:opacity-30 flex items-center justify-center shrink-0 border border-slate-700 transition active:scale-95 cursor-pointer"
                title="Annulla ultimo gol blu (-)"
              >
                -
              </button>
              <button
                onClick={() => (mode === "goals" ? addGoal("B") : handleLegacyScore("B", "add"))}
                disabled={isPending || !!currentSetState.setWinner}
                className="flex-1 h-11 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs sm:text-xl shadow-lg shadow-blue-950/50 active:scale-95 transition-transform disabled:opacity-30 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer"
              >
                <span className="sm:hidden">+ GOL</span>
                <span className="hidden sm:inline">{mode === "goals" ? "+ GOL BLU" : "+ PARTITA BLU"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR WITH RECAP & RESET */}
      <footer className="shrink-0 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>Stato:</span>
          {isMatchFinished ? (
            <span className="text-emerald-400 font-bold">Sfida Conclusa</span>
          ) : (
            <span className="text-slate-300 font-bold">
              {matchFormat === "single"
                ? "Partita Secca Unica"
                : `In corso (Partita ${currentSetNumber} di 3) • ${setsWonA} a ${setsWonB} nelle partite`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {completedSets.length > 0 && !isMatchFinished && (
            <button
              onClick={undoLastSet}
              className="text-slate-400 hover:text-yellow-400 transition cursor-pointer font-bold"
            >
              Annulla Partita Precedente
            </button>
          )}

          {!isMatchFinished && (completedSets.length > 0 || currentSetGoals.length > 0) && (
            <button
              onClick={handleResetMatch}
              className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Azzera</span>
            </button>
          )}
        </div>
      </footer>

      {/* SETTINGS DRAWER / MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">Impostazioni Sfida</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Option 1: Format (Single vs Bo3) */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-2">
                Formato Sfida
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings(mode, targetGoals, advantageThreshold, "single")}
                  className={clsx(
                    "p-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all",
                    matchFormat === "single"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  <Zap className="w-4 h-4" />
                  <span>Partita Secca (1 Set)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings(mode, targetGoals, advantageThreshold, "bo3")}
                  className={clsx(
                    "p-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all",
                    matchFormat === "bo3"
                      ? "bg-purple-600 text-white border-purple-400 shadow-md"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Al Meglio delle 3 (Bo3)</span>
                </button>
              </div>
            </div>

            {/* Option 2: Target Goals */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-2">
                Gol per Vincere ogni Partita
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      updateSettings(
                        "goals",
                        val,
                        advantageThreshold === 99 ? 99 : val - 1,
                        matchFormat
                      )
                    }
                    className={clsx(
                      "py-2 rounded-xl text-sm font-black transition-all",
                      targetGoals === val
                        ? "bg-purple-600 text-white shadow"
                        : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Option 3: Advantages */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-2">
                Vantaggi (Scarto di 2)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings("goals", targetGoals, targetGoals - 1, matchFormat)}
                  className={clsx(
                    "py-2.5 rounded-xl text-xs font-black transition-all",
                    advantageThreshold !== 99
                      ? "bg-yellow-500 text-slate-950 shadow"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  SÌ (Attivi sul {targetGoals - 1}-{targetGoals - 1})
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings("goals", targetGoals, 99, matchFormat)}
                  className={clsx(
                    "py-2.5 rounded-xl text-xs font-black transition-all",
                    advantageThreshold === 99
                      ? "bg-yellow-500 text-slate-950 shadow"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  NO (Chi fa {targetGoals} vince)
                </button>
              </div>
            </div>

            {/* Option 4: Mode */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                Modalità di Gioco
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings("goals", targetGoals, advantageThreshold, matchFormat)}
                  className={clsx(
                    "py-2 rounded-xl text-xs font-bold transition-all",
                    mode === "goals"
                      ? "bg-slate-700 text-white shadow"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  ⚽ Segna Gol
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings("sets", targetGoals, advantageThreshold, matchFormat)}
                  className={clsx(
                    "py-2 rounded-xl text-xs font-bold transition-all",
                    mode === "sets"
                      ? "bg-slate-700 text-white shadow"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                  )}
                >
                  🏆 Solo Partite
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 cursor-pointer mt-1"
            >
              Chiudi e Torna al Gioco
            </button>
          </div>
        </div>
      )}

      {/* INTER-SET MODAL (Between sets when match is not finished) */}
      {setFinishedModal && !isMatchFinished && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-5 sm:p-7 max-w-md w-full text-center shadow-2xl shadow-purple-950/50">
            <div className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-purple-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 block mb-1">
              Partita {setFinishedModal.setNumber} Conclusa!
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              Vinto da{" "}
              <span className={setFinishedModal.winner === "A" ? "text-red-400" : "text-blue-400"}>
                {setFinishedModal.winner === "A" ? teamAName : teamBName}
              </span>
            </h2>
            <div className="text-3xl sm:text-4xl font-black text-white my-2">
              {setFinishedModal.scoreA} - {setFinishedModal.scoreB}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 my-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Situazione Sfida
              </span>
              <div className="text-lg font-black text-white">
                <span className="text-red-400">{setsWonA}</span> a <span className="text-blue-400">{setsWonB}</span>{" "}
                nelle partite
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSetFinishedModal(null)}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-base uppercase tracking-wider rounded-xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <span>Inizia Partita {setFinishedModal.setNumber + 1}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={undoLastSet}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl transition cursor-pointer"
              >
                Annulla ultimo gol (Correggi Partita {setFinishedModal.setNumber})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY VITTORIA SFIDA */}
      {isMatchFinished && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
          <Trophy className="w-20 h-20 sm:w-28 sm:h-28 text-yellow-400 mb-3 animate-bounce" />
          <h2 className="text-3xl sm:text-5xl font-black text-white text-center mb-1 uppercase tracking-tight">
            Vittoria Sfida!
          </h2>
          <div
            className={clsx(
              "text-xl sm:text-3xl font-black text-center mb-4",
              teamAWon ? "text-red-500" : "text-blue-500"
            )}
          >
            {teamAWon ? teamAName : teamBName}
          </div>

          <div className="bg-slate-900 border border-slate-700 px-6 py-4 rounded-3xl mb-6 text-center shadow-2xl max-w-md w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              {matchFormat === "single" ? "Risultato Partita Secca" : "Risultato Finale Sfida"}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white tracking-wider mb-3">
              <span className={teamAWon ? "text-red-400" : "text-slate-400"}>
                {mode === "goals" ? setsWonA || match.scoreTeamA : match.scoreTeamA}
              </span>
              <span className="text-slate-600 mx-3">-</span>
              <span className={teamBWon ? "text-blue-400" : "text-slate-400"}>
                {mode === "goals" ? setsWonB || match.scoreTeamB : match.scoreTeamB}
              </span>
            </div>

            {/* Recap dei singoli set */}
            {(completedSets.length > 0 || (match.setScores && formatSetScores(match.setScores))) && (
              <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dettaglio Partite Giocate:
                </span>
                <div className="flex justify-center gap-2 flex-wrap">
                  {completedSets.length > 0 ? (
                    completedSets.map(s => (
                      <span
                        key={s.setNumber}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300"
                      >
                        Partita {s.setNumber}: <b className="text-white">{s.scoreA}-{s.scoreB}</b>{" "}
                        {s.inAdvantages && "(Vantaggi)"}
                      </span>
                    ))
                  ) : (
                    <span className="text-emerald-400 font-black tracking-wider text-sm bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl">
                      {formatSetScores(match.setScores)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href={backLink}
              onClick={() => {
                try {
                  localStorage.removeItem(sessionStorageKey);
                } catch {}
              }}
              className="px-6 py-3 bg-white text-slate-950 rounded-full font-black text-base hover:scale-105 transition-transform shadow-xl"
            >
              {backText}
            </Link>
            {!match.tournamentId && (
              <Link
                href="/match"
                onClick={() => {
                  try {
                    localStorage.removeItem(sessionStorageKey);
                  } catch {}
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-base hover:scale-105 transition-transform shadow-xl"
              >
                Nuova Sfida Libera
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
