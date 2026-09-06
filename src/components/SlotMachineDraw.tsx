"use client";
import { useState, useEffect } from "react";
import { Trophy, Dices, Users, Sparkles } from "lucide-react";
import { finishDrawAnimation } from "@/app/actions/tournamentActions";
import { useRouter } from "next/navigation";
import RoleIcon from "./RoleIcon";

export default function SlotMachineDraw({ tournament }: { tournament: any }) {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [currentSlot1, setCurrentSlot1] = useState<any>(null);
  const [currentSlot2, setCurrentSlot2] = useState<any>(null);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    if (teams.length > 0) return; // ONLY INIT ONCE, ignore router.refresh() updates
    const extracted = new Map();
    const playersMap = new Map();
    tournament.matches?.forEach((m: any) => {
       if (m.teamA) {
         extracted.set(m.teamA.id, m.teamA);
         playersMap.set(m.teamA.player1.id, m.teamA.player1);
         playersMap.set(m.teamA.player2.id, m.teamA.player2);
       }
       if (m.teamB) {
         extracted.set(m.teamB.id, m.teamB);
         playersMap.set(m.teamB.player1.id, m.teamB.player1);
         playersMap.set(m.teamB.player2.id, m.teamB.player2);
       }
    });
    const uniqueTeams = Array.from(extracted.values());
    uniqueTeams.sort(() => Math.random() - 0.5);
    setTeams(uniqueTeams);
    setAllPlayers(Array.from(playersMap.values()));
  }, [tournament, teams.length]);

  useEffect(() => {
    if (teams.length === 0 || allPlayers.length === 0) return;
    
    if (revealedIndex < teams.length) {
      setSpinning(true);
      setShowConfetti(false);
      
      const spinDuration = 5000; // 3.5 seconds
      const interval = setInterval(() => {
         setCurrentSlot1(allPlayers[Math.floor(Math.random() * allPlayers.length)]);
         setCurrentSlot2(allPlayers[Math.floor(Math.random() * allPlayers.length)]);
      }, 150); 
      
      const timeout = setTimeout(() => {
         clearInterval(interval);
         setSpinning(false);
         const targetTeam = teams[revealedIndex];
         if (targetTeam) {
            setCurrentSlot1(targetTeam.player1);
            setCurrentSlot2(targetTeam.player2);
            setShowConfetti(true);
         }
         
         // Wait 2 seconds before moving to next pair
         setTimeout(() => {
            setRevealedIndex(prev => prev + 1);
         }, 2000);

      }, spinDuration);
      
      return () => { clearInterval(interval); clearTimeout(timeout); };
    } else {
      const finalTimeout = setTimeout(async () => {
         await finishDrawAnimation(tournament.id);
         router.refresh(); // Tells NextJS to reload the page data, updating TVSlideshow
      }, 60000);
      return () => clearTimeout(finalTimeout);
    }
  }, [revealedIndex, teams.length, allPlayers.length]);
  
  if (teams.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center p-8 bg-gradient-to-b from-slate-950 to-indigo-950 overflow-hidden relative">
      
      <div className="absolute top-10 flex flex-col items-center animate-fade-in-down z-20">
        <div className="inline-flex items-center gap-3 px-8 py-3 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse">
          <Dices className="w-6 h-6" /> Cerimonia Sorteggio in Diretta
        </div>
        <h2 className="text-6xl font-black uppercase tracking-tight text-white mb-2 drop-shadow-2xl">
          {tournament.name}
        </h2>
      </div>

      {revealedIndex >= teams.length ? (
        <div className="flex flex-col items-center justify-center animate-bounce-in z-20 mt-32">
           <Trophy className="w-40 h-40 text-yellow-500 mb-8 drop-shadow-[0_0_50px_rgba(234,179,8,0.6)]" />
           <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600 uppercase tracking-widest mb-4">
             Tabellone Pronto!
           </h1>
           <p className="text-2xl text-slate-300">Preparazione delle sfide in corso...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-12 z-20 w-full max-w-5xl">
           <div className="text-slate-400 font-bold uppercase tracking-widest mb-6 text-xl">
              Estrazione Coppia {revealedIndex + 1} di {teams.length}
           </div>
           
           <div className="flex items-center gap-8 justify-center w-full">
              {/* SLOT 1 */}
              <div className={`flex-1 bg-slate-900 border-4 rounded-[3rem] h-80 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${!spinning && showConfetti ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)] scale-105' : 'border-slate-700 shadow-2xl'}`}>
                 <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 
                 <div className={`flex flex-col items-center gap-4 ${spinning ? 'animate-slot-spin blur-[2px]' : 'animate-bounce-in'}`}>
                    <RoleIcon role={currentSlot1?.preferredRole || "entrambi"} className={`w-16 h-16 ${!spinning && showConfetti ? 'text-yellow-400' : 'text-slate-500'}`} />
                    <h3 className={`text-5xl font-black uppercase tracking-tight truncate w-full px-8 ${!spinning && showConfetti ? 'text-white' : 'text-slate-400'}`}>
                      {currentSlot1?.name || "???"}
                    </h3>
                 </div>
              </div>

              <div className="shrink-0 text-5xl font-black text-slate-600">&</div>

              {/* SLOT 2 */}
              <div className={`flex-1 bg-slate-900 border-4 rounded-[3rem] h-80 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${!spinning && showConfetti ? 'border-emerald-400 shadow-[0_0_50px_rgba(52,211,153,0.5)] scale-105' : 'border-slate-700 shadow-2xl'}`}>
                 <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none"></div>
                 
                 <div className={`flex flex-col items-center gap-4 ${spinning ? 'animate-slot-spin blur-[2px]' : 'animate-bounce-in'}`}>
                    <RoleIcon role={currentSlot2?.preferredRole || "entrambi"} className={`w-16 h-16 ${!spinning && showConfetti ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <h3 className={`text-5xl font-black uppercase tracking-tight truncate w-full px-8 ${!spinning && showConfetti ? 'text-white' : 'text-slate-400'}`}>
                      {currentSlot2?.name || "???"}
                    </h3>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Lista delle squadre già estratte (in basso) */}
      <div className="absolute bottom-0 w-full bg-slate-950/80 border-t border-slate-800 backdrop-blur-md p-6 flex flex-col items-center z-20 max-h-48 overflow-y-auto">
         <div className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-4">Coppie Formate</div>
         <div className="flex flex-wrap gap-4 justify-center w-full max-w-7xl overflow-hidden">
            {teams.slice(0, revealedIndex).map((t, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in-up">
                 <span className="text-white font-bold">{t.player1.name}</span>
                 <span className="text-slate-500 text-xs">&</span>
                 <span className="text-white font-bold">{t.player2.name}</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
