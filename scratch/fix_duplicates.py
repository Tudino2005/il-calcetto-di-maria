import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# We need to find the FIRST occurrence of the NEW player_stats slide.
# It starts at `{/* PLAYER STATS SLIDE */}` and ends with `})()}\n\n`
# Actually, the duplicate part is right after `new_slide_code`.
# We know the duplicate starts with `{/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}` followed by `leaderboard_roles`.
# Let's find all occurrences of `leaderboard_roles`
roles_matches = [m.start() for m in re.finditer(r'currentSlide\.type === "leaderboard_roles"', content)]
if len(roles_matches) > 1:
    print(f"Found {len(roles_matches)} leaderboard_roles. Deleting the second one and everything after it until recent_matches.")
    
    # Find the start of the duplicate block
    # It's `{/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}` before the second leaderboard_roles
    dup_start = content.rfind('{/* LEADERBOARD FREE MATCHES (SERIE A STYLE) */}', 0, roles_matches[1])
    
    # Find the end of the duplicate block
    # The duplicate block ends where `recent_matches` starts in the SECOND copy.
    # Actually, the original file only had ONE `recent_matches`. Let's check how many `recent_matches` we have.
    recent_matches = [m.start() for m in re.finditer(r'currentSlide\.type === "recent_matches"', content)]
    print(f"Found {len(recent_matches)} recent_matches.")
    
    if len(recent_matches) >= 1:
        dup_end = content.rfind('{/* RECENT MATCHES SLIDE */}', 0, recent_matches[-1])
        if dup_start != -1 and dup_end != -1:
            print(f"Deleting from {dup_start} to {dup_end}")
            content = content[:dup_start] + content[dup_end:]
            with open('src/components/TVSlideshow.tsx', 'w') as f:
                f.write(content)
            print("Fixed duplicates!")
else:
    print("No duplicates found")

