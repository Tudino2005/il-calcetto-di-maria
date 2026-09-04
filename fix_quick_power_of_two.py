import re

with open("src/components/QuickTournamentForm.tsx", "r") as f:
    content = f.read()

# Replace handleSubmit
old_logic = """  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (type === "coppie_fisse") {
      const validPairs = fixedPairs.filter(p => p.length === 2);
      if (validPairs.length < 2) {
        alert("Devi formare almeno 2 squadre (4 giocatori) per avviare un torneo.");
        return;
      }
      if (fixedPairs.some(p => p.length === 1)) {
        alert("Ci sono giocatori spaiati! Completa o rimuovi le coppie incomplete.");
        return;
      }
    } else {
      if (selectedPlayers.length < 4) {
        alert("Seleziona almeno 4 giocatori per avviare un torneo.");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);"""

new_logic = """  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const format = formData.get("format") as string;
    
    if (type === "coppie_fisse") {
      const validPairs = fixedPairs.filter(p => p.length === 2);
      if (validPairs.length < 2) {
        alert("Devi formare almeno 2 squadre (4 giocatori) per avviare un torneo.");
        return;
      }
      if (fixedPairs.some(p => p.length === 1)) {
        alert("Ci sono giocatori spaiati! Completa o rimuovi le coppie incomplete.");
        return;
      }
      if (format !== "gironi_eliminazione") {
        if (Math.log2(validPairs.length) % 1 !== 0) {
          alert(`ERRORE: Per l'eliminazione diretta, il numero di squadre deve essere 2, 4, 8, 16. Attualmente hai formato ${validPairs.length} squadre. Modifica il numero di squadre o cambia il formato in Gironi.`);
          return;
        }
      }
    } else {
      if (selectedPlayers.length < 4) {
        alert("Seleziona almeno 4 giocatori per avviare un torneo.");
        return;
      }
      if (selectedPlayers.length % 2 !== 0) {
        alert("Seleziona un numero pari di giocatori per formare le squadre.");
        return;
      }
      const teamCount = selectedPlayers.length / 2;
      if (format !== "gironi_eliminazione") {
        if (Math.log2(teamCount) % 1 !== 0) {
          alert(`ERRORE: Per l'eliminazione diretta, il numero di squadre deve essere una potenza di 2 (es. 4, 8, 16, 32 giocatori). Attualmente hai selezionato ${selectedPlayers.length} giocatori (${teamCount} squadre).`);
          return;
        }
      }
    }
    
    setIsSubmitting(true);"""

content = content.replace(old_logic, new_logic)

with open("src/components/QuickTournamentForm.tsx", "w") as f:
    f.write(content)
