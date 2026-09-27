const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

// Replace tied logic for TOP DIFENSORI
code = code.replace(
  /p\.winRate === defenderStats\[0\]\.winRate && \n\s*p\.wins === defenderStats\[0\]\.wins && \n\s*p\.played === defenderStats\[0\]\.played/g,
  'p.points === defenderStats[0].points && p.wins === defenderStats[0].wins && p.winRate === defenderStats[0].winRate'
);

code = code.replace(
  /p\.winRate === defenderStats\[0\]\?\.winRate && p\.wins === defenderStats\[0\]\?\.wins && p\.played === defenderStats\[0\]\?\.played/g,
  'p.points === defenderStats[0]?.points && p.wins === defenderStats[0]?.wins && p.winRate === defenderStats[0]?.winRate'
);

code = code.replace(
  /ps\.winRate === defenderStats\[0\]\?\.winRate && ps\.wins === defenderStats\[0\]\?\.wins && ps\.played === defenderStats\[0\]\?\.played/g,
  'ps.points === defenderStats[0]?.points && ps.wins === defenderStats[0]?.wins && ps.winRate === defenderStats[0]?.winRate'
);

// Replace tied logic for TOP ATTACCANTI
code = code.replace(
  /t\.winRate === strikerStats\[0\]\.winRate && \n\s*t\.wins === strikerStats\[0\]\.wins && \n\s*t\.played === strikerStats\[0\]\.played/g,
  't.points === strikerStats[0].points && t.wins === strikerStats[0].wins && t.winRate === strikerStats[0].winRate'
);

code = code.replace(
  /t\.winRate === strikerStats\[0\]\?\.winRate && t\.wins === strikerStats\[0\]\?\.wins && t\.played === strikerStats\[0\]\?\.played/g,
  't.points === strikerStats[0]?.points && t.wins === strikerStats[0]?.wins && t.winRate === strikerStats[0]?.winRate'
);

code = code.replace(
  /ts\.winRate === strikerStats\[0\]\?\.winRate && ts\.wins === strikerStats\[0\]\?\.wins && ts\.played === strikerStats\[0\]\?\.played/g,
  'ts.points === strikerStats[0]?.points && ts.wins === strikerStats[0]?.wins && ts.winRate === strikerStats[0]?.winRate'
);

// Replace UI for TOP DIFENSORI #1
code = code.replace(
  /                                <div className="text-2xl font-black flex items-baseline gap-1">\n                          <span className="text-emerald-400">\{defenderStats\[0\]\.wins\} V<\/span>\n                          <span className="text-blue-400">\/ \{defenderStats\[0\]\.played\} G<\/span>\n                        <\/div>\n                        <div className="text-yellow-500 font-black text-xl">\n                          \{defenderStats\[0\]\.winRate\}%\n                        <\/div>/,
  \`                        <div className="text-3xl font-black text-blue-400 flex items-baseline gap-1">
                          {defenderStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {defenderStats[0].wins} V / {defenderStats[0].played} G
                        </div>\`
);

// Replace UI for TOP ATTACCANTI #1
code = code.replace(
  /                                <div className="text-2xl font-black flex items-baseline gap-1">\n                          <span className="text-emerald-400">\{strikerStats\[0\]\.wins\} V<\/span>\n                          <span className="text-blue-400">\/ \{strikerStats\[0\]\.played\} G<\/span>\n                        <\/div>\n                        <div className="text-yellow-500 font-black text-xl">\n                          \{strikerStats\[0\]\.winRate\}%\n                        <\/div>/,
  \`                        <div className="text-3xl font-black text-red-400 flex items-baseline gap-1">
                          {strikerStats[0].points} <span className="text-xl">PT</span>
                        </div>
                        <div className="text-lg font-bold text-slate-400">
                          {strikerStats[0].wins} V / {strikerStats[0].played} G
                        </div>\`
);

// Replace UI for TOP DIFENSORI list
code = code.replace(
  /                                <div className="text-xl font-black flex items-baseline gap-1">\n                            <span className="text-emerald-400">\{p\.wins\} V<\/span>\n                            <span className="text-blue-400">\/ \{p\.played\} G<\/span>\n                          <\/div>\n                          <div className="text-yellow-500 font-black text-lg">\n                            \{p\.winRate\}%\n                          <\/div>/,
  \`                          <div className="text-2xl font-black text-blue-400 flex items-baseline gap-1">
                            {p.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {p.wins} V / {p.played} G
                          </div>\`
);

// Replace UI for TOP ATTACCANTI list
code = code.replace(
  /                                <div className="text-xl font-black flex items-baseline gap-1">\n                            <span className="text-emerald-400">\{t\.wins\} V<\/span>\n                            <span className="text-blue-400">\/ \{t\.played\} G<\/span>\n                          <\/div>\n                          <div className="text-yellow-500 font-black text-lg">\n                            \{t\.winRate\}%\n                          <\/div>/,
  \`                          <div className="text-2xl font-black text-red-400 flex items-baseline gap-1">
                            {t.points} <span className="text-sm">PT</span>
                          </div>
                          <div className="text-sm font-bold text-slate-400 text-right">
                            {t.wins} V / {t.played} G
                          </div>\`
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
