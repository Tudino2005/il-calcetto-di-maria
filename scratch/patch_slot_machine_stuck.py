import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Save immediately when all slots revealed
    old_reveal_logic = """    if (revealedIndex >= teams.length && teams.length > 0 && showcaseIndex === -1 && introState !== "pre_showcase_intro") {
       // All slots revealed, wait a moment then start showcase
       const timeout = setTimeout(() => {
         setIntroState("pre_showcase_intro");
       }, 3000);
       return () => clearTimeout(timeout);
    }"""

    new_reveal_logic = """    if (revealedIndex >= teams.length && teams.length > 0 && showcaseIndex === -1 && introState !== "pre_showcase_intro") {
       // All slots revealed, wait a moment then start showcase
       const timeout = setTimeout(() => {
         // Eagerly update DB so refresh doesn't restart it
         finishDrawAnimation(tournament.id).catch(console.error);
         setIntroState("pre_showcase_intro");
       }, 3000);
       return () => clearTimeout(timeout);
    }"""

    # 2. Update the audio onEnded to just reload
    content = content.replace(
        """onEnded={() => finishDrawAnimation(tournament.id).then(() => window.location.reload())}""",
        """onEnded={() => window.location.reload()}"""
    )

    content = content.replace(old_reveal_logic, new_reveal_logic)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/SlotMachineDraw.tsx')
