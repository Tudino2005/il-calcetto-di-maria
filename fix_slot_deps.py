import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# Fix the first useEffect so it doesn't re-run if we already have teams
old_effect1 = """  useEffect(() => {
    const extracted = new Map();"""
new_effect1 = """  useEffect(() => {
    if (teams.length > 0) return; // ONLY INIT ONCE, ignore router.refresh() updates
    const extracted = new Map();"""
content = content.replace(old_effect1, new_effect1)

# Fix the second useEffect dependencies just in case
old_deps = "  }, [revealedIndex, teams.length, allPlayers]);"
new_deps = "  }, [revealedIndex, teams.length, allPlayers.length]);"
content = content.replace(old_deps, new_deps)

# Also let's make the spin a bit faster so they don't get bored.
# 3.5s spin, 2.5s wait = 6s total per pair. Let's make it 2s spin, 2s wait = 4s total.
content = content.replace("const spinDuration = 3500;", "const spinDuration = 2000;")
content = content.replace("}, 2500);", "}, 2000);")

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)

