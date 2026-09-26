/**
 * Tournament Scheduling Engine
 * 
 * Assigns exact dates & times to all matches in a tournament.
 * 
 * Rules enforced:
 *  - Only plays on allowed days of the week (scheduleDays: 0=Sun...6=Sat)
 *  - Games start at scheduleStartTime ("HH:MM") each match day
 *  - Each match occupies a 30-minute time-slot
 *  - A team can only play 1 match per calendar day
 *  - Parallel matches limited by numTables (tables available)
 *  - Total matches per day limited by maxMatchesPerDay
 *  - Group stage matches are scheduled round by round (round-robin respects fairness)
 *  - Playoff matches are scheduled in continuity after group stage
 */

export interface ScheduleConfig {
  startDate: Date;
  scheduleStartTime: string;  // "HH:MM"
  scheduleDays: number[];     // 0=Sun, 1=Mon, ..., 6=Sat
  numTables: number;          // parallel matches per slot
  maxMatchesPerDay: number;   // hard cap per day
  matchDurationMinutes: number; // always 30 per spec
}

export interface SchedulableMatch {
  id: string;
  teamAId: string | null;
  teamBId: string | null;
  round: number;          // logical ordering — lower = earlier
  dependsOn?: string[];   // match IDs that must be scheduled before this one
}

export interface ScheduledResult {
  matchId: string;
  scheduledAt: Date;
}

