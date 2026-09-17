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
| **Zufallsfragen** | Endlosmodus: zufällige Fragen aus Ihrem Katalog, mit laufendem Punktestand, bis Sie aufhören. |
| **Üben** | Runden zu 20 Fragen mit sofortiger Auflösung und Erklärung, filterbar nach Themenbereich oder Bundesland. |
| **Fällige Wiederholungen** | Genau die Fragen, deren Wiederholung heute ansteht. |
| **Schwachstellen** | Drillt die Fragen, die Sie zuletzt falsch oder unsicher beantwortet haben. |
| **Katalog** | Alle Fragen mit Lösung durchsuchen – nach Stichwort, Fragenummer oder Lernstand (schwach / sicher / neu). |
| **Fortschritt** | Stärke je Frage und Themenbereich, Trefferquote, Serie, Tagesziel, Aktivität und Prüfungsverlauf. |

### Was die App über Sie weiß

Jede Antwort wird gespeichert – wann, welche Option Sie gewählt haben und ob
sie richtig war. Die letzten zehn Antworten je Frage bleiben erhalten; im
Katalog und auf der Fortschrittsseite sehen Sie sie als Reihe von ✓ und ✗.

Daraus ergibt sich für jede Frage eine **Stärke** zwischen 0 und 100 %: zu zwei
Dritteln aus den letzten Antworten, wobei die jüngste am schwersten wiegt, und
zu einem Drittel daraus, wie weit die Frage im Leitner-System aufgestiegen ist.
Wird eine Frage lange nicht wiederholt, sinkt ihre Stärke wieder – auch wenn
Sie sie nie falsch beantwortet haben. Die Stärke wird zu fünf Stufen verdichtet:

| Stufe | Bedeutung |
|---|---|
| **Neu** | noch nie beantwortet |
| **Schwach** | zuletzt überwiegend falsch |
| **Wackelig** | unsicher, sitzt noch nicht |
| **Gut** | überwiegend richtig |
| **Sicher** | zuverlässig gewusst |

Die Stärke je Themenbereich bewertet nur die Fragen, die Sie dort schon geübt
haben; wie viel des Bereichs Sie überhaupt gesehen haben, steht separat als
„Geübt: 24/150" daneben. Sonst würde der größte Themenbereich immer am
schwächsten aussehen.

### Empfehlungen

Die Startseite schlägt bis zu drei Sitzungen vor, in dieser Reihenfolge:

1. **Fällige Wiederholungen** – was heute ansteht. Liegen zu lassen macht
   frühere Arbeit zunichte, deshalb steht das ganz oben.
2. **Schwachstellen** – Fragen der Stufen *schwach* und *wackelig*.
3. **Schwächster Themenbereich** – sobald dort genug Fragen beantwortet sind,
   um ihn fair zu vergleichen.
4. **Neue Fragen** – noch nie gesehene Fragen.

Sitzt der ganze Katalog, wird stattdessen eine Prüfung vorgeschlagen. Dazu
zeigt die Startseite eine Serie (aufeinanderfolgende Übungstage) und ein
Tagesziel, das Sie auf der Fortschrittsseite einstellen können.

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

Die Fragen stammen aus dem amtlichen **Gesamtfragenkatalog** des Bundesamts für
Migration und Flüchtlinge (BAMF), **Stand 07.05.2025**: 300 allgemeine Fragen
und je 10 Fragen für jedes der 16 Bundesländer.

`scripts/build-questions.mjs` lädt das
[PDF von bamf.de](https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.html?nn=282388),
liest es mit `scripts/parse-catalogue.mjs` aus und erzeugt daraus
`src/data/questions.json`:

```bash
npm run data              # lädt den Katalog (Cache unter .cache/)
npm run data -- --offline # nur aus dem Cache bauen
```

Der deutsche Wortlaut kommt ausschließlich aus dem PDF. Zwei Dinge stehen
nicht darin und liegen deshalb als eigene, gepflegte Dateien im Repo:

| Datei | Inhalt | Warum |
|---|---|---|
| `data/answers.json` | die 460 richtigen Antworten | Das PDF markiert keine Lösungen: alle 1800 Kästchen sind dasselbe leere Glyph. |
| `data/translations.json` | englischer Text und Erklärungen | Das BAMF veröffentlicht den Katalog nur auf Deutsch. |

Beide Dateien tragen ihre Herkunft als Kommentarfeld in sich. Zum
Antwortschlüssel gehört auch, wie er geprüft wurde – unter anderem gegen den
[interaktiven Fragenkatalog](https://oet.bamf.de/ords/oetut/f?p=514) des BAMF.

Die Bilder unter `public/images/` sind eingecheckt und werden nicht mehr
erzeugt; eine Frage bekommt ihre Bilder über den Dateinamen (`q55.webp` für die
Frage selbst, `q21_1.webp` bis `q21_4.webp` für ihre vier Antworten).

Das Skript bricht ab, wenn der Katalog nicht mehr aus 460 Fragen mit je 16 × 10
Landesfragen besteht, wenn eine Antwort oder Übersetzung fehlt, wenn Wörter
zusammenlaufen – oder wenn das PDF ein anderes *Stand*-Datum trägt als das, für
das die Übersetzungen geschrieben wurden. Der Abbruch ist Absicht: eine neue
Katalogfassung muss geprüft werden, bevor sie übernommen wird.

Die erzeugte `src/data/questions.json` ist eingecheckt, ein Build benötigt das
Skript also nicht.

> **Ohne Gewähr.** Verbindlich ist allein der aktuelle Fragenkatalog des BAMF.

## Lizenz

Der Code steht unter der MIT-Lizenz. Der Fragenkatalog ist ein amtliches Werk
des BAMF.
