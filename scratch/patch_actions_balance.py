import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

# 1. Add imports
content = content.replace(
    'import { drawTeams, drawTeamsRandom, generateBracket } from "@/lib/tournamentLogic";',
    'import { drawTeams, drawTeamsRandom, drawTeamsBalanced, drawTeamsRandomBalanced, generateBracket } from "@/lib/tournamentLogic";\nimport { getLeaderboardData } from "@/lib/leaderboardData";'
)

# 2. Add logic inside createTeams section
old_teams_to_insert = """    } else {
      teamsToInsert = drawTeamsRandom(players);
    }"""
    
new_teams_to_insert = """    } else {
      if (tournament.isBalancedDraw) {
        const { playerStats } = await getLeaderboardData();
        const statMap = new Map(playerStats.map(p => [p.id, p]));
        teamsToInsert = drawTeamsRandomBalanced(players, statMap);
      } else {
        teamsToInsert = drawTeamsRandom(players);
      }
    }"""
    
content = content.replace(old_teams_to_insert, new_teams_to_insert)

old_teams_to_insert_2 = """  } else {
    const teamsToInsert = type === "sorteggio_integrale" ? drawTeamsRandom(players) : drawTeams(players);"""
    
new_teams_to_insert_2 = """  } else {
    let teamsToInsert: any[] = [];
    if (tournament.isBalancedDraw) {
      const { playerStats } = await getLeaderboardData();
      const statMap = new Map(playerStats.map(p => [p.id, p]));
      teamsToInsert = type === "sorteggio_integrale" ? drawTeamsRandomBalanced(players, statMap) : drawTeamsBalanced(players, statMap);
    } else {
      teamsToInsert = type === "sorteggio_integrale" ? drawTeamsRandom(players) : drawTeams(players);
    }"""
    
content = content.replace(old_teams_to_insert_2, new_teams_to_insert_2)


with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)

print("Patched tournamentActions!")
