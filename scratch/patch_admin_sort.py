import re

with open('src/components/GroupStageView.tsx', 'r') as f:
    content = f.read()

old_code = """                <tbody className="divide-y divide-slate-800">
                  {g.standings.map((s: any, idx: number) => {"""

new_code = """                <tbody className="divide-y divide-slate-800">
                  {[...g.standings].sort((a: any, b: any) => {
                    if (a.points !== b.points) return b.points - a.points;
                    const diffA = (a.setsFor || 0) - (a.setsAgainst || 0);
                    const diffB = (b.setsFor || 0) - (b.setsAgainst || 0);
                    if (diffA !== diffB) return diffB - diffA;
                    if (a.setsFor !== b.setsFor) return (b.setsFor || 0) - (a.setsFor || 0);
                    return 0;
                  }).map((s: any, idx: number) => {"""

content = content.replace(old_code, new_code)

with open('src/components/GroupStageView.tsx', 'w') as f:
    f.write(content)

print("Patched GroupStageView sort!")
