"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Swords } from "lucide-react";

type PlayerInfo = { id: string; name: string };
type TeamInfo = { id: string; player1: PlayerInfo; player2: PlayerInfo };
type MatchInfo = { teamA: TeamInfo | null; teamB: TeamInfo | null };

export default function TournamentDrawCeremony({ 
  tournamentId, 
  matches 
}: { 
  tournamentId: string, 
  matches: MatchInfo[] 
}) {
  const router = useRouter();
  const [teamsToReveal, setTeamsToReveal] = useState<TeamInfo[]>([]);
  const [revealedTeams, setRevealedTeams] = useState<TeamInfo[]>([]);
  const [currentReveal, setCurrentReveal] = useState<TeamInfo | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Extract all unique teams from the first round matches
    const allTeams: TeamInfo[] = [];
    matches.forEach(m => {
      if (m.teamA) allTeams.push(m.teamA);
      if (m.teamB) allTeams.push(m.teamB);
    });
    
    // Deduplicate (just in case)
    const uniqueTeams = Array.from(new Map(allTeams.map(t => [t.id, t])).values());
    
    // Shuffle them to make the reveal order random
    for (let i = uniqueTeams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueTeams[i], uniqueTeams[j]] = [uniqueTeams[j], uniqueTeams[i]];
    }

    setTeamsToReveal(uniqueTeams);
  }, [matches]);

  useEffect(() => {
    if (teamsToReveal.length === 0) return;
    
    // Prevent double execution in StrictMode
    let isCancelled = false;

    const runAnimation = async () => {
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      
      // We iterate over teamsToReveal. 
      // To avoid state mutation issues, we keep local tracking of what is revealed.
      const localRevealed: TeamInfo[] = [];
      
      for (let i = 0; i < teamsToReveal.length; i++) {
        if (isCancelled) return;
        
        const nextTeam = teamsToReveal[i];
        
        // Wait 1 second before revealing the next team
        await delay(1000);
        if (isCancelled) return;
        
        setCurrentReveal(nextTeam);
        
        // Show it large for 3 seconds
        await delay(3000);
        if (isCancelled) return;
        
        localRevealed.push(nextTeam);
        setRevealedTeams([...localRevealed]);
        setCurrentReveal(null);
      }
      
      if (!isCancelled) {
        setIsFinished(true);
      }
    };

    runAnimation();

    return () => {
      isCancelled = true;
    };
  }, [teamsToReveal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      
      {!isFinished ? (
        <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse text-center">
          Estrazione Squadre in corso...
        </h2>
      ) : (
        <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
          <h2 className="text-4xl md:text-6xl font-black text-emerald-400 text-center">
            SORTEGGIO COMPLETATO!
          </h2>
          <button 
            onClick={() => router.push(`/tournaments/${tournamentId}`)}
            className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-black text-xl rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Vai al Tabellone del Torneo
          </button>
        </div>
      )}

      {/* Central Reveal Stage */}
      <div className="h-[200px] w-full max-w-2xl flex items-center justify-center">
        {currentReveal && (
          <div className="w-full bg-slate-800 p-8 rounded-3xl border-4 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.5)] flex flex-col items-center gap-4 animate-in zoom-in slide-in-from-bottom-10 duration-500">
            <span className="text-purple-400 font-bold uppercase tracking-widest text-lg">
              Squadra {revealedTeams.length + 1}
            </span>
            <div className="flex items-center gap-6">
              <span className="text-3xl font-black text-white">{currentReveal.player1.name}</span>
              <Swords className="w-8 h-8 text-slate-500" />
              <span className="text-3xl font-black text-white">{currentReveal.player2.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid of already revealed teams */}
      <div className="w-full max-w-5xl">
        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">
          Squadre Formate ({revealedTeams.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {revealedTeams.map((t, idx) => (
            <div key={t.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-2 animate-in fade-in duration-300">
              <span className="text-xs text-slate-500 font-bold uppercase">Squadra {idx + 1}</span>
              <div className="flex flex-col items-center text-center">
                <span className="text-white font-bold">{t.player1.name}</span>
                <span className="text-emerald-400/50 text-sm font-bold">&</span>
                <span className="text-white font-bold">{t.player2.name}</span>
              </div>
            </div>
          ))}
          
          {/* Placeholders for teams yet to be revealed */}
          {Array.from({ length: Math.max(0, teamsToReveal.length - revealedTeams.length - (currentReveal ? 1 : 0)) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed flex flex-col items-center justify-center min-h-[100px]">
              <span className="text-slate-600 font-black text-2xl">?</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
