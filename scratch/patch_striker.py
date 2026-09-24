import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Replace global leaderboard striker icons
old_class_1 = '<img src="/images/striker_icon_gold.jpg" alt="Striker" className="h-7 w-12 rounded-md object-cover shadow-sm border border-slate-600" />'
new_class_1 = '<img src="/images/striker_icon_gold.png" alt="Striker" className="h-7 w-12 object-contain drop-shadow-md scale-[2]" />'
content = content.replace(old_class_1, new_class_1)

# Replace player_stats striker icon
old_class_2 = '<img src="/images/striker_icon_gold.jpg" alt="Striker" className="h-8 w-14 rounded-md object-cover shadow-md border-2 border-slate-600" />'
new_class_2 = '<img src="/images/striker_icon_gold.png" alt="Striker" className="h-8 w-14 object-contain drop-shadow-md scale-[2.5]" />'
content = content.replace(old_class_2, new_class_2)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched striker icon")
