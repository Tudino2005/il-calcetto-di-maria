# Piano di Implementazione: Effetto Slot Machine 🎰

## 1. Modifica Database (Stato "drawing")
- Aggiungiamo un nuovo stato transitorio `"drawing"` (Estrazione in corso) per il `status` del torneo.
- Quando l'Admin clicca "Avvia Cerimonia Sorteggio", il torneo passa dallo stato `"setup"` allo stato `"drawing"`. In questo esatto momento, le squadre e il tabellone vengono generati e salvati nel database in background.

## 2. La Pagina TV (Il Componente Animato)
- La pagina TV intercetterà i tornei in stato `"drawing"` e lancerà a schermo intero il nuovo componente `SlotMachineDraw`.
- **L'Animazione**:
  - Estraiamo tutti i giocatori dal database del torneo.
  - Creiamo un layout con due slot rotanti ("Rullo Attaccanti" e "Rullo Portieri", o rullo unico in base alla modalità).
  - L'animazione cicla rapidamente tra i nomi, rallentando fino a fermarsi sulle vere coppie generate precedentemente nel database.
  - Ogni volta che una coppia viene svelata, scatta un effetto visivo (bordo dorato, flash, e posizionamento della squadra finita in una lista a lato).
  - Questo processo si ripete automaticamente per tutte le squadre (es. 4 secondi a squadra).

## 3. Transizione Automatica
- Il componente TV saprà esattamente quante squadre deve svelare. Al termine dell'ultima squadra, l'animazione farà apparire la scritta "TABELLONE COMPLETATO!".
- A quel punto, la TV stessa farà una chiamata silenziosa al server (`finishDraw`) per promuovere il torneo da `"drawing"` a `"in_progress"`.
- Magicamente, la schermata della slot machine sparirà e subentrerà la slide del "Tabellone In Corso" mostrando gli accoppiamenti delle partite!

## 4. Esperienza Admin
- Per l'amministratore (Maria), dopo aver premuto "Avvia", comparirà un avviso sul tablet: *"Animazione del sorteggio in corso sulla TV! Guarda lo schermo!"*
- Se per qualsiasi motivo l'animazione TV si interrompe, l'Admin avrà comunque un pulsante di emergenza "Salta Animazione" per forzare l'avvio del torneo.
