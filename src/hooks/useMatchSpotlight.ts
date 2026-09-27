import { useState, useEffect, useRef } from "react";

/**
 * Reusable hook for cycling through upcoming matches with a spotlight animation.
 * Cycles through all matches without a winner, one every 5 seconds.
 * Uses stable match IDs (joined as string) as dependency to avoid infinite re-renders.
 */
export function useMatchSpotlight(matches: any[]) {
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [isFading, setIsFading] = useState(false);

  // Derive a stable key from the pending match IDs to avoid re-triggering on every render
  const pendingMatchIds = matches
    .filter((m) => m && !m.winnerTeamId)
    .map((m) => m.id)
    .join(",");

  // Keep a ref to latest matches for use inside timers without stale closure issues
  const matchesRef = useRef<any[]>(matches);
  useEffect(() => {
    matchesRef.current = matches;
  });

  useEffect(() => {
    const toAnimate = matchesRef.current.filter((m) => m && !m.winnerTeamId);
    if (toAnimate.length === 0) {
      setActiveMatch(null);
      setIsFading(false);
      return;
    }

    let idx = 0;
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const startDelay = setTimeout(() => {
      if (!isMounted) return;
      setActiveMatch(toAnimate[idx]);
      setTimeout(() => { if (isMounted) setIsFading(true); }, 50);

      interval = setInterval(() => {
        if (!isMounted) return;
        setIsFading(false);
        setTimeout(() => {
          if (!isMounted) return;
          idx = (idx + 1) % toAnimate.length;
          setActiveMatch(toAnimate[idx]);
          setTimeout(() => { if (isMounted) setIsFading(true); }, 50);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMatchIds]); // Re-run only when actual pending match set changes

  return { activeMatch, isFading };
}
