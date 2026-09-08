"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { updateMatchScore, updateExactMatchScore } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, RotateCcw, Settings, Check, ChevronRight, Play } from "lucide-react";
import clsx from "clsx";

type PlayerInfo = { id: string; name: string };
type TeamInfo = { id: string; player1: PlayerInfo; player2: PlayerInfo };
type MatchInfo = {
  id: string;
  scoreTeamA: number; // Sets won by Team A
  scoreTeamB: number; // Sets won by Team B
  winnerTeamId: string | null;
  tournamentId: string | null;
  teamA: TeamInfo | null;
  teamB: TeamInfo | null;
};

type ScorerMode = "goals" | "sets";

type CompletedSet = {
  setNumber: number;
  scoreA: number;
  scoreB: number;
  inAdvantages: boolean;
  winner: "A" | "B";
};

export default function MatchScorer({ match }: { match: MatchInfo }) {
  const [isPending, startTransition] = useTransition();

  // Settings with LocalStorage persistence
  const [mode, setMode] = useState<ScorerMode>("goals");
  const [targetGoals, setTargetGoals] = useState<number>(7);
  const [advantageThreshold, setAdvantageThreshold] = useState<number>(5);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Load saved general settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.targetGoals) setTargetGoals(parsed.targetGoals);
        if (parsed.advantageThreshold) setAdvantageThreshold(parsed.advantageThreshold);
      }
    } catch {}
  }, []);

  const updateSettings = (newMode: ScorerMode, newTarget: number, newThreshold: number) => {
    setMode(newMode);
    setTargetGoals(newTarget);
    setAdvantageThreshold(newThreshold);
    try {
      localStorage.setItem("foosball_scorer_settings", JSON.stringify({
        mode: newMode,
        targetGoals: newTarget,
        advantageThreshold: newThreshold
      }));
    } catch {}
  };

  // Best of 3 Sets Session state
  const sessionStorageKey = `foosball_match_session_${match.id}`;

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
    // Fallback based on DB sets if already partially played
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

  // Inter-set modal state (shown when a set is won but match continues)
  const [setFinishedModal, setSetFinishedModal] = useState<CompletedSet | null>(null);

  // Sync session to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(sessionStorageKey, JSON.stringify({
        completedSets,
        currentSetGoals
      }));
    } catch {}
  }, [completedSets, currentSetGoals, sessionStorageKey]);

  // Derived sets won count
  const setsWonA = completedSets.filter(s => s.winner === "A").length;
  const setsWonB = completedSets.filter(s => s.winner === "B").length;

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

  // Check if MATCH is won (first to 2 sets)
  const matchWinner: "A" | "B" | null = useMemo(() => {
    if (match.winnerTeamId && match.teamA) {
      return match.winnerTeamId === match.teamA.id ? "A" : "B";
    }
    if (setsWonA >= 2) return "A";
    if (setsWonB >= 2) return "B";
    return null;
  }, [setsWonA, setsWonB, match.winnerTeamId, match.teamA]);

  const teamAWon = matchWinner === "A";
  const teamBWon = matchWinner === "B";
  const isMatchFinished = teamAWon || teamBWon;

  const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/admin";
  const backText = match.tournamentId ? "Torna al Tabellone" : "Torna al Pannello";

  // Watch for current set completion
  useEffect(() => {
    if (currentSetState.setWinner && !setFinishedModal && !isMatchFinished) {
      const winner = currentSetState.setWinner;
      const newCompletedSet: CompletedSet = {
        setNumber: currentSetNumber,
        scoreA: currentSetState.scoreA,
        scoreB: currentSetState.scoreB,
        inAdvantages: currentSetState.inAdvantages,
        winner: winner
      };

      const nextSetsA = setsWonA + (winner === "A" ? 1 : 0);
      const nextSetsB = setsWonB + (winner === "B" ? 1 : 0);
      const willMatchFinish = nextSetsA >= 2 || nextSetsB >= 2;

      const newCompletedList = [...completedSets, newCompletedSet];
      setCompletedSets(newCompletedList);
      setCurrentSetGoals([]);

      // If match is finished, update DB with final sets and winner
      let finalWinnerId: string | null = null;
      if (willMatchFinish) {
        finalWinnerId = nextSetsA >= 2 ? match.teamA?.id || null : match.teamB?.id || null;
      }

      startTransition(() => {
        updateExactMatchScore(match.id, nextSetsA, nextSetsB, finalWinnerId);
      });

      if (!willMatchFinish) {
        setSetFinishedModal(newCompletedSet);
      }
    }
  }, [currentSetState.setWinner, isMatchFinished, currentSetState.scoreA, currentSetState.scoreB, currentSetState.inAdvantages, currentSetNumber, setsWonA, setsWonB, completedSets, match.teamA?.id, match.teamB?.id, match.id, setFinishedModal]);

  // Add goal to current set
  const addGoal = (team: "A" | "B") => {
    if (isMatchFinished || currentSetState.setWinner || isPending) return;
    setCurrentSetGoals(prev => [...prev, team]);
  };

  // Remove last goal in current set
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
  };

  // Undo entire last set in case of error
  const undoLastSet = () => {
    if (completedSets.length === 0) return;
    const last = completedSets[completedSets.length - 1];
    const newCompleted = completedSets.slice(0, -1);
    setCompletedSets(newCompleted);

    // Reconstruct goals of that set minus the winning goal
    const reconstructed: ("A" | "B")[] = [];
    for (let i = 0; i < last.scoreA; i++) reconstructed.push("A");
    for (let i = 0; i < last.scoreB; i++) reconstructed.push("B");
    // Remove the last goal to keep set open
    if (last.winner === "A") {
      const idx = reconstructed.lastIndexOf("A");
      if (idx !== -1) reconstructed.splice(idx, 1);
    } else {
      const idx = reconstructed.lastIndexOf("B");
      if (idx !== -1) reconstructed.splice(idx, 1);
    }

    setCurrentSetGoals(reconstructed);
    setSetFinishedModal(null);

    const prevSetsA = newCompleted.filter(s => s.winner === "A").length;
    const prevSetsB = newCompleted.filter(s => s.winner === "B").length;

    startTransition(() => {
      updateExactMatchScore(match.id, prevSetsA, prevSetsB, null);
    });
  };

  // Click on numbered box in current set
  const handleBoxClick = (team: "A" | "B", boxNum: number) => {
    if (isMatchFinished || currentSetState.inAdvantages || isPending) return;
    const currentScore = team === "A" ? currentSetState.scoreA : currentSetState.scoreB;
    if (boxNum === currentScore) {
      removeLastGoal(team);
    } else if (boxNum === currentScore + 1) {
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
    if (confirm("Vuoi davvero azzerare completamente la partita e ripartire dal Set 1 (0-0)?")) {
      setCompletedSets([]);
      setCurrentSetGoals([]);
      setSetFinishedModal(null);
      try {
        localStorage.removeItem(sessionStorageKey);
      } catch {}
      startTransition(() => {
        updateExactMatchScore(match.id, 0, 0, null);
      });
    }
  };

  if (!match.teamA || !match.teamB) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-screen">
        <h2 className="text-2xl font-bold text-slate-400 mb-4">In attesa degli avversari...</h2>
        <p className="text-slate-500 mb-8">Questa partita non ha ancora entrambe le squadre assegnate. Ritorna quando il tabellone sarà aggiornato.</p>
        <Link href={backLink} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition">
          {backText}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 md:p-6 relative max-w-7xl mx-auto w-full min-h-screen">
      {/* HEADER & NAV */}
      <header className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href={backLink} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wider uppercase">
                Match Scorer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Al Meglio dei 3 Set
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {match.tournamentId ? "Partita di Torneo" : "Partita Libera"} • Vince chi conquista 2 set
            </p>
          </div>
        </div>

        {/* SETTINGS & MODE CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switch */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => updateSettings("goals", targetGoals, advantageThreshold)}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all",
                mode === "goals" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              ⚽ Modalità Gol
            </button>
            <button
              onClick={() => updateSettings("sets", targetGoals, advantageThreshold)}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all",
                mode === "sets" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              🏆 Solo Set
            </button>
          </div>

          {/* Settings panel trigger */}
          {mode === "goals" && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition",
                showSettings 
                  ? "bg-slate-700 border-slate-500 text-white" 
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>{targetGoals} Gol (Vantaggi a {advantageThreshold})</span>
            </button>
          )}
        </div>
      </header>

      {/* EXPANDABLE SETTINGS PANEL */}
      {mode === "goals" && showSettings && (
        <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-4 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-purple-300 block mb-1">
                Gol per vincere ogni Set
              </label>
              <div className="flex gap-1.5">
                {[5, 6, 7, 8, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", val, Math.min(advantageThreshold, val - 1))}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      targetGoals === val ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                Soglia Vantaggi (Pari a cui scattano)
              </label>
              <div className="flex gap-1.5">
                {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", targetGoals, val)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      advantageThreshold === val ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold transition ml-auto"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* BEST OF 3 SETS SCOREBOARD HEADER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          {/* Sets summary team A */}
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="font-black text-white text-base md:text-lg truncate max-w-[130px] sm:max-w-none">
              {match.teamA.player1.name} & {match.teamA.player2.name}
            </span>
            <span className="text-2xl md:text-3xl font-black text-red-400 ml-1">
              {mode === "goals" ? setsWonA : match.scoreTeamA}
            </span>
          </div>

          <span className="text-slate-600 font-black text-xl">VS</span>

          {/* Sets summary team B */}
          <div className="flex items-center gap-3">
            <span className="text-2xl md:text-3xl font-black text-blue-400 mr-1">
              {mode === "goals" ? setsWonB : match.scoreTeamB}
            </span>
            <span className="font-black text-white text-base md:text-lg truncate max-w-[130px] sm:max-w-none">
              {match.teamB.player1.name} & {match.teamB.player2.name}
            </span>
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          </div>
        </div>

        {/* Set History Badges */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {[1, 2, 3].map(num => {
            const setFinished = completedSets.find(s => s.setNumber === num);
            const isCurrent = !isMatchFinished && currentSetNumber === num;
            return (
              <div
                key={num}
                className={clsx(
                  "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5",
                  setFinished
                    ? setFinished.winner === "A"
                      ? "bg-red-950/40 border-red-500/50 text-red-300"
                      : "bg-blue-950/40 border-blue-500/50 text-blue-300"
                    : isCurrent
                    ? "bg-purple-950/40 border-purple-500 text-purple-300 ring-2 ring-purple-500/40 animate-pulse"
                    : "bg-slate-950/40 border-slate-800 text-slate-600"
                )}
              >
                <span>Set {num}:</span>
                {setFinished ? (
                  <span className="font-black text-white">
                    {setFinished.scoreA} - {setFinished.scoreB}
                  </span>
                ) : isCurrent ? (
                  <span className="font-black text-purple-300">
                    {num === 3 ? "La Bella 🔥" : "In corso"}
                  </span>
                ) : (
                  <span>-</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* VANTAGGI BANNER NOTIFICATION (Current Set) */}
      {mode === "goals" && currentSetState.inAdvantages && !isMatchFinished && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-500/60 rounded-2xl p-3 mb-4 shadow-[0_0_25px_rgba(234,179,8,0.25)] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <div className="text-base font-black text-yellow-400 uppercase tracking-wider">
                ⚡ VANTAGGI SET {currentSetNumber} (Pari raggiunto a {advantageThreshold})
              </div>
              <p className="text-xs text-slate-300">
                Punteggio azzerato per i vantaggi: <b>vince il set chi segna 2 gol consecutivi (+2)</b>. Se l'avversario pareggia, si riazzera!
              </p>
            </div>
          </div>
          <div className="bg-slate-900/80 px-4 py-1.5 rounded-xl border border-yellow-500/30 shrink-0">
            <span className="text-[11px] text-slate-400 font-bold block uppercase">Gol Effettivi Set {currentSetNumber}:</span>
            <span className="text-lg font-black text-white">{currentSetState.scoreA} - {currentSetState.scoreB}</span>
          </div>
        </div>
      )}

      {/* INTER-SET MODAL (Between Set 1 and 2, or Set 2 and 3) */}
      {setFinishedModal && !isMatchFinished && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl shadow-purple-950/50">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-purple-400 block mb-1">
              Set {setFinishedModal.setNumber} Concluso
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
              Vinto da{" "}
              <span className={setFinishedModal.winner === "A" ? "text-red-400" : "text-blue-400"}>
                {setFinishedModal.winner === "A"
                  ? `${match.teamA.player1.name} & ${match.teamA.player2.name}`
                  : `${match.teamB.player1.name} & ${match.teamB.player2.name}`}
              </span>
            </h2>
            <div className="text-4xl font-black text-white my-3">
              {setFinishedModal.scoreA} - {setFinishedModal.scoreB}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 my-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Situazione Set Partita (Al meglio delle 3)
              </span>
              <div className="flex items-center justify-center gap-6 text-2xl font-black">
                <span className="text-red-400">{setsWonA} Set</span>
                <span className="text-slate-600">-</span>
                <span className="text-blue-400">{setsWonB} Set</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {setsWonA === 1 && setsWonB === 1
                  ? "Parità 1-1! Si va al 3° Set Decisivo (La Bella)!"
                  : setsWonA === 1
                  ? "Squadra Rossa a un solo set dalla vittoria della partita!"
                  : "Squadra Blu a un solo set dalla vittoria della partita!"}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSetFinishedModal(null)}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
              >
                <span>Inizia Set {currentSetNumber}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={undoLastSet}
                className="text-xs text-slate-400 hover:text-white px-4 py-2 rounded-xl transition"
              >
                Annulla ultimo gol (Correggi Set {setFinishedModal.setNumber})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY VITTORIA PARTITA (2 Set Vinti) */}
      {isMatchFinished && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <Trophy className="w-24 h-24 md:w-32 md:h-32 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-2">
            VITTORIA PARTITA!
          </h2>
          <div className={clsx(
            "text-2xl md:text-4xl font-black text-center mb-4",
            teamAWon ? "text-red-500" : "text-blue-500"
          )}>
            {teamAWon 
              ? `${match.teamA.player1.name} & ${match.teamA.player2.name}` 
              : `${match.teamB.player1.name} & ${match.teamB.player2.name}`}
          </div>

          <div className="bg-slate-900 border border-slate-700 px-8 py-5 rounded-3xl mb-8 text-center shadow-2xl max-w-md w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Risultato Finale Set
            </span>
            <div className="text-5xl font-black text-white tracking-wider mb-4">
              <span className={teamAWon ? "text-red-400" : "text-slate-400"}>{mode === "goals" ? setsWonA : match.scoreTeamA}</span>
              <span className="text-slate-600 mx-3">-</span>
              <span className={teamBWon ? "text-blue-400" : "text-slate-400"}>{mode === "goals" ? setsWonB : match.scoreTeamB}</span>
            </div>

            {/* Recap dei singoli set */}
            {completedSets.length > 0 && (
              <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dettaglio Set Giocati:</span>
                <div className="flex justify-center gap-2 flex-wrap">
                  {completedSets.map((s) => (
                    <span key={s.setNumber} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300">
                      Set {s.setNumber}: <b className="text-white">{s.scoreA}-{s.scoreB}</b> {s.inAdvantages && "(Vantaggi)"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={backLink}
              onClick={() => {
                try { localStorage.removeItem(sessionStorageKey); } catch {}
              }}
              className="px-8 py-3.5 bg-white text-slate-950 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-xl"
            >
              {backText}
            </Link>
          </div>
        </div>
      )}

      {/* CURRENT SET BADGE INDICATOR */}
      {!isMatchFinished && mode === "goals" && (
        <div className="text-center mb-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-slate-800 border border-slate-700 text-purple-300 shadow">
            <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
            In corso: Set {currentSetNumber} di 3 {currentSetNumber === 3 && "(La Bella - Decisivo)"}
          </span>
        </div>
      )}

      {/* MAIN TWO-COLUMN ARENA (Current Set) */}
      <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-6 min-h-[420px]">
        {/* SQUADRA ROSSA */}
        <div className={clsx(
          "relative flex flex-col rounded-3xl p-5 md:p-6 transition-all duration-300 border-2 flex-1 justify-between",
          teamAWon ? "bg-red-950/60 border-red-500" : "bg-slate-900/90 border-slate-800 hover:border-red-900/60",
          isMatchFinished && !teamAWon && "opacity-40"
        )}>
          {/* Header Team */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                Squadra Rossa • Set Vinti: {mode === "goals" ? setsWonA : match.scoreTeamA}/2
              </span>
              {mode === "goals" && currentSetState.inAdvantages && currentSetState.advA === 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                  Set Point Rosso (+1)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.teamA.player1.name} <span className="text-slate-600">&</span> {match.teamA.player2.name}
            </h2>
          </div>

          {/* CENTER DISPLAY */}
          <div className="my-4 flex flex-col items-center justify-center">
            {mode === "goals" ? (
              <>
                <div className="text-7xl md:text-9xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
                  {currentSetState.scoreA}
                </div>
                <span className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                  Gol nel Set {currentSetNumber}
                </span>

                {/* VANTAGGI DUEL HUD (Se in fase vantaggi nel set corrente) */}
                {currentSetState.inAdvantages && (
                  <div className="mt-4 w-full bg-slate-950/80 border border-red-500/40 rounded-2xl p-3 text-center">
                    <div className="text-[11px] font-black uppercase tracking-wider text-red-400 mb-2">
                      Vantaggi Set {currentSetNumber} (Serve +2 consecutivo)
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        currentSetState.advA >= 1 
                          ? "bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 1</span>
                        <span className="text-base font-black">+1</span>
                      </div>
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        currentSetState.advA >= 2 
                          ? "bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] scale-110" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 2</span>
                        <Trophy className="w-4 h-4 mt-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-8xl md:text-9xl font-black text-white tabular-nums">
                  {match.scoreTeamA}
                </span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Set Vinti</span>
              </>
            )}
          </div>

          {/* STECCA 1-10 (Solo in Modalità Gol per il Set corrente) */}
          {mode === "goals" && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">
                <span>Stecca Gol Set {currentSetNumber} (1 - 10)</span>
                <span>Target: {targetGoals} gol</span>
              </div>
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
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
                        "h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all relative font-black select-none",
                        isChecked
                          ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] border-2 border-red-400"
                          : isEnabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-red-500/50 border border-slate-700"
                          : "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed",
                        isTarget && !isChecked && isEnabled && "ring-1 ring-red-500/50"
                      )}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-xs sm:text-sm">{num}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          {!isMatchFinished && (
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={() => mode === "goals" ? removeLastGoal("A") : handleLegacyScore("A", "remove")}
                disabled={isPending || (mode === "goals" ? currentSetState.scoreA === 0 : match.scoreTeamA === 0)}
                className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-2xl disabled:opacity-30 flex items-center justify-center shrink-0 border border-slate-700 transition active:scale-95"
                title="Annulla ultimo gol rosso"
              >
                -
              </button>
              <button 
                onClick={() => mode === "goals" ? addGoal("A") : handleLegacyScore("A", "add")}
                disabled={isPending}
                className="flex-1 h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xl sm:text-2xl shadow-lg shadow-red-950/50 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {mode === "goals" ? "+ GOL ROSSO" : "+ SET ROSSO"}
              </button>
            </div>
          )}
        </div>

        {/* SQUADRA BLU */}
        <div className={clsx(
          "relative flex flex-col rounded-3xl p-5 md:p-6 transition-all duration-300 border-2 flex-1 justify-between",
          teamBWon ? "bg-blue-950/60 border-blue-500" : "bg-slate-900/90 border-slate-800 hover:border-blue-900/60",
          isMatchFinished && !teamBWon && "opacity-40"
        )}>
          {/* Header Team */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                Squadra Blu • Set Vinti: {mode === "goals" ? setsWonB : match.scoreTeamB}/2
              </span>
              {mode === "goals" && currentSetState.inAdvantages && currentSetState.advB === 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500 text-white animate-pulse">
                  Set Point Blu (+1)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.teamB.player1.name} <span className="text-slate-600">&</span> {match.teamB.player2.name}
            </h2>
          </div>

          {/* CENTER DISPLAY */}
          <div className="my-4 flex flex-col items-center justify-center">
            {mode === "goals" ? (
              <>
                <div className="text-7xl md:text-9xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
                  {currentSetState.scoreB}
                </div>
                <span className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                  Gol nel Set {currentSetNumber}
                </span>

                {/* VANTAGGI DUEL HUD (Se in fase vantaggi nel set corrente) */}
                {currentSetState.inAdvantages && (
                  <div className="mt-4 w-full bg-slate-950/80 border border-blue-500/40 rounded-2xl p-3 text-center">
                    <div className="text-[11px] font-black uppercase tracking-wider text-blue-400 mb-2">
                      Vantaggi Set {currentSetNumber} (Serve +2 consecutivo)
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        currentSetState.advB >= 1 
                          ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 1</span>
                        <span className="text-base font-black">+1</span>
                      </div>
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        currentSetState.advB >= 2 
                          ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.7)] scale-110" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 2</span>
                        <Trophy className="w-4 h-4 mt-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-8xl md:text-9xl font-black text-white tabular-nums">
                  {match.scoreTeamB}
                </span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Set Vinti</span>
              </>
            )}
          </div>

          {/* STECCA 1-10 (Solo in Modalità Gol per il Set corrente) */}
          {mode === "goals" && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">
                <span>Stecca Gol Set {currentSetNumber} (1 - 10)</span>
                <span>Target: {targetGoals} gol</span>
              </div>
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
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
                        "h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all relative font-black select-none",
                        isChecked
                          ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)] border-2 border-blue-400"
                          : isEnabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 border border-slate-700"
                          : "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed",
                        isTarget && !isChecked && isEnabled && "ring-1 ring-blue-500/50"
                      )}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-xs sm:text-sm">{num}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          {!isMatchFinished && (
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={() => mode === "goals" ? removeLastGoal("B") : handleLegacyScore("B", "remove")}
                disabled={isPending || (mode === "goals" ? currentSetState.scoreB === 0 : match.scoreTeamB === 0)}
                className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-2xl disabled:opacity-30 flex items-center justify-center shrink-0 border border-slate-700 transition active:scale-95"
                title="Annulla ultimo gol blu"
              >
                -
              </button>
              <button 
                onClick={() => mode === "goals" ? addGoal("B") : handleLegacyScore("B", "add")}
                disabled={isPending}
                className="flex-1 h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xl sm:text-2xl shadow-lg shadow-blue-950/50 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {mode === "goals" ? "+ GOL BLU" : "+ SET BLU"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR WITH RECAP & RESET */}
      <footer className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Stato:</span>
          {isMatchFinished ? (
            <span className="text-emerald-400 font-bold">Partita Conclusa</span>
          ) : (
            <span className="text-slate-300 font-bold">
              In corso (Set {currentSetNumber} di 3) • {setsWonA} a {setsWonB} nei set
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {completedSets.length > 0 && !isMatchFinished && (
            <button
              onClick={undoLastSet}
              className="text-xs text-slate-400 hover:text-yellow-400 transition"
            >
              Annulla Set Precedente
            </button>
          )}

          {!isMatchFinished && (completedSets.length > 0 || currentSetGoals.length > 0) && (
            <button
              onClick={handleResetMatch}
              className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Azzera Partita</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
