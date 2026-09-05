import re

with open("src/app/tournaments/[id]/promo/page.tsx", "r") as f:
    content = f.read()

# Update getTypeDescription
old_type = """  const getTypeDescription = () => {
    switch (tournament.type) {
      case "sorteggio_ruoli": return "Sorteggio per Ruoli. Le coppie saranno estratte bilanciando un attaccante e un portiere.";
      case "sorteggio_integrale": return "Sorteggio Integrale. Composizione puramente casuale senza vincoli di ruolo.";
      case "coppie_fisse": return "Coppie Fisse. Iscriviti con il tuo compagno.";
      default: return "";
    }
  };"""

new_type = """  const getTypeDescription = () => {
    switch (tournament.type) {
      case "sorteggio_ruoli": return "Sorteggio per Ruoli. L'algoritmo formerà le coppie bilanciando un attaccante e un portiere. Chi seleziona 'Entrambi' farà da jolly.";
      case "sorteggio_integrale": return "Sorteggio Integrale. Sorteggio totalmente cieco. La fortuna decide il tuo compagno senza vincoli di ruolo.";
      case "coppie_fisse": return "Coppie Fisse. Le squadre sono già decise, iscriviti insieme al tuo compagno storico.";
      default: return "";
    }
  };"""

content = content.replace(old_type, new_type)

# Update getFormatDescription
old_format = """  const getFormatDescription = () => {
    switch (tournament.format) {
      case "eliminazione_diretta": return "Eliminazione Diretta. Chi perde è fuori, chi vince avanza fino alla finale.";
      case "doppia_eliminazione": return "Doppia Eliminazione. Tabellone vincenti e perdenti. Chi perde ha una seconda chance.";
      case "gironi_eliminazione": return "Fase a Gironi + Eliminazione. Partite garantite nel girone, poi playoff per i migliori.";
      default: return "";
    }
  };"""

new_format = """  const getFormatDescription = () => {
    switch (tournament.format) {
      case "eliminazione_diretta": return "Eliminazione Diretta a scontro diretto. Nessun appello: chi vince avanza fino alla finale, chi perde è fuori definitivamente.";
      case "doppia_eliminazione": return "Doppia Eliminazione (Winners e Losers Bracket). Ogni squadra ha due vite! Chi perde la prima volta finisce nel girone di recupero.";
      case "gironi_eliminazione": return "Fase a Gironi + Playoff. Ogni squadra affronterà tutte le altre del proprio girone. Le prime classificate accedono alle finali.";
      default: return "";
    }
  };"""

content = content.replace(old_format, new_format)

with open("src/app/tournaments/[id]/promo/page.tsx", "w") as f:
    f.write(content)
