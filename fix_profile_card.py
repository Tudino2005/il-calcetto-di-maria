import re

with open("src/app/players/[id]/page.tsx", "r") as f:
    content = f.read()

pattern = r'(              <div key=\{m\.id\} className=\{`p-6 rounded-2xl border flex items-center justify-between \$\{\n\s*iWon \? \'bg-emerald-900/20 border-emerald-500/30\' : \'bg-red-900/20 border-red-500/30\'\n\s*\}\`\}>)'
replacement = """              <div key={m.id} className={`p-6 rounded-2xl flex items-center justify-between border-2 bg-slate-900 ${
                iWon ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}>"""
content = re.sub(pattern, replacement, content)

with open("src/app/players/[id]/page.tsx", "w") as f:
    f.write(content)
