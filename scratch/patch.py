import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

start_marker = '{currentSlide.type === "leaderboard" && ('
end_marker = '          {currentSlide.type === "leaderboard_free" && ('

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found")
    exit(1)

leaderboard_code = content[start_idx:end_idx]

new_slide = leaderboard_code.replace('currentSlide.type === "leaderboard"', 'currentSlide.type === "leaderboard_roles"')

prep_code = """          {currentSlide.type === "leaderboard_roles" && (() => {
            const defenderStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'difensore' || p.preferredRole?.toLowerCase() === 'portiere');
            const strikerStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'attaccante');
            
            return (
"""

new_slide = new_slide.replace('          {currentSlide.type === "leaderboard_roles" && (', prep_code)

last_brace = new_slide.rfind('          )}')
new_slide = new_slide[:last_brace] + '            );\n          })()}\n\n'

left_col_start = new_slide.find('{/* TOP SINGLES FIXED CARD */}')
right_col_start = new_slide.find('{/* TOP TEAMS FIXED CARD */}')

if left_col_start == -1 or right_col_start == -1:
    print("Column markers not found")
    exit(1)

new_slide = new_slide.replace('{/* TOP SINGLES FIXED CARD */}', '{/* TOP DEFENDERS FIXED CARD */}')
left_col_start = new_slide.find('{/* TOP DEFENDERS FIXED CARD */}')

left_col = new_slide[left_col_start:right_col_start]

left_col = left_col.replace('playerStats', 'defenderStats')
left_col = left_col.replace('<Medal className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />', '<Shield className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />')
left_col = left_col.replace('<Medal className="w-24 h-24 text-yellow-500" />', '<Shield className="w-24 h-24 text-blue-500" />')
left_col = left_col.replace('TOP SINGOLI', 'TOP DEFENDERS')

left_col = left_col.replace('border-yellow-500', 'border-blue-500')
left_col = left_col.replace('text-yellow-500', 'text-blue-500')
left_col = left_col.replace('rgba(234,179,8', 'rgba(59,130,246')

new_slide = new_slide[:left_col_start] + left_col + new_slide[right_col_start:]

right_col_start = new_slide.find('{/* TOP TEAMS FIXED CARD */}')
right_col_end = len(new_slide)
right_col = new_slide[right_col_start:right_col_end]

right_col = right_col.replace('{/* TOP TEAMS FIXED CARD */}', '{/* TOP STRIKERS FIXED CARD */}')
right_col = right_col.replace('teamStats', 'strikerStats')

# Strip team-specific names rendering and just use tp.name
right_col = re.sub(r'\{tp\.player1\.name\} <span className="[^"]+">&</span> \{tp\.player2\.name\}', '{tp.name}', right_col)

right_col = right_col.replace('<Users className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />', '<Swords className="w-8 h-8 md:w-10 md:h-10 text-red-500" />')
right_col = right_col.replace('<Users className="w-24 h-24 text-yellow-500" />', '<Swords className="w-24 h-24 text-red-500" />')
right_col = right_col.replace('TOP COPPIE', 'TOP STRIKERS')

right_col = right_col.replace('border-yellow-500', 'border-red-500')
right_col = right_col.replace('text-yellow-500', 'text-red-500')
right_col = right_col.replace('rgba(234,179,8', 'rgba(239,68,68')

new_slide = new_slide[:right_col_start] + right_col

final_content = content[:end_idx] + new_slide + content[end_idx:]

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(final_content)

print("Done")
