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

## Terminologia Obbligatoria
Quando scrivi codice, UI, testi o documenti per questo progetto, devi usare ESATTAMENTE la seguente terminologia:

- **Partita**: Indica la singola partita giocata (quello che nel tennis o in altri sport si chiama "Set"). NON usare mai la parola "Set".
- **Sfida**: Indica l'incontro complessivo, ad esempio un incontro al meglio delle 3 partite (quello che comunemente verrebbe chiamato "Match" o "Partita"). NON usare mai la parola "Match".

## Regola di Feedback Reciproco e Comunicazione
Siamo in una sessione di Pair Programming collaborativo. Per ottimizzare la comunicazione:
1. **Zero Assunzioni**: Se il prompt dell'utente è vago, ambiguo o manca di riferimenti diretti (ad es. ti dice "modifica il bottone" ma non ti dice quale o in quale schermata), NON tirare a indovinare e non rischiare di rompere il codice. Fermati e fagli una domanda esplicita, oppure usa il tool `ask_question` per mostrargli delle opzioni a schermo.
2. **Tip di Comunicazione (Feedback all'Utente)**: Se il prompt dell'utente ha richiesto uno sforzo extra per essere interpretato, alla fine del tuo intervento aggiungi un breve paragrafo (es. 💡 **Tip per i prossimi prompt**) in cui gli suggerisci gentilmente come avrebbe potuto scriverlo in modo più efficace (ad es. suggerendogli il vocabolario tecnico corretto, di indicare un percorso di file, o di fare riferimento a una variabile specifica).
