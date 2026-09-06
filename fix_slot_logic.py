import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# 1. Prevent reshuffling
old_effect = """  useEffect(() => {
    const extracted = new Map();"""
new_effect = """  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    const extracted = new Map();"""

content = content.replace(old_effect, new_effect)

old_dep = """    setAllPlayers(Array.from(playersMap.values()));
  }, [tournament]);"""
new_dep = """    setAllPlayers(Array.from(playersMap.values()));
    setInitialized(true);
  }, [tournament, initialized]);"""

content = content.replace(old_dep, new_dep)

# 2. Adjust timings
content = content.replace("const spinDuration = 3500;", "const spinDuration = 2000;")
content = content.replace("}, 70);", "}, 150);")
content = content.replace("}, 2500);", "}, 2000);")

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
