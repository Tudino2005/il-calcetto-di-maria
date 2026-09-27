const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

code = code.replace(
  'import { Swords, Calendar, Clock, Cpu, Hash, CheckSquare, Square } from "lucide-react";',
  'import { Swords, Calendar, Clock, Cpu, Hash, CheckSquare, Square, Settings, ChevronDown, ChevronUp } from "lucide-react";'
);

fs.writeFileSync('src/components/TournamentForm.tsx', code);
