const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dev.db');
db.get("SELECT bracketData FROM Tournament WHERE format = 'doppia_eliminazione' ORDER BY createdAt DESC LIMIT 1", (err, row) => {
  if (err) console.error(err);
  else console.log(row.bracketData);
});
