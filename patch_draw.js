const fs = require('fs');
let code = fs.readFileSync('src/lib/tournamentLogic.ts', 'utf8');

// We will add a greedy swap phase to all functions if historicalPairCounts is provided.
// Since the prompt asks for "Soluzione 1: Approccio Morbido (Penalizzazione) - Consigliato",
// we can do a post-processing greedy swap. Wait! The soft approach I described was:
// "L'algoritmo calcola tutte le combinazioni... e assegna un malus altissimo se hanno giocato assieme > 2 volte."
// To do this strictly, we need to rewrite the matching logic to be a cost-based greedy assignment.
// OR, we can just do a very simple approach:
// 1. Generate normal teams.
// 2. Do a local search (hill climbing): swap any two players (respecting constraints) if it reduces the total cost!
// Cost function:
// Balanced: cost = sum of Math.abs(rank(p1) + rank(p2) - idealSum) + penalty
// Actually, local search is SUPER easy to implement and works extremely well for this!

const newLogic = `
function calculateTeamCost(p1: any, p2: any, historicalPairCounts: Map<string, number> | undefined) {
  if (!historicalPairCounts) return 0;
  const ids = [p1.id, p2.id].sort();
  const key = \`\${ids[0]}_\${ids[1]}\`;
  const played = historicalPairCounts.get(key) || 0;
  // If they played > 0 times, add a small penalty. If > 2, add a huge penalty.
  if (played > 2) return 1000 + played;
  if (played > 0) return 10 * played;
  return 0;
}

function optimizeTeamsByCost(
  teams: { player1: any; player2: any }[],
  historicalPairCounts: Map<string, number> | undefined,
  enforceRoles: boolean
) {
  if (!historicalPairCounts) return teams;
  
  // Hill climbing: try swapping players between teams to reduce total cost
  let improved = true;
  let iterations = 0;
  while (improved && iterations < 1000) {
    improved = false;
    iterations++;
    
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const t1 = teams[i];
        const t2 = teams[j];
        
        // Current cost
        const currentCost = calculateTeamCost(t1.player1, t1.player2, historicalPairCounts) + 
                            calculateTeamCost(t2.player1, t2.player2, historicalPairCounts);
                            
        // Option A: swap player2s
        const swapACost = calculateTeamCost(t1.player1, t2.player2, historicalPairCounts) + 
                          calculateTeamCost(t2.player1, t1.player2, historicalPairCounts);
                          
        // Option B: swap player1s
        const swapBCost = calculateTeamCost(t2.player1, t1.player2, historicalPairCounts) + 
                          calculateTeamCost(t1.player1, t2.player2, historicalPairCounts);

        if (enforceRoles) {
          // If roles are enforced, player1 is always Attaccante, player2 is always Portiere.
          // We can only swap player2s (Portieri) or player1s (Attaccanti).
          if (swapACost < currentCost) {
            const temp = t1.player2;
            t1.player2 = t2.player2;
            t2.player2 = temp;
            improved = true;
          }
        } else {
          // If no roles, we can swap anything. 
          // Option A (swap p2s):
          if (swapACost < currentCost) {
            const temp = t1.player2;
            t1.player2 = t2.player2;
            t2.player2 = temp;
            improved = true;
          } 
          // Option B (swap p1 from t1 with p2 from t2)
          else {
            const swapCrossCost = calculateTeamCost(t1.player1, t2.player1, historicalPairCounts) + 
                                  calculateTeamCost(t1.player2, t2.player2, historicalPairCounts);
            if (swapCrossCost < currentCost) {
               const temp = t1.player2;
               t1.player2 = t2.player1;
               t2.player1 = temp;
               improved = true;
            }
          }
        }
      }
    }
  }
  return teams;
}
`;

fs.writeFileSync('src/lib/tournamentLogic.ts', newLogic + '\n' + code);
