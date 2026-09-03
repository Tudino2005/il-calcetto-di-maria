import re

with open("src/components/QuickTournamentForm.tsx", "r") as f:
    content = f.read()

# Fix container classes
content = content.replace(
    '"cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95"',
    '"cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95",\n                  !pairColorValue && colorClass'
)

# Fix circle classes
content = content.replace(
    '"w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors"',
    '"w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors",\n                    !pairColorValue && circleClass'
)

# Fix name classes
content = content.replace(
    'className="font-bold"',
    'className={clsx("font-bold", !pairColorValue && nameClass)}'
)

# Fix the inline styles for unselected items so they don't override the classes!
# Specifically, we should NOT apply inline styles if pairColorValue is empty.
content = content.replace(
    'style={pairColorValue ? { backgroundColor: pairColorValue, color: "#fff" } : { backgroundColor: "#1e293b", color: "#94a3b8" }}',
    'style={pairColorValue ? { backgroundColor: pairColorValue, color: "#fff" } : {}}'
)

content = content.replace(
    'style={pairColorValue ? { color: "#fff" } : { color: "#94a3b8" }}',
    'style={pairColorValue ? { color: "#fff" } : {}}'
)

with open("src/components/QuickTournamentForm.tsx", "w") as f:
    f.write(content)
