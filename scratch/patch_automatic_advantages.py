import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update the targetGoals onClick to always set advantage to val - 1
    content = content.replace(
        "updateGoalSettings(val, advantageThreshold === 99 ? 99 : Math.min(advantageThreshold, val - 1))",
        "updateGoalSettings(val, advantageThreshold === 99 ? 99 : val - 1)"
    )
    content = content.replace(
        "updateSettings(\"goals\", val, advantageThreshold === 99 ? 99 : Math.min(advantageThreshold, val - 1))",
        "updateSettings(\"goals\", val, advantageThreshold === 99 ? 99 : val - 1)"
    )

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/TournamentForm.tsx')
patch_file('src/components/MatchScorer.tsx')
