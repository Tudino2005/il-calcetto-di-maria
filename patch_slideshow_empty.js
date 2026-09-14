const fs = require('fs');
let file = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

// Always push at least one slide, even if empty
file = file.replace(
  '  if (data.freeMatchesStats && data.freeMatchesStats.length > 0) {\n    const playersPerPage = 10;\n    const pages = Math.ceil(data.freeMatchesStats.length / playersPerPage);\n    for (let p = 0; p < pages; p++) {\n      slides.push({ type: "leaderboard_free", duration: 15000, page: p });\n    }\n  }',
  '  if (data.freeMatchesStats && data.freeMatchesStats.length > 0) {\n    const playersPerPage = 10;\n    const pages = Math.ceil(data.freeMatchesStats.length / playersPerPage);\n    for (let p = 0; p < pages; p++) {\n      slides.push({ type: "leaderboard_free", duration: 15000, page: p });\n    }\n  } else {\n    slides.push({ type: "leaderboard_free", duration: 10000, page: 0 });\n  }'
);

// Add empty state handling in the render
const rowLogic = `
                {/* ROWS */}
                <div className="flex flex-col flex-1">
                  {(!data.freeMatchesStats || data.freeMatchesStats.length === 0) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                      <Swords className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-xl font-bold uppercase tracking-widest">Nessuna Sfida Libera Giocata</p>
                    </div>
                  ) : (
                    data.freeMatchesStats.slice(currentSlide.page * 10, (currentSlide.page + 1) * 10).map((stats: any, index: number) => {
`;
file = file.replace(
  '                {/* ROWS */}\n                <div className="flex flex-col flex-1">\n                  {data.freeMatchesStats.slice(currentSlide.page * 10, (currentSlide.page + 1) * 10).map((stats: any, index: number) => {',
  rowLogic
);

// close the ternary condition at the end of the map
file = file.replace(
  '                  })}\n                </div>',
  '                  })\n                  )}\n                </div>'
);


fs.writeFileSync('src/components/TVSlideshow.tsx', file);