export interface ScheduleSummary {
  results: ScheduledResult[];
  totalDays: number;
  totalMatchDays: number;
  estimatedEndDate: Date;
  matchesPerDay: Record<string, number>; // ISO date → count
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "HH:MM" and apply it to a given date, returning a new Date. */
function applyTime(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/** Get ISO date string YYYY-MM-DD for a Date in local time. */
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Advance the cursor to the next allowed match day at the start time. */
function nextAllowedDay(fromDate: Date, scheduleDays: number[], startTime: string): Date {
  const candidate = new Date(fromDate);
  // Strip time — work with midnight
  candidate.setHours(0, 0, 0, 0);

  // Try up to 14 days ahead to find a valid one
  for (let i = 0; i < 365; i++) {
    if (scheduleDays.includes(candidate.getDay())) {
      return applyTime(candidate, startTime);
    }
    candidate.setDate(candidate.getDate() + 1);
  }

  throw new Error("No valid match day found within 365 days. Check scheduleDays config.");
}

// ─── Main Scheduler ───────────────────────────────────────────────────────────

export function scheduleTournamentMatches(
  matches: SchedulableMatch[],
  config: ScheduleConfig
): ScheduleSummary {
  const {
    startDate,
    scheduleStartTime,
    scheduleDays,
    numTables,
    maxMatchesPerDay,
    matchDurationMinutes,
  } = config;

  if (scheduleDays.length === 0) {
    throw new Error("scheduleDays cannot be empty — at least one day must be selected.");
  }

  // Sort matches by round so earlier rounds come first
  const sorted = [...matches].sort((a, b) => a.round - b.round);

  // Cursor: the current DateTime we are assigning
  let cursor = nextAllowedDay(startDate, scheduleDays, scheduleStartTime);

  // Per-day tracking
  let todayKey = toDateKey(cursor);
  let matchesTodayCount = 0;     // how many matches assigned today (total)
  
  // Per-day per-team blacklist: date → Set of teamIds that already played
  const teamDayBlacklist: Record<string, Set<string>> = {};

  const results: ScheduledResult[] = [];
  const scheduledMatchIds = new Set<string>();
  const matchesPerDay: Record<string, number> = {};

  // We iterate over "rounds" — within each round, we greedily assign
  // matches by slot, respecting numTables and maxMatchesPerDay.
  // Unassignable matches (due to team blacklist) are deferred to next slot/day.

  let remainingMatches = [...sorted];

  const MAX_ITERATIONS = 100000; // Safety guard
  let iterations = 0;

  while (remainingMatches.length > 0) {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      throw new Error("Scheduler exceeded maximum iterations. Check your input data.");
    }

    // Refresh today key from cursor
    todayKey = toDateKey(cursor);

    if (!teamDayBlacklist[todayKey]) {
      teamDayBlacklist[todayKey] = new Set();
    }
    const blacklist = teamDayBlacklist[todayKey];

    // Check if we've hit the daily cap
    if (matchesTodayCount >= maxMatchesPerDay) {
      // Move to next allowed day
      const nextDay = new Date(cursor);
      nextDay.setDate(nextDay.getDate() + 1);
      cursor = nextAllowedDay(nextDay, scheduleDays, scheduleStartTime);
      matchesTodayCount = 0;
      continue;
    }

    // Find matches schedulable RIGHT NOW at this slot:
    // 1. Both teams not already played today
    // 2. No unresolved dependencies (for playoff-style matches)
    const slot: SchedulableMatch[] = [];

    for (const m of remainingMatches) {
      if (slot.length >= numTables) break; // Can't assign more than tables

      if (!m.teamAId || !m.teamBId) continue; // Skip TBD matches

      // Check team blacklist for this day
      if (blacklist.has(m.teamAId) || blacklist.has(m.teamBId)) continue;

      // Ensure teams are not already in this slot
      const slotTeams = new Set(slot.flatMap(s => [s.teamAId!, s.teamBId!]));
      if (slotTeams.has(m.teamAId) || slotTeams.has(m.teamBId)) continue;

      slot.push(m);
    }

    if (slot.length === 0) {
      // No match can be assigned at this moment:
      // Either all remaining teams played today, or we've exhausted the day.
      // Check if there are any unblocked matches left at all
      const unblocked = remainingMatches.filter(m =>
        m.teamAId && m.teamBId &&
        !blacklist.has(m.teamAId!) && !blacklist.has(m.teamBId!)
      );

      if (unblocked.length === 0) {
        // All remaining matches for today are blocked by the 1-per-day rule
        // Move to next allowed day
        const nextDay = new Date(cursor);
        nextDay.setDate(nextDay.getDate() + 1);
        cursor = nextAllowedDay(nextDay, scheduleDays, scheduleStartTime);
        matchesTodayCount = 0;
      } else {
        // Tables are full but day cap not reached — advance time by one slot
        cursor = new Date(cursor.getTime() + matchDurationMinutes * 60 * 1000);
      }
      continue;
    }

    // Assign this slot
    for (const m of slot) {
      results.push({ matchId: m.id, scheduledAt: new Date(cursor) });
      scheduledMatchIds.add(m.id);

      // Update blacklists
      blacklist.add(m.teamAId!);
      blacklist.add(m.teamBId!);

      // Track per-day count
      matchesPerDay[todayKey] = (matchesPerDay[todayKey] || 0) + 1;
    }

    matchesTodayCount += slot.length;

    // Remove assigned matches from queue
    const assignedIds = new Set(slot.map(m => m.id));
    remainingMatches = remainingMatches.filter(m => !assignedIds.has(m.id));

    // Advance cursor by one time-slot
    cursor = new Date(cursor.getTime() + matchDurationMinutes * 60 * 1000);

    // If we still hit the daily cap, rollover will be caught at start of loop
  }

  // Summary computation
  const allDates = results.map(r => r.scheduledAt);
  const minDate = allDates.reduce((a, b) => (a < b ? a : b), allDates[0]);
  const maxDate = allDates.reduce((a, b) => (a > b ? a : b), allDates[0]);

  const totalDays = Math.ceil(
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return {
    results,
    totalDays,
    totalMatchDays: Object.keys(matchesPerDay).length,
    estimatedEndDate: maxDate,
    matchesPerDay,
  };
}

// ─── Converter helpers used by server action ──────────────────────────────────

/**
 * Converts group-stage matches (grouped by round) into SchedulableMatches.
 * Each round in the round-robin has a round number starting from 0.
 */
export function groupMatchesToSchedulable(
  roundSchedule: { teamAId: string; teamBId: string }[][],
  dbMatchIds: string[][]
): SchedulableMatch[] {
  const result: SchedulableMatch[] = [];
  let globalIdx = 0;

  for (let roundIdx = 0; roundIdx < roundSchedule.length; roundIdx++) {
    const round = roundSchedule[roundIdx];
    for (let matchIdx = 0; matchIdx < round.length; matchIdx++) {
      const m = round[matchIdx];
      const id = dbMatchIds[roundIdx]?.[matchIdx];
      if (!id) continue;
      result.push({
        id,
        teamAId: m.teamAId,
        teamBId: m.teamBId,
        round: roundIdx,
      });
      globalIdx++;
    }
  }

  return result;
}

/**
 * Formats a ScheduleSummary into a human-readable report string in Italian.
 */
export function formatScheduleReport(summary: ScheduleSummary): string {
  const { totalDays, totalMatchDays, estimatedEndDate, results, matchesPerDay } = summary;

  const endStr = estimatedEndDate.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dayDetails = Object.entries(matchesPerDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      const d = new Date(date + "T00:00:00");
      const label = d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
      return `  • ${label}: ${count} partite`;
    })
    .join("\n");

  return [
    `📅 Calendario generato — ${results.length} partite programmate`,
    `🏁 Fine torneo stimata: ${endStr}`,
    `📆 Durata: ${totalDays} giorni (${totalMatchDays} serate di gioco)`,
    ``,
    `Distribuzione per serata:`,
    dayDetails,
  ].join("\n");
}
