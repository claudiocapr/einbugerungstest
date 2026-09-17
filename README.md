# Einbürgerungstest

Eine kostenlose Übungs-App für den **Einbürgerungstest** und den Test
**„Leben in Deutschland"** – mit allen 460 amtlichen Fragen, einer
Prüfungssimulation nach den echten Regeln und einem Lernplan, der sich an Ihren
Fehlern orientiert.

Die App läuft vollständig im Browser. Es gibt kein Backend, keine Anmeldung und
keine Tracker; der Lernfortschritt bleibt im `localStorage` des Geräts.

## Funktionen

| | |
|---|---|
| **Prüfung simulieren** | 33 Fragen (30 allgemeine + 3 aus Ihrem Bundesland), 60 Minuten, bestanden ab 17 richtigen Antworten – genau wie in der echten Prüfung. Mit Countdown, Fragenübersicht und Auswertung. |
| **Üben** | Runden zu 20 Fragen mit sofortiger Auflösung und Erklärung, filterbar nach Themenbereich oder Bundesland. |
| **Schwierige Fragen** | Drillt gezielt die Fragen, die Sie falsch beantwortet haben. |
| **Katalog** | Alle Fragen mit Lösung durchsuchen – nach Stichwort oder Fragenummer. |
| **Fortschritt** | Lernstand je Themenbereich, Trefferquote und Prüfungsverlauf. |

Dazu: Deutsch/Englisch umschaltbar (jede Frage samt Antworten ist übersetzt),
heller und dunkler Modus, Tastaturbedienung (`1`–`4` bzw. `A`–`D` zum Antworten,
`←`/`→` zum Blättern) und Offline-Betrieb nach dem ersten Aufruf.

### Wiederholung nach Leitner-System

Jede Frage wandert durch fünf Fächer. Eine richtige Antwort schiebt sie ein Fach
weiter und den nächsten Termin nach hinten (1, 3, 7, 21 Tage), eine falsche
Antwort setzt sie zurück auf Fach 1 und sofort wieder fällig. Geübt wird immer
zuerst, was Sie noch nie gesehen haben, danach das am längsten Überfällige.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # Logik- und Datentests
npm run typecheck
npm run build      # statische Dateien nach dist/
```

`dist/` ist eine rein statische Seite und kann auf jedem Webspace oder über
GitHub Pages / Netlify / Vercel veröffentlicht werden.

## Fragenkatalog

Die Fragen stammen aus dem amtlichen Gesamtfragenkatalog des Bundesamts für
Migration und Flüchtlinge (BAMF): 300 allgemeine Fragen und je 10 Fragen für
jedes der 16 Bundesländer.

Aufbereitet werden sie aus dem Paket
[`@cemusta/burgertest`](https://www.npmjs.com/package/@cemusta/burgertest) (MIT),
das den Katalog samt englischer Übersetzungen und Bildern enthält.
`scripts/build-questions.mjs` erzeugt daraus `src/data/questions.json` und die
Bilder unter `public/images/`:

```bash
npm run data
```

Das Skript normalisiert die Daten, korrigiert die Bundesland-Zuordnung der
Fragen 431–440 (Sachsen-Anhalt, in der Quelle als „Sachsen" geführt), entfernt
Fragenummern aus einzelnen Fragetexten und rechnet die Bilder von 35 MB PNG auf
rund 2,8 MB WebP herunter. Es bricht ab, wenn der Katalog nicht mehr aus 460
Fragen mit je 16 × 10 Landesfragen besteht.

Die erzeugten Dateien sind eingecheckt, ein Build benötigt das Skript also
nicht.

> **Ohne Gewähr.** Verbindlich ist allein der aktuelle Fragenkatalog des BAMF.

## Lizenz

Der Code steht unter der MIT-Lizenz. Der Fragenkatalog ist ein amtliches Werk
des BAMF.
