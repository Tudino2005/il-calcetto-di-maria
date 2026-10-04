import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Extract scoringMode
    if "const scoringMode" not in content:
        content = content.replace(
            'const targetGoals = Number(formData.get("targetGoals") || 7);',
            'const scoringMode = (formData.get("scoringMode") as string) || "goals";\n  const targetGoals = Number(formData.get("targetGoals") || 7);'
        )
        content = content.replace(
            'avoidRepeatedPairs,\n      targetGoals,',
            'avoidRepeatedPairs,\n      scoringMode,\n      targetGoals,'
        )

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/app/actions/tournamentActions.ts')
