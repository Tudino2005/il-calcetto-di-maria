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
      else return setScores;
    } catch {
      return setScores;
    }
  }
  if (arr.length === 0) return null;
  return arr.map(s => `${s.scoreA}-${s.scoreB}`).join(", ");
}
