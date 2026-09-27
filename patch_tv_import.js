const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

code = code.replace(
  'import { BracketWithSpotlight } from "@/components/BracketWithSpotlight";',
  'import { BracketWithSpotlight } from "@/components/BracketWithSpotlight";\nimport { TVDoubleEliminationBracket } from "@/components/TVDoubleEliminationBracket";'
);

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
