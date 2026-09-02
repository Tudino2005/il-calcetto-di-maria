import re

with open("src/app/players/page.tsx", "r") as f:
    content = f.read()

pattern = r'(<div key=\{p\.id\} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700">)'
replacement = r'<Link href={`/players/${p.id}`} key={p.id} className="bg-slate-900 p-4 rounded-xl flex justify-between items-center border border-slate-700 hover:border-emerald-500 transition-colors">'

content = re.sub(pattern, replacement, content)
content = content.replace('</div>\n              ))', '</Link>\n              ))')

with open("src/app/players/page.tsx", "w") as f:
    f.write(content)
