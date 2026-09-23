# Foosball Tracker: Domain Context

## Tournament Types
- **I TORNEI (Tornei Classici):** Questi tornei si svolgono su un periodo lungo (es. settimane o mesi). Le funzionalità progettate per questa sezione (iscrizioni, overbooking, pagamenti) devono tenere conto di tempi dilatati, partite asincrone e gestione a lungo termine.
- **Torneo Volante:** Eventi rapidi "da bar" che si esauriscono in una singola sera.

## TV Dashboard UI Rules
- **No Scrolling:** Le slide destinate alla TV (es. componenti in `TVSlideshow`) non devono **mai** mostrare barre di scorrimento (scrollbar) o richiedere interazioni. La TV non ha un mouse.
- **Soluzioni Consentite:** Se i contenuti eccedono l'altezza dello schermo:
  1. Nascondi visivamente la scrollbar (es. `scrollbar-width: none`).
  2. Implementa scorrimenti automatici (animazioni CSS).
  3. Splitta i contenuti su più slide temporizzate.
