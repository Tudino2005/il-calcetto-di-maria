import React from 'react';

interface SpotlightPopupProps {
  activeMatch: any;
  isFading: boolean;
  tournament: any;
  matchProbs: Map<string, any>;
}

/**
 * The pink glowing popup card shown during the spotlight animation.
 * Extracted as a shared component usable by both bracket types.
 */
export function SpotlightPopup({ activeMatch, isFading, tournament, matchProbs }: SpotlightPopupProps) {
  if (!activeMatch) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ease-in-out ${
        isFading ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`transform transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isFading ? "scale-[1.2]" : "scale-50 opacity-0"
        } w-full max-w-[800px]`}
      >
        <div className="p-8 rounded-3xl border-4 flex flex-col justify-center items-center gap-4 relative shadow-[0_0_80px_rgba(236,72,153,0.8)] bg-slate-900 border-pink-500">
          <div className="flex justify-between items-start w-full">
            {/* TEAM A */}
            <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
              {activeMatch.teamAId && tournament.teamNames?.[activeMatch.teamAId] && (
                <span className="text-sm text-purple-400 font-black uppercase tracking-widest mb-4 text-center">
                  &ldquo;{tournament.teamNames[activeMatch.teamAId]}&rdquo;
                </span>
              )}
              {activeMatch.teamA ? (
                <div className="flex items-start justify-center gap-4 w-full">
                  {[activeMatch.teamA.player1, activeMatch.teamA.player2].map((player: any, i: number) =>
                    player ? (
                      <div key={i} className="flex flex-col items-center gap-3 flex-1">
                        {player.avatarUrl ? (
                          <img
                            src={`/players/${player.avatarUrl}`}
                            alt={player.name}
                            className="w-24 h-24 shrink-0 aspect-square rounded-full object-cover border-4 border-slate-500 shadow-xl"
                          />
                        ) : (
                          <div className="w-24 h-24 shrink-0 aspect-square bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-xl">
                            <span className="text-3xl font-black text-slate-500 uppercase">
                              {player.name.substring(0, 2)}
                            </span>
                          </div>
                        )}
                        <span className="text-xl font-bold leading-tight text-white text-center break-words w-full">
                          {player.name}
                        </span>
                      </div>
                    ) : null
                  )}
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
                  <span className="text-xl font-black leading-none">
                    {matchProbs.get(activeMatch.id).teamAProb.toFixed(0)}%
                  </span>
                </div>
              )}
              <div className="bg-slate-950 px-6 py-4 rounded-2xl text-4xl font-black text-white shadow-inner flex flex-col items-center border border-slate-800">
                <span>VS</span>
              </div>
              {matchProbs.has(activeMatch.id) && (
                <div className="flex flex-col items-center justify-center text-yellow-500/90">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1 opacity-80">Win</span>
                  <span className="text-xl font-black leading-none">
                    {matchProbs.get(activeMatch.id).teamBProb.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>

            {/* TEAM B */}
            <div className="flex-1 flex flex-col min-w-0 px-2 items-center">
              {activeMatch.teamBId && tournament.teamNames?.[activeMatch.teamBId] && (
                <span className="text-sm text-purple-400 font-black uppercase tracking-widest mb-4 text-center">
                  &ldquo;{tournament.teamNames[activeMatch.teamBId]}&rdquo;
                </span>
              )}
              {activeMatch.teamB ? (
                <div className="flex items-start justify-center gap-4 w-full">
                  {[activeMatch.teamB.player1, activeMatch.teamB.player2].map((player: any, i: number) =>
                    player ? (
                      <div key={i} className="flex flex-col items-center gap-3 flex-1">
                        {player.avatarUrl ? (
                          <img
                            src={`/players/${player.avatarUrl}`}
                            alt={player.name}
                            className="w-24 h-24 shrink-0 aspect-square rounded-full object-cover border-4 border-slate-500 shadow-xl"
                          />
                        ) : (
                          <div className="w-24 h-24 shrink-0 aspect-square bg-slate-800 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-xl">
                            <span className="text-3xl font-black text-slate-500 uppercase">
                              {player.name.substring(0, 2)}
                            </span>
                          </div>
                        )}
                        <span className="text-xl font-bold leading-tight text-white text-center break-words w-full">
                          {player.name}
                        </span>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <span className="text-xl font-bold text-slate-500 mt-8">IN ATTESA</span>
              )}
            </div>
          </div>

          {/* SCHEDULE DATE */}
          {(() => {
            const dateToUse = activeMatch.scheduledAt || tournament.startDate;
            if (!dateToUse) return null;
            return (
              <div className="mt-4 text-sm font-black text-blue-400 bg-blue-500/20 px-6 py-2 rounded-xl">
                {new Date(dateToUse).toLocaleDateString("it-IT")}{" "}
                {activeMatch.scheduledAt
                  ? `alle ${new Date(dateToUse).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
              </div>
            );
          })()}

          {/* BRACKET TYPE BADGE */}
          {activeMatch.bracketType && (
            <div className={`text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full border ${
              activeMatch.bracketType === "winners"
                ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                : activeMatch.bracketType === "losers"
                ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                : "bg-yellow-500/20 text-yellow-400 border-yellow-500/40"
            }`}>
              {activeMatch.bracketType === "winners"
                ? "Winners Bracket"
                : activeMatch.bracketType === "losers"
                ? "Losers Bracket"
                : "Grand Final"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
