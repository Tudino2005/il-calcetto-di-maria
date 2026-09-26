import re

with open('src/components/MatchesDrawCeremony.tsx', 'r') as f:
    content = f.read()

# Replace the router.refresh() logic with window.location.reload()
old_logic = """          finishMatchesDrawAnimation(tournament.id).then(() => {
             router.refresh();
             router.push("/");
          });"""

new_logic = """          finishMatchesDrawAnimation(tournament.id).then(() => {
             window.location.reload();
          });"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Patched with window.location.reload()!")
else:
    print("Could not find the router.refresh() logic!")

with open('src/components/MatchesDrawCeremony.tsx', 'w') as f:
    f.write(content)
