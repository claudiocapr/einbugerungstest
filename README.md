# telc B1 Trainer

Eine kostenlose Übungs-App für die Prüfung **telc Deutsch B1 / Zertifikat
Deutsch**. Alle Prüfungsteile im echten Format, Wortschatz mit
Karteikarten-System, ein Modelltest nach den offiziellen Bewertungsregeln und
ein Tagesplan von etwa 15 Minuten.

**App öffnen:** https://claudiocapr.github.io/einbugerungstest/

## Was die App kann

| Bereich | Inhalt |
|---|---|
| **Heute** | Ein Plan für etwa 15 Minuten: fällige Wörter, der schwächste Prüfungsteil, abwechselnd Schreiben oder Sprechen. Tagesziel, Serie, Prognose. |
| **Wortschatz** | 650 B1-Wörter und Wendungen in 14 Themen, mit Artikel, Plural, Verbformen, Rektion und Beispielsatz. Karteikarten mit Wiederholung nach Leitner, Vorlesen, Artikel-Trainer, Suche. |
| **Leseverstehen** | Teil 1–3, je 10 Sätze, mit Erklärung zu jeder Antwort und optionalem Prüfungstempo. |
| **Sprachbausteine** | Teil 1 (Grammatik) und Teil 2 (Wortschatz), je 20 Sätze, mit Grammatik-Hinweis zu jeder Lücke. |
| **Hörverstehen** | Teil 1–3, je 8 Sätze, vorgelesen von der deutschen Stimme des Geräts – einmal oder zweimal wie in der Prüfung, mit Lernmodus und Transkript. |
| **Schriftlicher Ausdruck** | 20 E-Mail-Aufgaben (informell und halbformell) mit Wortzähler, Redemitteln, Musterlösung und Selbstbewertung nach den telc-Kriterien. |
| **Mündlicher Ausdruck** | Teil 1–3, je 12 Aufgaben, mit Vorbereitungszeit, Redemitteln, Aufnahme (bleibt auf dem Gerät), Partner-Modus und Musterdialog. |
| **Modelltest** | Die ganze Prüfung mit Zeitlimit. Bewertung wie bei telc: 225 Punkte schriftlich, 75 mündlich, bestanden mit jeweils 60 %. |
| **Fortschritt** | Ergebnisse je Prüfungsteil, Datei sichern und laden, zurücksetzen. |
| **Konto** *(nur auf Einladung)* | Fortschritt auf mehreren Geräten synchronisieren. |
| **telc-Material** *(privat)* | Die offiziellen Übungstests von telc mit digitalem Antwortbogen – nur für freigeschaltete Konten. |

Alle Übungstexte wurden für diese App geschrieben. Sie folgen dem **Format**
von telc Deutsch B1 (Aufgabentypen, Anzahl, Themen, Niveau), sind aber keine
telc-Texte. Originalmaterial von telc liegt nie in diesem öffentlichen
Repository, sondern nur in einem privaten Speicher (siehe `docs/BACKEND.md`).

## Daten und Datenschutz

- Der Lernfortschritt bleibt zuerst im Browser (`localStorage`). Jede Person,
  die die App benutzt, hat ihren eigenen Fortschritt auf ihrem Gerät.
- Unter **Fortschritt** lässt er sich als Datei sichern, auf ein anderes Gerät
  kopieren und dort wieder laden.
- Mit Konto wird er zusätzlich in Supabase gespeichert (nur für das eigene
  Konto lesbar).
- Anonyme Nutzungsstatistik und Fehlerprotokolle (zufällige Geräte-ID, keine
  persönlichen Daten, keine eingegebenen Texte). Abschalten unter **Konto**;
  „Do Not Track“ wird respektiert.

## Entwicklung

```
npm ci
npm run dev        # lokaler Server
npm test           # Tests (Node 22)
npm run typecheck
npm run build      # nach dist/
```

- Aufbau und Regeln: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Supabase, Synchronisation, Statistik, Upload des telc-Materials:
  [`docs/BACKEND.md`](docs/BACKEND.md)
- Planung: [`PLAN-TELC-B1.md`](PLAN-TELC-B1.md)

Jeder Push auf `main` wird über GitHub Actions auf GitHub Pages
veröffentlicht. Es werden nur kostenlose Dienste genutzt (GitHub Pages,
GitHub Actions, Supabase Free, Sprachausgabe des Browsers).

## Hinweis

Kein offizielles Angebot von telc. „telc“ ist eine Marke der telc gGmbH.
Ohne Gewähr.
