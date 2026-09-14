const fs = require('fs');
let file = fs.readFileSync('src/app/page.tsx', 'utf8');

file = file.replace(
  'import { getLeaderboardData } from "@/lib/leaderboardData";',
  'import { getLeaderboardData, getFreeMatchesLeaderboard } from "@/lib/leaderboardData";'
);

file = file.replace(
  'const { playerStats, teamStats } = await getLeaderboardData();',
  'const { playerStats, teamStats } = await getLeaderboardData();\n  const freeMatchesStats = await getFreeMatchesLeaderboard();'
);

file = file.replace(
  '    playerStats,\n    teamStats\n  };',
  '    playerStats,\n    teamStats,\n    freeMatchesStats\n  };'
);

fs.writeFileSync('src/app/page.tsx', file);
