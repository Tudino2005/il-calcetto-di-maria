import re

with open("src/components/SlotMachineDraw.tsx", "r") as f:
    content = f.read()

# Fix the initial state
old_state = "const [revealedIndex, setRevealedIndex] = useState(-1);"
new_state = "const [revealedIndex, setRevealedIndex] = useState(0);"

content = content.replace(old_state, new_state)

with open("src/components/SlotMachineDraw.tsx", "w") as f:
    f.write(content)
