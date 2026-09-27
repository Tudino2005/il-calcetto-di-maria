const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

if (!code.includes('import { TVDoubleEliminationBracket }')) {
  code = code.replace(
    'import { InwardBracket } from "./InwardBracket";',
    'import { InwardBracket } from "./InwardBracket";\nimport { TVDoubleEliminationBracket } from "./TVDoubleEliminationBracket";'
  );
}

const targetStr = `<BracketWithSpotlight rounds={rounds} tournament={t} matchProbs={matchProbs} />`;
const replacementStr = `{t.format === "doppia_eliminazione" ? (
                <TVDoubleEliminationBracket tournament={t} />
              ) : (
                <BracketWithSpotlight rounds={rounds} tournament={t} matchProbs={matchProbs} />
              )}`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
