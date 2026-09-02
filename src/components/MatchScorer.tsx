"use client";

import { useTransition } from "react";
import { updateMatchScore } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import clsx from "clsx";

type PlayerInfo = { id: string; name: string };
type TeamInfo = { id: string; player1: PlayerInfo; player2: PlayerInfo };
type MatchInfo = {
  id: string;
  scoreTeamA: number;
  scoreTeamB: number;
  winnerTeamId: string | null;
  tournamentId: string | null;
  teamA: TeamInfo;
  teamB: TeamInfo;
};

export default function MatchScorer({ match }: { match: MatchInfo }) {
  const [isPending, startTransition] = useTransition();

  const handleScore = (team: "A" | "B", action: "add" | "remove") => {
    if (match.winnerTeamId) return;
    startTransition(() => {
      updateMatchScore(match.id, team, action);
    });
  };

  const teamAWon = match.teamA ? match.winnerTeamId === match.teamA.id : false;
  const teamBWon = match.teamB ? match.winnerTeamId === match.teamB.id : false;
  const isFinished = !!match.winnerTeamId;

  const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/admin";
  const backText = match.tournamentId ? "Torna al Tabellone" : "Torna al Pannello";

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
    <div className="flex-1 flex flex-col p-4 md:p-8 relative">
      <header className="flex justify-between items-center mb-8">
        <Link href={backLink} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-slate-500 tracking-widest uppercase">
          Match Scorer
        </h1>
        <div className="w-12"></div>
      </header>

      {/* OVERLAY VITTORIA */}
      {match.winnerTeamId && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          <Trophy className="w-32 h-32 text-yellow-500 mb-8 animate-bounce" />
          <h2 className="text-4xl md:text-7xl font-black text-white text-center">
            VITTORIA! <br/>
            <span className={clsx(teamAWon ? "text-red-500" : "text-blue-500")}>
              {teamAWon 
                ? `${match.teamA.player1.name} & ${match.teamA.player2.name}` 
                : `${match.teamB.player1.name} & ${match.teamB.player2.name}`}
            </span>
          </h2>
          <Link href={backLink} className="mt-8 px-8 py-4 bg-white text-black rounded-full font-black text-xl hover:scale-105 transition-transform">
            {backText}
          </Link>
        </div>
      )}

      <div className="flex-1 grid md:grid-cols-2 gap-8 md:gap-12 min-h-[500px]">
        {/* Squadra Rossa */}
        <div className={clsx(
          "relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-500 border-4",
          teamAWon ? "bg-red-900 border-red-500" : "bg-slate-800/50 border-slate-700 hover:border-red-900",
          isFinished && !teamAWon && "opacity-50"
        )}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-red-500 mb-2">SQUADRA ROSSA</h2>
            <p className="text-xl text-slate-300 font-medium">
              {match.teamA.player1.name} <span className="text-slate-500 mx-2">•</span> {match.teamA.player2.name}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[12rem] leading-none font-black text-white tabular-nums">
              {match.scoreTeamA}
            </span>
            <span className="text-2xl text-slate-400 font-bold uppercase tracking-widest mt-4">Set Vinti</span>
          </div>

          {!isFinished && (
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => handleScore("A", "remove")}
                disabled={isPending || match.scoreTeamA === 0}
                className="w-20 h-20 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-black text-4xl disabled:opacity-50 flex items-center justify-center"
              >
                -
              </button>
              <button 
                onClick={() => handleScore("A", "add")}
                disabled={isPending}
                className="flex-1 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-3xl md:text-4xl shadow-xl shadow-red-900/50 active:scale-95 transition-transform disabled:opacity-50"
              >
                + SET ROSSO
              </button>
            </div>
          )}
        </div>

        {/* Squadra Blu */}
        <div className={clsx(
          "relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-500 border-4",
          teamBWon ? "bg-blue-900 border-blue-500" : "bg-slate-800/50 border-slate-700 hover:border-blue-900",
          isFinished && !teamBWon && "opacity-50"
        )}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-blue-500 mb-2">SQUADRA BLU</h2>
            <p className="text-xl text-slate-300 font-medium">
              {match.teamB.player1.name} <span className="text-slate-500 mx-2">•</span> {match.teamB.player2.name}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-[12rem] leading-none font-black text-white tabular-nums">
              {match.scoreTeamB}
            </span>
            <span className="text-2xl text-slate-400 font-bold uppercase tracking-widest mt-4">Set Vinti</span>
          </div>

          {!isFinished && (
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => handleScore("B", "remove")}
                disabled={isPending || match.scoreTeamB === 0}
                className="w-20 h-20 rounded-full bg-slate-700 hover:bg-slate-600 text-white font-black text-4xl disabled:opacity-50 flex items-center justify-center"
              >
                -
              </button>
              <button 
                onClick={() => handleScore("B", "add")}
                disabled={isPending}
                className="flex-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-3xl md:text-4xl shadow-xl shadow-blue-900/50 active:scale-95 transition-transform disabled:opacity-50"
              >
                + SET BLU
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
