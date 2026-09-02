"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Calendar } from "lucide-react";

export default function DoubleEliminationBracket({ tournament }: { tournament: any }) {
  const bracket = JSON.parse(tournament.bracketData || "{}");
  const wbRounds = bracket.wbRounds || [];
  const lbRounds = bracket.lbRounds || [];
  const gfMatches = bracket.gfMatches || [];

  const getMatch = (id: string) => tournament.matches.find((m: any) => m.id === id);

  const renderMatchNode = (m: any) => {
    if (!m) return (
      <div className="w-64 flex flex-col rounded-xl border-2 border-slate-800 bg-slate-900 p-3 opacity-50">
        <span className="text-slate-500 font-bold text-center">TBD</span>
      </div>
    );
    
    const isFinished = !!m.winnerTeamId;
    return (
      <Link href={`/match/${m.id}`}>
        <div className={clsx(
          "w-64 flex flex-col rounded-xl border-2 p-3 transition-all",
          isFinished ? "bg-slate-800 border-slate-700 opacity-80" : "bg-slate-800 border-purple-500 shadow-lg hover:scale-105"
        )}>
          <div className="flex flex-col gap-1">
            <div className={clsx("flex justify-between items-center p-2 rounded-lg", m.winnerTeamId === m.teamA?.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-slate-900 text-slate-300")}>
              <span className="truncate text-sm">{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>
              <span className="font-black ml-2 text-sm">{m.scoreTeamA}</span>
            </div>
            
            <div className={clsx("flex justify-between items-center p-2 rounded-lg", m.winnerTeamId === m.teamB?.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-slate-900 text-slate-300")}>
              <span className="truncate text-sm">{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>
              <span className="font-black ml-2 text-sm">{m.scoreTeamB}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-12 overflow-x-auto pb-12">
      {/* WINNERS BRACKET */}
      <div>
        <h2 className="text-2xl font-black text-purple-400 uppercase tracking-widest mb-6 sticky left-0">Winners Bracket</h2>
        <div className="flex gap-12 items-center">
          {wbRounds.map((round: string[], rIndex: number) => (
            <div key={`wb-${rIndex}`} className="flex flex-col justify-around min-w-[16rem]" style={{ height: `${wbRounds[0].length * 100}px` }}>
              <div className="text-center text-slate-500 font-bold mb-4 uppercase tracking-widest text-xs">WB Round {rIndex + 1}</div>
              {round.map((matchId: string, mIndex: number) => (
                <div key={`wb-m-${mIndex}`} className="my-auto">
                  {renderMatchNode(getMatch(matchId))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-700" />

      {/* LOSERS BRACKET */}
      <div>
        <h2 className="text-2xl font-black text-orange-400 uppercase tracking-widest mb-6 sticky left-0">Losers Bracket</h2>
        {lbRounds.length === 0 ? (
          <p className="text-slate-500 italic sticky left-0">Il Losers Bracket inizierà a popolarsi dopo il primo turno del Winners Bracket.</p>
        ) : (
          <div className="flex gap-12 items-center">
            {lbRounds.map((round: string[], rIndex: number) => (
              <div key={`lb-${rIndex}`} className="flex flex-col justify-around min-w-[16rem]" style={{ height: `${Math.max(4, lbRounds[0]?.length || 1) * 100}px` }}>
                <div className="text-center text-slate-500 font-bold mb-4 uppercase tracking-widest text-xs">LB Round {rIndex + 1}</div>
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

      {gfMatches.length > 0 && (
        <>
          <hr className="border-slate-700" />
          <div>
            <h2 className="text-2xl font-black text-yellow-400 uppercase tracking-widest mb-6 sticky left-0">Grand Final</h2>
            <div className="flex gap-12 items-center">
              {gfMatches.map((matchId: string, mIndex: number) => (
                <div key={`gf-m-${mIndex}`} className="flex flex-col min-w-[16rem]">
                  <div className="text-center text-slate-500 font-bold mb-4 uppercase tracking-widest text-xs">
                    {mIndex === 0 ? "Grand Final" : "Bracket Reset (Spareggio)"}
                  </div>
                  {renderMatchNode(getMatch(matchId))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
