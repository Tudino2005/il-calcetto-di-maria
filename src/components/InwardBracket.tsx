import React from 'react';

export function InwardBracket({ rounds, tournament, matchProbs, activeMatch, isFading }: { rounds: any[][], tournament: any, matchProbs: any, activeMatch?: any, isFading?: boolean }) {
  if (!rounds || rounds.length === 0) return null;

  // 1. RECONSTRUCT FULL TREE SHAPE
  // Find out how many matches are in the first round to determine the tree depth.
  // Because rounds might be filtered, we look at rounds[0].
  const firstRoundCount = rounds[0]?.length || 0;
  if (firstRoundCount === 0) return null;
  
  let expectedFirstRound = 1;
  while (expectedFirstRound < firstRoundCount) expectedFirstRound *= 2;
  const totalRounds = Math.log2(expectedFirstRound) + 1;

  const paddedRounds: any[][] = [];
  let currentRoundSize = expectedFirstRound;
  for (let r = 0; r < totalRounds; r++) {
    const originalRound = rounds[r] || [];
    const paddedRound = [];
    for (let i = 0; i < currentRoundSize; i++) {
       paddedRound.push(originalRound[i] || null);
    }
    paddedRounds.push(paddedRound);
    currentRoundSize /= 2;
  }

  // Split paddedRounds into left and right
  const leftRounds: any[][] = [];
  const rightRounds: any[][] = [];
  
  for (let i = 0; i < paddedRounds.length - 1; i++) {
    const round = paddedRounds[i];
    const half = Math.max(1, Math.floor(round.length / 2));
    leftRounds.push(round.slice(0, half));
    rightRounds.push(round.slice(half));
  }
  
  const finalRound = paddedRounds[paddedRounds.length - 1];
  const finalMatch = finalRound ? finalRound[0] : null;

  const renderSlimCard = (m: any) => {
    if (!m) return <div className="w-48 xl:w-56 h-16 bg-slate-800/30 border border-slate-700/50 rounded-xl" />;
    
    const isFinished = !!m.winnerTeamId;
    const isActive = activeMatch?.id === m.id;
    const opacityClass = isActive && isFading ? 'opacity-0 scale-95' : (isFinished ? 'border-slate-700 opacity-70' : 'opacity-100 scale-100');
    
    return (
      <div className="relative">
        <div className={`w-48 xl:w-56 h-16 bg-slate-900 border-2 rounded-xl flex flex-col justify-center shadow-lg relative z-10 transition-all duration-700 ${isActive ? 'border-pink-500' : 'border-slate-600'} ${opacityClass}`}>
          <div className="flex flex-col px-3 justify-center h-full relative z-10 rounded-xl bg-slate-900">
            <div className="flex justify-between items-center text-[11px] xl:text-xs font-bold text-slate-300">
              <span className="truncate pr-2">{m.teamAId && tournament.teamNames ? tournament.teamNames[m.teamAId] : (m.teamA ? m.teamA.player1.name : "TBD")}</span>
              <span className={`shrink-0 ${m.winnerTeamId === m.teamAId ? 'text-emerald-400 font-black text-sm' : ''}`}>{m.winnerTeamId ? m.scoreTeamA : ''}</span>
            </div>
            <div className="h-px w-full bg-slate-700/50 my-1" />
            <div className="flex justify-between items-center text-[11px] xl:text-xs font-bold text-slate-300">
              <span className="truncate pr-2">{m.teamBId && tournament.teamNames ? tournament.teamNames[m.teamBId] : (m.teamB ? m.teamB.player1.name : "TBD")}</span>
              <span className={`shrink-0 ${m.winnerTeamId === m.teamBId ? 'text-emerald-400 font-black text-sm' : ''}`}>{m.winnerTeamId ? m.scoreTeamB : ''}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LeftNode = ({ match, roundIndex, matchIndex }: { match: any, roundIndex: number, matchIndex: number }) => {
    if (roundIndex === 0) return renderSlimCard(match);
    const prevRound = leftRounds[roundIndex - 1];
    const feeder1 = prevRound ? prevRound[matchIndex * 2] : null;
    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;



    return (
      <div className="flex items-center h-full">
        <div className="flex flex-col justify-around h-full relative w-full">
          <div className="flex-1 flex items-center justify-end relative pr-4 xl:pr-6">
            <LeftNode match={feeder1} roundIndex={roundIndex - 1} matchIndex={matchIndex * 2} />
            <div className="absolute right-0 top-1/2 w-4 xl:w-6 border-t-2 border-slate-600/50" />
          </div>
          <div className="flex-1 flex items-center justify-end relative pr-4 xl:pr-6">
            <LeftNode match={feeder2} roundIndex={roundIndex - 1} matchIndex={matchIndex * 2 + 1} />
            <div className="absolute right-0 top-1/2 w-4 xl:w-6 border-t-2 border-slate-600/50" />
          </div>
          <div className="absolute right-0 top-1/4 bottom-1/4 w-4 xl:w-6 border-r-2 border-slate-600/50 rounded-r-lg" />
        </div>
        <div className="pl-4 xl:pl-6 relative">
          <div className="absolute left-0 top-1/2 w-4 xl:w-6 border-t-2 border-slate-600/50" />
          {renderSlimCard(match)}
        </div>
      </div>
    );
  };

  const RightNode = ({ match, roundIndex, matchIndex }: { match: any, roundIndex: number, matchIndex: number }) => {
    if (roundIndex === 0) return renderSlimCard(match);
    const prevRound = rightRounds[roundIndex - 1];
    const feeder1 = prevRound ? prevRound[matchIndex * 2] : null;
    const feeder2 = prevRound ? prevRound[matchIndex * 2 + 1] : null;
    


    return (
      <div className="flex items-center h-full">
        <div className="pr-4 xl:pr-6 relative">
          <div className="absolute right-0 top-1/2 w-4 xl:w-6 border-t-2 border-slate-600/50" />
          {renderSlimCard(match)}
        </div>
        <div className="flex flex-col justify-around h-full relative w-full">
          <div className="flex-1 flex items-center justify-start relative pl-4 xl:pl-6">
            <RightNode match={feeder1} roundIndex={roundIndex - 1} matchIndex={matchIndex * 2} />
            <div className="absolute left-0 top-1/2 w-4 xl:w-6 border-t-2 border-slate-600/50" />
          </div>
          <div className="flex-1 flex items-center justify-start relative pl-4 xl:pl-6">
            <RightNode match={feeder2} roundIndex={roundIndex - 1} matchIndex={matchIndex * 2 + 1} />
            <div className="absolute left-0 top-1/2 w-4 xl:w-6 border-t-2 border-slate-600/50" />
          </div>
          <div className="absolute left-0 top-1/4 bottom-1/4 w-4 xl:w-6 border-l-2 border-slate-600/50 rounded-l-lg" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-[70vh] items-stretch justify-center relative px-2">
      <div className="flex-1 flex justify-end items-stretch pr-4 xl:pr-8">
        <div className="flex flex-col justify-around h-full w-full max-w-max">
          {leftRounds.length > 0 && leftRounds[leftRounds.length - 1].map((m, i) => (
             <LeftNode key={i} match={m} roundIndex={leftRounds.length - 1} matchIndex={i} />
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-center items-center shrink-0 relative z-20">
         <div className="bg-slate-900/90 p-3 px-8 text-center rounded-2xl border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] mb-6">
           <h3 className="text-xl font-black text-yellow-400 uppercase tracking-widest">Finale</h3>
         </div>
         <div className="relative">
            {renderSlimCard(finalMatch)}
            {leftRounds.length > 0 && (
              <div className="absolute top-1/2 -left-8 xl:-left-16 w-8 xl:w-16 border-t-2 border-slate-600/50 -translate-y-1/2 -z-10" />
            )}
            {rightRounds.length > 0 && (
              <div className="absolute top-1/2 -right-8 xl:-right-16 w-8 xl:w-16 border-t-2 border-slate-600/50 -translate-y-1/2 -z-10" />
            )}
         </div>
      </div>

      <div className="flex-1 flex justify-start items-stretch pl-4 xl:pl-8">
        <div className="flex flex-col justify-around h-full w-full max-w-max">
          {rightRounds.length > 0 && rightRounds[rightRounds.length - 1].map((m, i) => (
             <RightNode key={i} match={m} roundIndex={rightRounds.length - 1} matchIndex={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
