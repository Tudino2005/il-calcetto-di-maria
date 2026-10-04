import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    old_logic = """    if (revealedCount >= round1Matches.length) {
      if (isFinished) return; // Prevent multiple executions
      const t1 = setTimeout(() => {
        setIsFinished(true);
        // Wait 10 seconds on the final screen before moving to in_progress
        setTimeout(async () => {
          try {
            await finishMatchesDrawAnimation(tournament.id);
          } catch (e) {
            console.error(e);
          } finally {
            window.location.assign(window.location.href);
          }
        }, 10000);
      }, 1000);
      return () => clearTimeout(t1);
    }"""

    new_logic = """    if (revealedCount >= round1Matches.length) {
      if (isFinished) return; // Prevent multiple executions
      const t1 = setTimeout(() => {
        setIsFinished(true);
        // Update DB immediately so refresh won't restart the draw
        finishMatchesDrawAnimation(tournament.id).catch(console.error);
        
        // Wait 10 seconds on the final screen before reloading
        setTimeout(() => {
          window.location.assign(window.location.href);
        }, 10000);
      }, 1000);
      return () => clearTimeout(t1);
    }"""

    content = content.replace(old_logic, new_logic)

    with open(filepath, 'w') as f:
        f.write(content)

patch_file('src/components/MatchesDrawCeremony.tsx')
