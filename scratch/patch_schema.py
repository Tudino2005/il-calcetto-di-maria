import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the Tournament model and add scoringMode
    target = 'advantageThreshold Int                  @default(5)\n'
    replacement = target + '  scoringMode    String                   @default("goals") // "goals" or "sets"\n'
    
    if 'scoringMode' not in content:
        content = content.replace(target, replacement)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('prisma/schema.prisma')
