const fs = require('fs');
let code = fs.readFileSync('src/lib/tournamentLogic.ts', 'utf8');

code = code.replace(
  'export function drawTeamsRandom(players: Player[]): { player1: Player; player2: Player }[] {',
  'export function drawTeamsRandom(players: Player[], historicalPairCounts?: Map<string, number>): { player1: Player; player2: Player }[] {'
);
code = code.replace(
  'return teams;',
  'return optimizeTeamsByCost(teams, historicalPairCounts, false);'
); // wait, this will replace ALL 'return teams;'. Let's do it carefully.

code = fs.readFileSync('src/lib/tournamentLogic.ts', 'utf8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export function drawTeamsRandom(')) {
    lines[i] = lines[i].replace('players: Player[]', 'players: Player[], historicalPairCounts?: Map<string, number>');
  }
  if (lines[i].includes('export function drawTeams(')) {
    lines[i] = lines[i].replace('players: Player[]', 'players: Player[], historicalPairCounts?: Map<string, number>');
  }
  if (lines[i].includes('export function drawTeamsRandomBalanced(')) {
    lines[i] = lines[i].replace('playerStatsMap: Map<string, any>', 'playerStatsMap: Map<string, any>, historicalPairCounts?: Map<string, number>');
  }
  if (lines[i].includes('export function drawTeamsBalanced(')) {
    lines[i] = lines[i].replace('playerStatsMap: Map<string, any>', 'playerStatsMap: Map<string, any>, historicalPairCounts?: Map<string, number>');
  }
}

// Now replace returns
// In drawTeamsRandom, return teams; -> return optimizeTeamsByCost(teams, historicalPairCounts, false);
// In drawTeams, return teams; -> return optimizeTeamsByCost(teams, historicalPairCounts, true);
// In drawTeamsRandomBalanced, return teams; -> return optimizeTeamsByCost(teams, historicalPairCounts, false);
// In drawTeamsBalanced, return teams; -> return optimizeTeamsByCost(teams, historicalPairCounts, true);

let inFunction = '';
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export function drawTeamsRandom(')) inFunction = 'drawTeamsRandom';
  else if (lines[i].includes('export function drawTeams(')) inFunction = 'drawTeams';
  else if (lines[i].includes('export function drawTeamsRandomBalanced(')) inFunction = 'drawTeamsRandomBalanced';
  else if (lines[i].includes('export function drawTeamsBalanced(')) inFunction = 'drawTeamsBalanced';
  
  if (lines[i].includes('return teams;')) {
    if (inFunction === 'drawTeamsRandom' || inFunction === 'drawTeamsRandomBalanced') {
      lines[i] = lines[i].replace('return teams;', 'return optimizeTeamsByCost(teams, historicalPairCounts, false);');
    } else if (inFunction === 'drawTeams' || inFunction === 'drawTeamsBalanced') {
      lines[i] = lines[i].replace('return teams;', 'return optimizeTeamsByCost(teams, historicalPairCounts, true);');
    }
  }
}

fs.writeFileSync('src/lib/tournamentLogic.ts', lines.join('\n'));
