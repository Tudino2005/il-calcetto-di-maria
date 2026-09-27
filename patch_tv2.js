const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  /t\.winRate === teamStats\[0\]\.winRate && \n\s*t\.wins === teamStats\[0\]\.wins && \n\s*t\.played === teamStats\[0\]\.played/g,
  't.points === teamStats[0].points && t.wins === teamStats[0].wins && t.winRate === teamStats[0].winRate'
);

code = code.replace(
  /t\.winRate === teamStats\[0\]\?\.winRate && t\.wins === teamStats\[0\]\?\.wins && t\.played === teamStats\[0\]\?\.played/g,
  't.points === teamStats[0]?.points && t.wins === teamStats[0]?.wins && t.winRate === teamStats[0]?.winRate'
);

code = code.replace(
  /ts\.winRate === teamStats\[0\]\?\.winRate && ts\.wins === teamStats\[0\]\?\.wins && ts\.played === teamStats\[0\]\?\.played/g,
  'ts.points === teamStats[0]?.points && ts.wins === teamStats[0]?.wins && ts.winRate === teamStats[0]?.winRate'
);

code = code.replace(
  \`                        <div className="text-2xl font-black flex items-baseline gap-1">
                          <span className="text-emerald-400">{teamStats[0].wins} V</span>
                          <span className="text-blue-400">/ {teamStats[0].played} G</span>
                        </div>
                        <div className="text-yellow-500 font-black text-xl">
                          {teamStats[0].winRate}%
                        </div>\`,
  \`                        <div className="text-3xl font-black text-yellow-500 flex items-baseline gap-1">
                          {teamStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {teamStats[0].wins} V / {teamStats[0].played} G
                        </div>\`
);

code = code.replace(
  \`                          <div className="text-xl font-black flex items-baseline gap-1">
                            <span className="text-emerald-400">{t.wins} V</span>
                            <span className="text-blue-400">/ {t.played} G</span>
                          </div>
                          <div className="text-yellow-500 font-black text-lg">
                            {t.winRate}%
                          </div>\`,
  \`                          <div className="text-2xl font-black text-yellow-500 flex items-baseline gap-1">
                            {t.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {t.wins} V / {t.played} G
                          </div>\`
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
