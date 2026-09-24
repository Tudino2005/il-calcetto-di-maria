import sys

with open('src/components/TVSlideshow.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{currentSlide.type === "leaderboard_roles" && (' in line:
        start_idx = i
    if '{currentSlide.type === "leaderboard_free" && (' in line:
        end_idx = i

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]
    with open('src/components/TVSlideshow.tsx', 'w') as f:
        f.writelines(lines)
    print("Deleted broken block")
else:
    print("Could not find blocks")
