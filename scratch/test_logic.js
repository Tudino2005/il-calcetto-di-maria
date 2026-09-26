const logic = require('../src/lib/tournamentLogic.js') // wait, it's TS, I'll compile it or just copy the logic

const tournament = {
  bracketData: JSON.stringify({
    wbRounds: [
      ["match-1", "match-2"],
      ["match-3"]
    ]
  }),
  matches: [
    { id: "match-1", teamA: { player1: { name: "Vittorio" }, player2: { name: "Stefano" } }, teamB: { player1: { name: "Daniele" }, player2: { name: "Clemente" } } },
    { id: "match-2", teamA: { player1: { name: "Robi" }, player2: { name: "Simone" } }, teamB: { player1: { name: "Johnny" }, player2: { name: "Gialla" } } },
    { id: "match-3", teamA: { player1: { name: "Vittorio" }, player2: { name: "Stefano" } }, teamB: null }
  ]
};

function getFeederMatchInfo(tournament, currentMatchId, slot) {
  if (!tournament || !tournament.bracketData) return "IN ATTESA";
  
  try {
    const bData = JSON.parse(tournament.bracketData);
    
    // Double Elim (Simplification for WB)
    if (bData.wbRounds) {
      for (let r = 1; r < bData.wbRounds.length; r++) {
        const idx = bData.wbRounds[r].indexOf(currentMatchId);
        if (idx !== -1) {
          const feederIdx = idx * 2 + (slot === "A" ? 0 : 1);
          const feederId = bData.wbRounds[r - 1][feederIdx];
          if (feederId) {
            const fm = tournament.matches?.find((m) => m.id === feederId);
            if (fm && fm.teamA && fm.teamB) {
              const nameA = fm.teamA.player1.name + " & " + fm.teamA.player2.name;
              const nameB = fm.teamB.player1.name + " & " + fm.teamB.player2.name;
              return `VINCENTE: ${nameA} VS ${nameB}`;
            }
          }
        }
      }
    }
  } catch(e) {}
  
  return "IN ATTESA";
}

console.log("Slot A for match-3:", getFeederMatchInfo(tournament, "match-3", "A"));
console.log("Slot B for match-3:", getFeederMatchInfo(tournament, "match-3", "B"));

