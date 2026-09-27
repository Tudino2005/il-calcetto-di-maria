const fs = require('fs');
let code = fs.readFileSync('src/components/MatchesDrawCeremony.tsx', 'utf8');

const oldEffect = `    if (revealedCount >= round1Matches.length) {
      setTimeout(() => {
        setIsFinished(true);
        // Wait 10 seconds on the final screen before moving to in_progress
        setTimeout(() => {
          finishMatchesDrawAnimation(tournament.id).then(() => {
             window.location.reload();
          });
        }, 10000);
      }, 1000);
      return;
    }`;

const newEffect = `    if (revealedCount >= round1Matches.length) {
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
    }`;

code = code.replace(oldEffect, newEffect);
fs.writeFileSync('src/components/MatchesDrawCeremony.tsx', code);
