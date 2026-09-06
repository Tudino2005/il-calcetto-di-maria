import re

with open("src/components/TournamentDrawCeremony.tsx", "r") as f:
    content = f.read()

# I will rewrite the entire TournamentDrawCeremony component
new_content = """"use client";

import { useRouter } from "next/navigation";
import { MonitorPlay, FastForward } from "lucide-react";
import { finishDrawAnimation } from "@/app/actions/tournamentActions";

type MatchInfo = { teamA: any | null; teamB: any | null };

export default function TournamentDrawCeremony({ 
  tournamentId, 
  matches 
}: { 
  tournamentId: string, 
  matches: MatchInfo[] 
}) {
  const router = useRouter();

  const handleSkip = async () => {
    await finishDrawAnimation(tournamentId);
    router.push(`/tournaments/${tournamentId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 max-w-3xl mx-auto text-center px-4">
      
      <div className="bg-slate-900 border-2 border-indigo-500/50 p-12 rounded-[3rem] shadow-[0_0_50px_rgba(99,102,241,0.2)] flex flex-col items-center relative overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse"></div>
        
        <MonitorPlay className="w-32 h-32 text-indigo-400 mb-8 animate-pulse" />
        
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
          Guardate la TV!
        </h2>
        
        <p className="text-xl text-slate-300 font-medium mb-10 max-w-lg">
          La Cerimonia di Sorteggio in perfetto stile Slot Machine è partita in automatico sul maxischermo.
        </p>

        <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-sm bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-500/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
          Estrazione in corso...
        </div>
      </div>

      <button 
        onClick={handleSkip}
        className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all hover:scale-105 group"
      >
        <FastForward className="w-5 h-5 group-hover:text-white" />
        Forza Fine / Salta Animazione
      </button>

    </div>
  );
}
"""

with open("src/components/TournamentDrawCeremony.tsx", "w") as f:
    f.write(new_content)
