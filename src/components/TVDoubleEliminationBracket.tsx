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

  // ─── Parse bracketData ONCE (stable refs) ──────────────────────────────────
  const { wbRounds, lbRounds, gfMatches } = useMemo(() => {
    try {
      const b = tournament.bracketData ? JSON.parse(tournament.bracketData) : {};
      return {
        wbRounds: (b.wbRounds ?? []) as string[][],
        lbRounds: (b.lbRounds ?? []) as string[][],
        gfMatches: (b.gfMatches ?? []) as string[],
      };
    } catch {
      return { wbRounds: [] as string[][], lbRounds: [] as string[][], gfMatches: [] as string[] };
    }
  }, [tournament.bracketData]);

  // ─── Match lookup ─────────────────────────────────────────────────────────
  const matchMap = useMemo(() => {
    const map = new Map<string, any>();
    (tournament.matches ?? []).forEach((m: any) => map.set(m.id, m));
    return map;
  }, [tournament.matches]);

  const getMatch = (id: string) => matchMap.get(id);

  // ─── Spotlight ────────────────────────────────────────────────────────────
  // Flatten all match IDs → resolve to actual match objects for spotlight
  const allMatchObjects = useMemo(() => {
    const ids = [...wbRounds.flat(), ...lbRounds.flat(), ...gfMatches];
    return ids.map((id) => matchMap.get(id)).filter(Boolean);
  }, [wbRounds, lbRounds, gfMatches, matchMap]);

  const { activeMatch, isFading } = useMatchSpotlight(allMatchObjects);

  // ─── Dynamic scale ────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      const parent = container.parentElement;
      if (!parent) return;
      const scaleX = parent.clientWidth / container.scrollWidth;
      const scaleY = parent.clientHeight / container.scrollHeight;
      setScale(Math.min(scaleX, scaleY, 1) * 0.92);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    const tid = setTimeout(handleResize, 150);
    return () => { window.removeEventListener("resize", handleResize); clearTimeout(tid); };
  }, [wbRounds, lbRounds, gfMatches]);

  // ─── Adaptive sizing based on bracket size ────────────────────────────────
  const wbR1Count = wbRounds[0]?.length ?? 0;
  const isLarge = wbR1Count > 8;
  const cardW = isLarge ? "w-36" : "w-52";
  const textSize = isLarge ? "text-[9px]" : "text-xs";
  const rowH = isLarge ? 72 : 100;
  const colW = isLarge ? "9.5rem" : "14rem";

  // ─── Match card renderer ──────────────────────────────────────────────────
  const renderMatchNode = (id: string) => {
    const m = getMatch(id);
    const isSpotlit = activeMatch?.id === id && isFading;

    if (!m) {
      return (
        <div className={clsx(cardW, "h-16 flex flex-col rounded-xl border-2 border-slate-800/40 bg-slate-900/30 p-2 opacity-40 justify-center")}>
          <span className={clsx("text-slate-600 font-bold text-center", textSize)}>IN ATTESA</span>
        </div>
      );
    }

    const isFinished = !!m.winnerTeamId;

    return (
      <div
        className={clsx(
          cardW,
          "flex flex-col rounded-xl border-2 p-2 transition-all duration-700",
          isFinished
            ? "bg-slate-800/60 border-slate-700/60 opacity-60"
            : isSpotlit
            ? "bg-slate-900 border-pink-500 shadow-[0_0_24px_rgba(236,72,153,0.8)] scale-105 z-10 relative"
            : "bg-slate-900 border-purple-500/70 shadow-sm"
        )}
      >
        <div className="flex flex-col gap-1 h-full justify-center">
          {/* Team A */}
          <div className={clsx(
            "flex justify-between items-center px-1.5 py-1 rounded-lg",
            m.winnerTeamId === m.teamA?.id ? "bg-emerald-500/25 text-emerald-400 font-bold" : "bg-slate-900/40 text-slate-300"
          )}>
            <span className={clsx("truncate", textSize)} title={!m.teamA ? getFeederMatchInfo(tournament, m.id, "A") : ""}>
              {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : getFeederMatchInfo(tournament, m.id, "A")}
            </span>
            <span className="font-black ml-1 text-sm">{m.scoreTeamA ?? ""}</span>
          </div>
          {/* Team B */}
          <div className={clsx(
            "flex justify-between items-center px-1.5 py-1 rounded-lg",
            m.winnerTeamId === m.teamB?.id ? "bg-emerald-500/25 text-emerald-400 font-bold" : "bg-slate-900/40 text-slate-300"
          )}>
            <span className={clsx("truncate", textSize)} title={!m.teamB ? getFeederMatchInfo(tournament, m.id, "B") : ""}>
              {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : getFeederMatchInfo(tournament, m.id, "B")}
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

  // ─── Round column renderer ────────────────────────────────────────────────
  const renderRound = (round: string[], label: string, rIdx: number) => (
    <div
      key={`${label}-${rIdx}`}
      className="flex flex-col justify-around flex-shrink-0"
      style={{ height: `${round.length * rowH}px`, minWidth: colW }}
    >
      <div className="text-center text-slate-500 font-bold mb-1 uppercase tracking-widest text-[9px]">
        {label} {rIdx + 1}
      </div>
      {round.filter((matchId) => matchId != null).map((matchId, mIdx) => (
        <div key={`${label}-m-${mIdx}`} className="my-auto">
          {renderMatchNode(matchId)}
        </div>
      ))}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* SCALED BRACKET */}
      <div
        ref={containerRef}
        className="flex flex-col gap-6 origin-center"
        style={{ transform: `scale(${scale})`, transition: "transform 0.5s ease-out" }}
      >
        {/* WINNERS BRACKET */}
        {wbRounds.length > 0 && (
          <div className="bg-purple-900/10 p-4 rounded-2xl border border-purple-700/40">
            <h2 className="text-base font-black text-purple-400 uppercase tracking-widest mb-3">
              ⚔️ Winners Bracket
            </h2>
            <div className="flex gap-5 items-start overflow-x-auto">
              {wbRounds.filter((r: any) => Array.isArray(r)).map((round, rIdx) => renderRound(round, "WB R", rIdx))}
            </div>
          </div>
        )}

        {/* LOSERS BRACKET + GRAND FINAL */}
        <div className="flex gap-5 items-start">
          {/* LOSERS */}
          {lbRounds.length > 0 ? (
            <div className="bg-orange-900/10 p-4 rounded-2xl border border-orange-700/40 flex-1">
              <h2 className="text-base font-black text-orange-400 uppercase tracking-widest mb-3">
                🔥 Losers Bracket
              </h2>
              <div className="flex gap-5 items-start overflow-x-auto">
                {lbRounds.filter((r: any) => Array.isArray(r)).map((round, rIdx) => renderRound(round, "LB R", rIdx))}
              </div>
            </div>
          ) : (
            <div className="bg-orange-900/10 p-4 rounded-2xl border border-orange-700/40 flex-1">
              <h2 className="text-base font-black text-orange-400 uppercase tracking-widest mb-2">
                🔥 Losers Bracket
              </h2>
              <p className="text-slate-500 italic text-xs">In attesa dei primi risultati...</p>
            </div>
          )}

          {/* GRAND FINAL */}
          {gfMatches.length > 0 && (
            <div className="bg-yellow-900/10 p-4 rounded-2xl border border-yellow-600/40">
              <h2 className="text-base font-black text-yellow-400 uppercase tracking-widest mb-3">
                🏆 Grand Final
              </h2>
              <div className="flex gap-5 items-center">
                {gfMatches.map((matchId, mIdx) => (
                  <div key={`gf-${mIdx}`} className="flex flex-col flex-shrink-0" style={{ minWidth: colW }}>
                    <div className="text-center text-slate-500 font-bold mb-1 uppercase tracking-widest text-[9px]">
                      {mIdx === 0 ? "Grand Final" : "Spareggio"}
                    </div>
                    {renderMatchNode(matchId)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
