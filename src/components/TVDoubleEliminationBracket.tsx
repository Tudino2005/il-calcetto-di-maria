"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { formatSetScores } from "@/lib/scoreUtils";
import { getFeederMatchInfo } from "@/lib/tournamentLogic";
import { useMatchSpotlight } from "@/hooks/useMatchSpotlight";
import { SpotlightPopup } from "./SpotlightPopup";
import clsx from "clsx";

export function TVDoubleEliminationBracket({
  tournament,
  matchProbs,
}: {
  tournament: any;
  matchProbs: Map<string, any>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const bracket = tournament.bracketData ? JSON.parse(tournament.bracketData) : {};
  const wbRounds: string[][] = bracket.wbRounds || [];
  const lbRounds: string[][] = bracket.lbRounds || [];
  const gfMatches: string[] = bracket.gfMatches || [];

  const getMatch = (id: string) => tournament.matches?.find((m: any) => m.id === id);

  // Flatten all match IDs → resolve to actual match objects for spotlight
  const allMatchObjects = useMemo(() => {
    const ids = [...wbRounds.flat(), ...lbRounds.flat(), ...gfMatches];
    return ids.map((id) => getMatch(id)).filter(Boolean);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wbRounds, lbRounds, gfMatches, tournament.matches]);

  const { activeMatch, isFading } = useMatchSpotlight(allMatchObjects);

  // Dynamic scale to fit the full bracket in the available screen space
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const parent = container.parentElement;
      if (!parent) return;
      const scaleX = parent.clientWidth / container.scrollWidth;
      const scaleY = parent.clientHeight / container.scrollHeight;
      const minScale = Math.min(scaleX, scaleY, 1);
      setScale(minScale * 0.92);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    const t = setTimeout(handleResize, 120);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(t);
    };
  }, [wbRounds, lbRounds, gfMatches]);

  // Adaptive font/card size based on match count
  const wbMatchCount = wbRounds[0]?.length ?? 0;
  const isLarge = wbMatchCount > 8; // 32+ squadre
  const cardW = isLarge ? "w-36" : "w-52";
  const textSize = isLarge ? "text-[9px]" : "text-xs";

  const renderMatchNode = (id: string) => {
    const m = getMatch(id);
    const isActive = activeMatch?.id === id;

    if (!m) {
      return (
        <div className={clsx(cardW, "h-16 flex flex-col rounded-xl border-2 border-slate-800/40 bg-slate-900/30 p-2 opacity-40 justify-center")}>
          <span className={clsx("text-slate-600 font-bold text-center", textSize)}>IN ATTESA</span>
        </div>
      );
    }

    const isFinished = !!m.winnerTeamId;
    const isSpotlit = isActive && isFading;

    return (
      <div
        className={clsx(
          cardW,
          "flex flex-col rounded-xl border-2 p-2 transition-all duration-700",
          isFinished
            ? "bg-slate-800/60 border-slate-700/60 opacity-70"
            : isSpotlit
            ? "bg-slate-900 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.7)] scale-105"
            : "bg-slate-900 border-purple-500/80 shadow-md"
        )}
      >
        <div className="flex flex-col gap-1 h-full justify-center">
          {/* Team A */}
          <div
            className={clsx(
              "flex justify-between items-center px-1.5 py-1 rounded-lg",
              m.winnerTeamId === m.teamA?.id
                ? "bg-emerald-500/25 text-emerald-400 font-bold"
                : "bg-slate-900/40 text-slate-300"
            )}
          >
            <span className={clsx("truncate", textSize)} title={!m.teamA ? getFeederMatchInfo(tournament, m.id, "A") : ""}>
              {m.teamA
                ? `${m.teamA.player1.name} & ${m.teamA.player2.name}`
                : getFeederMatchInfo(tournament, m.id, "A")}
            </span>
            <span className="font-black ml-1 text-sm">{m.scoreTeamA ?? ""}</span>
          </div>
          {/* Team B */}
          <div
            className={clsx(
              "flex justify-between items-center px-1.5 py-1 rounded-lg",
              m.winnerTeamId === m.teamB?.id
                ? "bg-emerald-500/25 text-emerald-400 font-bold"
                : "bg-slate-900/40 text-slate-300"
            )}
          >
            <span className={clsx("truncate", textSize)} title={!m.teamB ? getFeederMatchInfo(tournament, m.id, "B") : ""}>
              {m.teamB
                ? `${m.teamB.player1.name} & ${m.teamB.player2.name}`
                : getFeederMatchInfo(tournament, m.id, "B")}
            </span>
            <span className="font-black ml-1 text-sm">{m.scoreTeamB ?? ""}</span>
          </div>
          {/* Set scores */}
          {m.setScores && formatSetScores(m.setScores) && (
            <div className="text-[8px] font-black text-emerald-400 bg-slate-950/80 px-1 py-0.5 rounded text-center border border-slate-800 tracking-wider mt-0.5">
              {formatSetScores(m.setScores)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRound = (round: string[], label: string, rIndex: number) => {
    const rowHeight = isLarge ? 72 : 96;
    return (
      <div
        key={label + rIndex}
        className="flex flex-col justify-around"
        style={{ height: `${round.length * rowHeight}px`, minWidth: isLarge ? "9.5rem" : "14rem" }}
      >
        <div className="text-center text-slate-500 font-bold mb-1 uppercase tracking-widest text-[9px]">
          {label} {rIndex + 1}
        </div>
        {round.map((matchId, mIndex) => (
          <div key={`${label}-m-${mIndex}`} className="my-auto">
            {renderMatchNode(matchId)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* SCALED BRACKET */}
      <div
        ref={containerRef}
        className="flex flex-col gap-6 transition-transform duration-500 ease-out origin-center"
        style={{ transform: `scale(${scale})` }}
      >
        {/* WINNERS BRACKET */}
        {wbRounds.length > 0 && (
          <div className="bg-purple-900/10 p-4 rounded-2xl border border-purple-800/30">
            <h2 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-3">
              ⚔ Winners Bracket
            </h2>
            <div className="flex gap-5 items-center">
              {wbRounds.map((round, rIdx) => renderRound(round, "WB Round", rIdx))}
            </div>
          </div>
        )}

        {/* LOSERS BRACKET + GRAND FINAL */}
        <div className="flex gap-5 items-start">
          {/* LOSERS */}
          {lbRounds.length > 0 && (
            <div className="bg-orange-900/10 p-4 rounded-2xl border border-orange-800/30 flex-1">
              <h2 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-3">
                🔥 Losers Bracket
              </h2>
              <div className="flex gap-5 items-center">
                {lbRounds.map((round, rIdx) => renderRound(round, "LB Round", rIdx))}
              </div>
            </div>
          )}

          {/* GRAND FINAL */}
          {gfMatches.length > 0 && (
            <div className="bg-yellow-900/10 p-4 rounded-2xl border border-yellow-700/40">
              <h2 className="text-sm font-black text-yellow-400 uppercase tracking-widest mb-3">
                🏆 Grand Final
              </h2>
              <div className="flex gap-5 items-center h-full">
                {gfMatches.map((matchId, mIndex) => (
                  <div key={`gf-m-${mIndex}`} className="flex flex-col" style={{ minWidth: isLarge ? "9.5rem" : "14rem" }}>
                    <div className="text-center text-slate-500 font-bold mb-1 uppercase tracking-widest text-[9px]">
                      {mIndex === 0 ? "Grand Final" : "Spareggio"}
                    </div>
                    {renderMatchNode(matchId)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PLACEHOLDER: Losers bracket pending */}
        {lbRounds.length === 0 && (
          <div className="bg-orange-900/10 p-4 rounded-2xl border border-orange-800/30">
            <h2 className="text-sm font-black text-orange-400 uppercase tracking-widest mb-2">
              🔥 Losers Bracket
            </h2>
            <p className="text-slate-500 italic text-xs">In attesa dei primi risultati...</p>
          </div>
        )}
      </div>

      {/* SPOTLIGHT POPUP — floats above everything */}
      <SpotlightPopup
        activeMatch={activeMatch}
        isFading={isFading}
        tournament={tournament}
        matchProbs={matchProbs ?? new Map()}
      />
    </div>
  );
}
