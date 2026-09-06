const fs = require('fs')
const content = fs.readFileSync('src/app/actions/tournamentActions.ts', 'utf8')
const lines = content.split('\n')
const idx = lines.findIndex(l => l.includes('export async function advanceTournament'))
if (idx !== -1) {
  console.log(lines.slice(idx, idx+20).join('\n'))
} else {
  const exports = lines.filter(l => l.includes('export async function')).map(l => l.substring(0, 50))
  console.log("Not found. Exports are:\n", exports.join('\n'))
}
