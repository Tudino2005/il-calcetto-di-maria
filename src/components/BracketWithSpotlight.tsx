import React, { useState, useEffect } from 'react';
import { InwardBracket } from './InwardBracket';
import { formatSetScores } from '@/lib/scoreUtils';

export function BracketWithSpotlight({ rounds, tournament, matchProbs }: { rounds: any[][], tournament: any, matchProbs: any }) {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const toAnimate = rounds.flat().filter(m => m && !m.winnerTeamId);
    if (toAnimate.length === 0) return;

    let idx = 0;
    let isMounted = true;
    let interval: any;
    
    const startDelay = setTimeout(() => {
      if (!isMounted) return;
      setActiveMatch(toAnimate[idx]);
      setTimeout(() => setIsFading(true), 50);
      
      interval = setInterval(() => {
        setIsFading(false);
        setTimeout(() => {
          if (!isMounted) return;
          idx++;
          if (idx >= toAnimate.length) {
            setActiveMatch(null);
            clearInterval(interval);
            return;
          }
          setActiveMatch(toAnimate[idx]);
          setTimeout(() => setIsFading(true), 50);
        }, 1200); 
      }, 5000); 
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(startDelay);
      clearInterval(interval);
    };
  }, [rounds]);

  return (
    <div className="relative w-full h-full">
      <InwardBracket rounds={rounds} tournament={tournament} matchProbs={matchProbs} activeMatch={activeMatch} isFading={isFading} />
      
      {/* SPOTLIGHT POPUP */}
      {activeMatch && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ease-in-out ${isFading ? 'opacity-100' : 'opacity-0'}`}>
          {/* We don't use bg-black here so the bracket is visible behind it! */}
          <div className={`transform transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isFading ? 'scale-[1.2]' : 'scale-50 opacity-0'} w-full max-w-[800px]`}>
            <div className="p-8 rounded-3xl border-4 flex flex-col justify-center items-center gap-4 relative shadow-[0_0_80px_rgba(236,72,153,0.8)] bg-slate-900 border-pink-500">
                <div className="flex justify-between items-start w-full">
                  {/* TEAM A */}
                  <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
                    {activeMatch.teamAId && tournament.teamNames && tournament.teamNames[activeMatch.teamAId] && (
                      <span className="text-sm text-purple-400 font-black uppercase tracking-widest mb-4 text-center">
                        "{tournament.teamNames[activeMatch.teamAId]}"
                      </span>
                    )}
                    {activeMatch.teamA ? (
                      <div className="flex items-start justify-center gap-4 w-full">
                        {[activeMatch.teamA.player1, activeMatch.teamA.player2].map((player, i) => (
                           player && (
                             <div key={i} className="flex flex-col items-center gap-3 flex-1">
                               {player.avatarUrl ? (
                                 <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-24 h-24 shrink-0 aspect-square rounded-full object-cover border-4 border-slate-500 shadow-xl" />
                               ) : (
                                 <div className="w-24 h-24 shrink-0 aspect-square bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-xl">
                                   <span className="text-3xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                                 </div>
                               )}
                               <span className="text-xl font-bold leading-tight text-white text-center break-words w-full">
                                 {player.name}
                               </span>
                             </div>
                           )
                        ))}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-slate-500 mt-8">IN ATTESA</span>
                    )}
                  </div>

                  {/* VS BADGE */}
                  <div className="shrink-0 flex flex-col items-center justify-center self-center mx-4 gap-4 mt-2">
                    {matchProbs.has(activeMatch.id) && (
                      <div className="flex flex-col items-center justify-center text-yellow-500/90">
                        <span className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-80">Win</span>
                        <span className="text-xl font-black leading-none">{matchProbs.get(activeMatch.id).teamAProb.toFixed(0)}%</span>
                      </div>
                    )}
                    
                    <div className="bg-slate-950 px-6 py-4 rounded-2xl text-4xl font-black text-white shadow-inner flex flex-col items-center border border-slate-800">
                      <span>VS</span>
                    </div>

                    {matchProbs.has(activeMatch.id) && (
                      <div className="flex flex-col items-center justify-center text-yellow-500/90">
                        <span className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-80">Win</span>
                        <span className="text-xl font-black leading-none">{matchProbs.get(activeMatch.id).teamBProb.toFixed(0)}%</span>
                      </div>
                    )}
                  </div>

                  {/* TEAM B */}
                  <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
                    {activeMatch.teamBId && tournament.teamNames && tournament.teamNames[activeMatch.teamBId] && (
                      <span className="text-sm text-purple-400 font-black uppercase tracking-widest mb-4 text-center">
                        "{tournament.teamNames[activeMatch.teamBId]}"
                      </span>
                    )}
                    {activeMatch.teamB ? (
                      <div className="flex items-start justify-center gap-4 w-full">
                        {[activeMatch.teamB.player1, activeMatch.teamB.player2].map((player, i) => (
                           player && (
                             <div key={i} className="flex flex-col items-center gap-3 flex-1">
                               {player.avatarUrl ? (
                                 <img src={`/players/${player.avatarUrl}`} alt={player.name} className="w-24 h-24 shrink-0 aspect-square rounded-full object-cover border-4 border-slate-500 shadow-xl" />
                               ) : (
                                 <div className="w-24 h-24 shrink-0 aspect-square bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-xl">
                                   <span className="text-3xl font-black text-slate-500 uppercase">{player.name.substring(0,2)}</span>
                                 </div>
                               )}
                               <span className="text-xl font-bold leading-tight text-white text-center break-words w-full">
                                 {player.name}
                               </span>
                             </div>
                           )
                        ))}
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-slate-500 mt-8">IN ATTESA</span>
                    )}
                  </div>
                </div>

                {(() => {
                   const dateToUse = activeMatch.scheduledAt || tournament.startDate;
                   if (!dateToUse) return null;
                   return (
                     <div className="mt-4 text-sm font-black text-blue-400 bg-blue-500/20 px-6 py-2 rounded-xl">
                        {new Date(dateToUse).toLocaleDateString('it-IT')} {activeMatch.scheduledAt ? `alle ${new Date(dateToUse).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}` : ''}
                     </div>
                   );
                })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
