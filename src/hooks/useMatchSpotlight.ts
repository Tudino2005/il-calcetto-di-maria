import { useState, useEffect } from "react";

/**
 * Reusable hook for cycling through upcoming matches with a spotlight animation.
 * Cycles through all matches without a winner, one every 5 seconds.
 */
export function useMatchSpotlight(matches: any[]) {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const toAnimate = matches.filter((m) => m && !m.winnerTeamId);
    if (toAnimate.length === 0) return;

    let idx = 0;
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const startDelay = setTimeout(() => {
      if (!isMounted) return;
      setActiveMatch(toAnimate[idx]);
      setTimeout(() => setIsFading(true), 50);

      interval = setInterval(() => {
        setIsFading(false);
        setTimeout(() => {
          if (!isMounted) return;
          idx++;
          if (idx >= toAnimate.length) idx = 0; // Loop back to first
          setActiveMatch(toAnimate[idx]);
          setTimeout(() => setIsFading(true), 50);
        }, 1200);
      }, 5000);
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(startDelay);
      if (interval) clearInterval(interval);
      setActiveMatch(null);
      setIsFading(false);
    };
  }, [matches]);

  return { activeMatch, isFading };
}
