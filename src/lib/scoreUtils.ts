export type SetScoreItem = {
  set?: number;
  setNumber?: number;
  scoreA: number;
  scoreB: number;
};

export function formatSetScores(setScores: any): string | null {
  if (!setScores) return null;
  let arr: any[] = [];
  if (Array.isArray(setScores)) {
    arr = setScores;
  } else if (typeof setScores === "string") {
    try {
      const parsed = JSON.parse(setScores);
      if (Array.isArray(parsed)) arr = parsed;
      else return String(setScores);
    } catch {
      return String(setScores);
    }
  } else if (typeof setScores === "object") {
    if (Array.isArray((setScores as any).rounds)) return null;
    return null;
  }
  if (!arr || arr.length === 0) return null;
  const formatted = arr
    .map(s => {
      if (!s) return null;
      if (typeof s === "object" && ("scoreA" in s || "scoreB" in s)) {
        return `${s.scoreA ?? 0}-${s.scoreB ?? 0}`;
      }
      return String(s);
    })
    .filter(Boolean);
  return formatted.length > 0 ? formatted.join(", ") : null;
}
