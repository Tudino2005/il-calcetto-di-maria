"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatSetScores } from "@/lib/scoreUtils";
import { getFeederMatchInfo } from "@/lib/tournamentLogic";
import clsx from "clsx";

export function TVDoubleEliminationBracket({ tournament }: { tournament: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const bracket = tournament.bracketData ? JSON.parse(tournament.bracketData) : {};
  const wbRounds = bracket.wbRounds || [];
  const lbRounds = bracket.lbRounds || [];
  const gfMatches = bracket.gfMatches || [];

  const getMatch = (id: string) => tournament.matches?.find((m: any) => m.id === id);

  // Resize observer to scale the bracket to fit the screen
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const parent = container.parentElement;
        if (parent) {
          const scaleX = parent.clientWidth / container.scrollWidth;
          const scaleY = parent.clientHeight / container.scrollHeight;
          const minScale = Math.min(scaleX, scaleY, 1);
          setScale(minScale * 0.9); // 90% of available space to leave some padding
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    // Timeout to ensure DOM is fully rendered before calculating scale
    setTimeout(handleResize, 100);

    return () => window.removeEventListener("resize", handleResize);
  }, [wbRounds, lbRounds, gfMatches]);

  const renderMatchNode = (m: any) => {
    if (!m) return (
      <div className="w-56 h-20 flex flex-col rounded-xl border-2 border-slate-800/50 bg-slate-900/50 p-2 opacity-50 justify-center">
        <span className="text-slate-500 font-bold text-center text-sm">IN ATTESA</span>
      </div>
    );
    
    const isFinished = !!m.winnerTeamId;
    return (
      <div className={clsx(
        "w-56 flex flex-col rounded-xl border-2 p-2 shadow-xl",
        isFinished ? "bg-slate-800/80 border-slate-700 opacity-80" : "bg-slate-900 border-purple-500"
      )}>
        <div className="flex flex-col gap-1 h-full justify-center">
          <div className={clsx("flex justify-between items-center px-2 py-1 rounded-lg", m.winnerTeamId === m.teamA?.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-slate-900/50 text-slate-300")}>
            <span className="truncate text-xs" title={!m.teamA ? getFeederMatchInfo(tournament, m.id, "A") : ""}>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : getFeederMatchInfo(tournament, m.id, "A")}</span>
            <span className="font-black ml-2 text-sm">{m.scoreTeamA}</span>
          </div>
          
          <div className={clsx("flex justify-between items-center px-2 py-1 rounded-lg", m.winnerTeamId === m.teamB?.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-slate-900/50 text-slate-300")}>
            <span className="truncate text-xs" title={!m.teamB ? getFeederMatchInfo(tournament, m.id, "B") : ""}>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(tournament, m.id, "B")}</span>
            <span className="font-black ml-2 text-sm">{m.scoreTeamB}</span>
          </div>
          {m.setScores && formatSetScores(m.setScores) && (
            <div className="text-[9px] font-black text-emerald-400 bg-slate-950/80 px-1 py-0.5 rounded text-center border border-slate-800 tracking-wider mt-1">
              Set: {formatSetScores(m.setScores)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
      <div 
        ref={containerRef}
        className="flex flex-col gap-8 transition-transform duration-500 ease-out origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        {/* WINNERS BRACKET */}
        {wbRounds.length > 0 && (
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <h2 className="text-xl font-black text-purple-400 uppercase tracking-widest mb-4">Winners Bracket</h2>
            <div className="flex gap-8 items-center">
              {wbRounds.map((round: string[], rIndex: number) => (
                <div key={`wb-${rIndex}`} className="flex flex-col justify-around min-w-[14rem]" style={{ height: `${wbRounds[0].length * 100}px` }}>
                  <div className="text-center text-slate-500 font-bold mb-2 uppercase tracking-widest text-[10px]">WB Round {rIndex + 1}</div>
                  {round.map((matchId: string, mIndex: number) => (
                    <div key={`wb-m-${mIndex}`} className="my-auto">
                      {renderMatchNode(getMatch(matchId))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOSERS BRACKET & GRAND FINAL ROW */}
        <div className="flex gap-8">
          {/* LOSERS BRACKET */}
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex-1">
            <h2 className="text-xl font-black text-orange-400 uppercase tracking-widest mb-4">Losers Bracket</h2>
            {lbRounds.length === 0 ? (
              <p className="text-slate-500 italic text-sm">In attesa...</p>
            ) : (
              <div className="flex gap-8 items-center">
                {lbRounds.map((round: string[], rIndex: number) => (
                  <div key={`lb-${rIndex}`} className="flex flex-col justify-around min-w-[14rem]" style={{ height: `${Math.max(2, lbRounds[0]?.length || 1) * 100}px` }}>
                    <div className="text-center text-slate-500 font-bold mb-2 uppercase tracking-widest text-[10px]">LB Round {rIndex + 1}</div>
                    {round.map((matchId: string, mIndex: number) => (
                      <div key={`lb-m-${mIndex}`} className="my-auto">
                        {renderMatchNode(getMatch(matchId))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GRAND FINAL */}
          {gfMatches.length > 0 && (
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-yellow-500/30">
              <h2 className="text-xl font-black text-yellow-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Grand Final
              </h2>
              <div className="flex gap-8 items-center h-full">
                {gfMatches.map((matchId: string, mIndex: number) => (
                  <div key={`gf-m-${mIndex}`} className="flex flex-col min-w-[14rem] h-full justify-center">
                    <div className="text-center text-slate-500 font-bold mb-2 uppercase tracking-widest text-[10px]">
                      {mIndex === 0 ? "Grand Final" : "Spareggio"}
                    </div>
                    {renderMatchNode(getMatch(matchId))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
