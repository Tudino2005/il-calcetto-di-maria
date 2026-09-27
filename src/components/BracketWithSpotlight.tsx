import React from 'react';
import { InwardBracket } from './InwardBracket';
import { useMatchSpotlight } from '@/hooks/useMatchSpotlight';
import { SpotlightPopup } from './SpotlightPopup';

export function BracketWithSpotlight({ rounds, tournament, matchProbs }: { rounds: any[][], tournament: any, matchProbs: any }) {
  const allMatches = rounds.flat().filter(Boolean);
  const { activeMatch, isFading } = useMatchSpotlight(allMatches);

  return (
    <div className="relative w-full h-full">
      <InwardBracket rounds={rounds} tournament={tournament} matchProbs={matchProbs} activeMatch={activeMatch} isFading={isFading} />
      <SpotlightPopup activeMatch={activeMatch} isFading={isFading} tournament={tournament} matchProbs={matchProbs} />
    </div>
  );
}
