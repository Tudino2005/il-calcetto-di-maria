import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="text-5xl font-black text-slate-500 uppercase"', 'className="text-4xl font-black text-slate-500 uppercase"')

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)
