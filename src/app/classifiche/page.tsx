export const dynamic = "force-dynamic";
import { getLeaderboardData, getFreeMatchesLeaderboard } from "@/lib/leaderboardData";
import { getAdvancedPlayerStatsForTV } from "@/lib/advancedPlayerStats";
import PublicLeaderboardClient from "@/components/PublicLeaderboardClient";

export const revalidate = 0;

export default async function ClassifichePage() {
  const { playerStats, teamStats } = await getLeaderboardData();
  const freeMatchesStats = await getFreeMatchesLeaderboard();
  const advancedPlayerStats = await getAdvancedPlayerStatsForTV();

  const data = {
    playerStats,
    teamStats,
    freeMatchesStats,
    advancedPlayerStats
  };

  return <PublicLeaderboardClient data={data} />;
}
