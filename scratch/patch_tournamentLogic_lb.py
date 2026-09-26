import re

with open('src/lib/tournamentLogic.ts', 'r') as f:
    content = f.read()

# We need to insert the logic for lbRounds right after the wbRounds loop inside getFeederMatchInfo

lb_logic = """
      // Double Elim LB
      if (bData.lbRounds) {
        for (let r = 0; r < bData.lbRounds.length; r++) {
          const idx = bData.lbRounds[r].indexOf(currentMatchId);
          if (idx !== -1) {
            let feederId: string | undefined;
            let isLoser = false;

            if (r % 2 === 1) {
              // ODD LB Round (e.g. 1, 3)
              if (slot === "A") {
                feederId = bData.lbRounds[r - 1][idx];
              } else {
                // Comes from WB drop
                const wbRound = (r + 1) / 2;
                const matchesInTargetLbRound = bData.lbRounds[r].length;
                const wbMatchIndex = (matchesInTargetLbRound - 1) - idx;
                if (bData.wbRounds[wbRound]) {
                  feederId = bData.wbRounds[wbRound][wbMatchIndex];
                  isLoser = true;
                }
              }
            } else {
              // EVEN LB Round (e.g. 0, 2)
              if (r === 0) {
                // Comes from WB Round 0
                const wbMatchIndex = idx * 2 + (slot === "A" ? 0 : 1);
                feederId = bData.wbRounds[0][wbMatchIndex];
                isLoser = true;
              } else {
                // Comes from previous LB Round
                const feederIdx = idx * 2 + (slot === "A" ? 0 : 1);
                feederId = bData.lbRounds[r - 1][feederIdx];
              }
            }

            if (feederId) {
              const fm = tournament.matches?.find((m: any) => m.id === feederId);
              if (fm && fm.teamA && fm.teamB) {
                const nameA = fm.teamA.player1.name + " & " + fm.teamA.player2.name;
                const nameB = fm.teamB.player1.name + " & " + fm.teamB.player2.name;
                return `${isLoser ? 'PERDENTE' : 'VINCENTE'}: ${nameA} VS ${nameB}`;
              }
            }
          }
        }
      }
"""

# Insert lb_logic before "// For GF"
content = content.replace('      // For GF', lb_logic + '      // For GF')

with open('src/lib/tournamentLogic.ts', 'w') as f:
    f.write(content)

print("Patched tournamentLogic.ts with LB logic!")
