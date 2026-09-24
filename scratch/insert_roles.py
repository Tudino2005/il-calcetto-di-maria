import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Extract leaderboard
start_marker = '          {currentSlide.type === "leaderboard" && ('
end_marker = '          {currentSlide.type === "leaderboard_free" && ('

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

leaderboard_code = content[start_idx:end_idx]

# Replace 'leaderboard' with 'leaderboard_roles'
new_slide = leaderboard_code.replace('currentSlide.type === "leaderboard"', 'currentSlide.type === "leaderboard_roles"')

# Wrap with IIFE correctly
# The original starts with: '          {currentSlide.type === "leaderboard_roles" && (\n'
# We replace it with the IIFE and variable definitions
header = """          {currentSlide.type === "leaderboard_roles" && (() => {
            const defenderStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'difensore' || p.preferredRole?.toLowerCase() === 'portiere');
            const strikerStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'attaccante');
            
            return (
"""
new_slide = new_slide.replace('          {currentSlide.type === "leaderboard_roles" && (\n', header)

# The original ends with: '          )}\n'
# We replace it with the IIFE closing
footer = """            );
          })()}
"""
# Make sure we only replace the last occurrence
last_brace = new_slide.rfind('          )}\n')
new_slide = new_slide[:last_brace] + footer + new_slide[last_brace + len('          )}\n'):]

# Now split into left and right columns
left_col_start = new_slide.find('{/* TOP SINGLES FIXED CARD */}')
right_col_start = new_slide.find('{/* TOP TEAMS FIXED CARD */}')

left_col = new_slide[left_col_start:right_col_start]
right_col = new_slide[right_col_start:]

# Fix Left Col (Defenders)
left_col = left_col.replace('{/* TOP SINGLES FIXED CARD */}', '{/* TOP DEFENDERS FIXED CARD */}')
left_col = left_col.replace('playerStats', 'defenderStats')
left_col = left_col.replace('<Medal className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />', '<Shield className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />')
left_col = left_col.replace('<Medal className="w-24 h-24 text-yellow-500" />', '<Shield className="w-24 h-24 text-blue-500" />')
left_col = left_col.replace('TOP SINGOLI', 'TOP DEFENDERS')
left_col = left_col.replace('border-yellow-500', 'border-blue-500')
left_col = left_col.replace('text-yellow-500', 'text-blue-500')
left_col = left_col.replace('rgba(234,179,8', 'rgba(59,130,246')

# Fix Right Col (Strikers)
right_col = right_col.replace('{/* TOP TEAMS FIXED CARD */}', '{/* TOP STRIKERS FIXED CARD */}')
right_col = right_col.replace('teamStats', 'strikerStats')
right_col = right_col.replace('<Users className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />', '<Swords className="w-8 h-8 md:w-10 md:h-10 text-red-500" />')
right_col = right_col.replace('<Users className="w-24 h-24 text-yellow-500" />', '<Swords className="w-24 h-24 text-red-500" />')
right_col = right_col.replace('TOP COPPIE', 'TOP STRIKERS')
right_col = right_col.replace('border-yellow-500', 'border-red-500')
right_col = right_col.replace('text-yellow-500', 'text-red-500')
right_col = right_col.replace('rgba(234,179,8', 'rgba(239,68,68')

# Fix Strikers name rendering to use {tt.name} and {t.name} instead of player1/player2
right_col = re.sub(
    r'<span className="[^"]+">\{tt\.player1\?\.name[^}]+\}</span>\s*<span className="[^"]+">&</span>\s*<span className="[^"]+">\{tt\.player2\?\.name[^}]+\}</span>',
    '<span className="text-3xl font-black text-white leading-tight truncate">{tt.name}</span>',
    right_col
)
right_col = re.sub(
    r'<span className="[^"]+">\{t\.player1\?\.name[^}]+\}</span>\s*<span className="[^"]+">&</span>\s*<span className="[^"]+">\{t\.player2\?\.name[^}]+\}</span>',
    '<span className="text-xl font-bold text-white truncate leading-tight">{t.name}</span>',
    right_col
)

new_slide = new_slide[:left_col_start] + left_col + right_col

final_content = content[:end_idx] + new_slide + '\n' + content[end_idx:]

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(final_content)

print("Done")
