/**
 * Sprachbausteine Teil 2, sets 1–10: a text with gaps [1]–[10] and 15 words
 * a–o; each word fits at most once, five are left over. Written for this app.
 */
import type { Sb2Set } from '../types.ts';
import { sb2Set } from './build.ts';

export const sb2a: Sb2Set[] = [
  sb2Set(
    'sb2-01',
    'reisen',
    `Sehr geehrte Frau Berger,

in einer Reisezeitschrift habe ich Ihre Anzeige für die Ferienwohnungen am Lindsee gelesen und interessiere mich sehr [1] eine Wohnung für zwei Wochen im August.

Wir sind eine Familie mit zwei Kindern im [2] von 5 und 9 Jahren. Am liebsten hätten wir eine Wohnung mit zwei Schlafzimmern und einem Balkon. Ist so eine Wohnung vom 3. bis 17. August noch [3]?

In Ihrer Anzeige steht, dass es in der Nähe einen See gibt. Kann man dort auch mit kleinen Kindern [4]? Gibt es außerdem die Möglichkeit, Fahrräder zu [5]?

Bitte teilen Sie mir auch mit, ob die Endreinigung schon im Preis [6] ist oder ob wir sie extra bezahlen müssen.

Wir würden gern mit unserem Hund kommen. Er ist schon alt und sehr ruhig. Wäre das ein [7]?

Ich wäre Ihnen sehr [8], wenn Sie mir bald antworten könnten, [9] wir möglichst schnell buchen möchten. Könnten Sie mir außerdem einen Prospekt mit Fotos [10]?

Mit freundlichen Grüßen
Thomas Wendt`,
    ['Alter', 'an', 'baden', 'da', 'dankbar', 'deshalb', 'enthalten', 'frei', 'für', 'gezahlt', 'Größe', 'leihen', 'obwohl', 'Problem', 'schicken'],
    [
      ['für', '„sich interessieren für“ – feste Präposition. „an“ passt nur zu „Interesse an“.', '"sich interessieren für" – fixed preposition. "an" only goes with the noun "Interesse an".'],
      ['Alter', '„im Alter von … Jahren“ – feste Wendung. „Größe“ ist feminin und passt nicht zu „im“.', '"im Alter von … Jahren" – fixed phrase. "Größe" is feminine and does not fit "im".'],
      ['frei', '„Ist die Wohnung noch frei?“ = noch nicht vermietet.', '"Ist die Wohnung noch frei?" = still available.'],
      ['baden', '„mit Kindern baden“ – im See schwimmen.', '"mit Kindern baden" – to swim/bathe in the lake.'],
      ['leihen', '„Fahrräder leihen“ = für kurze Zeit benutzen.', '"Fahrräder leihen" = to hire/borrow bikes.'],
      ['enthalten', '„im Preis enthalten sein“ – feste Verbindung. „gezahlt“ passt nicht zu „im Preis … ist“.', '"im Preis enthalten sein" (included in the price) – fixed phrase. "gezahlt" does not fit.'],
      ['Problem', '„Wäre das ein Problem?“ – höfliche Frage nach Erlaubnis.', '"Wäre das ein Problem?" – a polite request for permission.'],
      ['dankbar', '„Ich wäre Ihnen dankbar, wenn …“ – höfliche Bitte.', '"Ich wäre Ihnen dankbar, wenn …" – a polite request.'],
      ['da', 'Grund mit Verb am Ende („möchten“) → „da“ (= weil). „deshalb“ verlangt Verb auf Position 2, „obwohl“ passt inhaltlich nicht.', 'A reason with the verb at the end ("möchten") → "da" (= because). "deshalb" needs verb-second; "obwohl" makes no sense.'],
      ['schicken', '„jemandem einen Prospekt schicken“.', '"to send someone a brochure".'],
    ],
  ),
  sb2Set(
    'sb2-02',
    'arbeit',
    `Sehr geehrter Herr Kühn,

mit großem Interesse habe ich Ihre [1] in der „Rheinpost“ vom 12. Mai gelesen. Sie suchen eine Bürokauffrau in Teilzeit, und ich möchte mich [2] diese Stelle bewerben.

Ich habe vor fünf Jahren meine Ausbildung bei einer Spedition [3] und danach drei Jahre in der Buchhaltung gearbeitet. Seit der Geburt meiner Tochter bin ich in [4]. Nun möchte ich gern wieder arbeiten, [5] zunächst nur vormittags, weil meine Tochter nachmittags noch betreut werden muss.

Ich arbeite gern im Team, bin zuverlässig und kann gut mit dem Computer [6]. Außerdem habe ich gute [7] in Englisch und Französisch.

Gern würde ich mich Ihnen in einem persönlichen Gespräch [8]. Meinen Lebenslauf und meine Zeugnisse finden Sie im [9].

Ich freue mich [10], von Ihnen zu hören.

Mit freundlichen Grüßen
Jelena Marković`,
    ['abgeschlossen', 'allerdings', 'Anhang', 'Anzeige', 'Artikel', 'auf', 'Beilage', 'darauf', 'Elternzeit', 'kennen', 'Kenntnisse', 'treffen', 'umgehen', 'vorstellen', 'worauf'],
    [
      ['Anzeige', '„Ihre Anzeige“ – Stellenanzeige in der Zeitung, feminin wie „Ihre“. „Artikel“ ist maskulin.', '"Ihre Anzeige" – job ad in the paper, feminine like "Ihre". "Artikel" is masculine.'],
      ['auf', '„sich auf eine Stelle bewerben“.', '"sich auf eine Stelle bewerben" (apply for a job).'],
      ['abgeschlossen', '„eine Ausbildung abschließen“ = erfolgreich beenden; Perfekt mit „habe“.', '"eine Ausbildung abschließen" = complete training; perfect tense with "habe".'],
      ['Elternzeit', '„in Elternzeit sein“ – nach der Geburt eines Kindes eine Zeit lang nicht arbeiten.', '"in Elternzeit sein" – on parental leave after a child\'s birth.'],
      ['allerdings', '„allerdings“ schränkt die Aussage ein (= aber).', '"allerdings" limits the statement (= but, however).'],
      ['umgehen', '„mit dem Computer umgehen können“ = ihn gut benutzen können. „kennen“ passt nicht zu „mit“.', '"mit dem Computer umgehen können" = to be able to use it well. "kennen" does not go with "mit".'],
      ['Kenntnisse', '„gute Kenntnisse in Englisch“ = gutes Wissen.', '"gute Kenntnisse in Englisch" = good knowledge of English.'],
      ['vorstellen', '„sich jemandem vorstellen“ – sich im Gespräch präsentieren.', '"sich jemandem vorstellen" – to introduce/present yourself.'],
      ['Anhang', '„im Anhang“ der E-Mail. „Beilage“ ist feminin und passt nicht zu „im“.', '"im Anhang" (in the attachment). "Beilage" is feminine and does not fit "im".'],
      ['darauf', '„sich darauf freuen, … zu …“ – „darauf“ kündigt den Infinitivsatz an. „worauf“ ist ein Fragewort.', '"sich darauf freuen, … zu …" – "darauf" points to the infinitive clause. "worauf" is a question word.'],
    ],
  ),
  sb2Set(
    'sb2-03',
    'wohnen',
    `Liebe Hausbewohnerinnen und Hausbewohner,

wie Sie vielleicht schon [1] haben, wird ab dem 1. Juni das Treppenhaus renoviert. Die Arbeiten [2] voraussichtlich drei Wochen. In dieser Zeit kann es leider manchmal laut werden. Wir bitten Sie dafür um [3].

Während der Renovierung darf der Aufzug nicht [4] werden. Wenn Sie Hilfe beim Tragen von schweren Einkäufen brauchen, melden Sie sich bitte beim Hausmeister, Herrn Gül.

Bitte stellen Sie in dieser Zeit keine Schuhe, Fahrräder oder Kinderwagen im Treppenhaus [5]. Die Maler brauchen den ganzen Platz. Kinderwagen können Sie [6] im Keller abstellen.

Außerdem möchten wir Sie an die Hausordnung [7]: Die Mülltonnen werden jeden Dienstag geleert. Bitte stellen Sie sie am Montagabend an die Straße und [8] sie am Dienstag wieder zurück.

Bei Fragen können Sie sich jederzeit an die Hausverwaltung [9]. Sie erreichen uns montags bis freitags von 9 bis 12 Uhr [10] der Nummer 0221 45 67 89.

Mit freundlichen Grüßen
Ihre Hausverwaltung Kramer`,
    ['ab', 'benutzt', 'dauern', 'dauert', 'erinnern', 'erinnert', 'gehört', 'holen', 'mit', 'solange', 'unter', 'Verständnis', 'wann', 'wenden', 'wohin'],
    [
      ['gehört', '„wie Sie vielleicht schon gehört haben“ – Perfekt mit „haben“.', '"as you may already have heard" – perfect with "haben".'],
      ['dauern', 'Subjekt „die Arbeiten“ (Plural) → „dauern“. „dauert“ wäre Singular.', 'Subject "die Arbeiten" (plural) → "dauern". "dauert" would be singular.'],
      ['Verständnis', '„um Verständnis bitten“ – feste Wendung.', '"um Verständnis bitten" (ask for understanding) – fixed phrase.'],
      ['benutzt', 'Passiv: „darf nicht benutzt werden“.', 'Passive: "darf nicht benutzt werden" (must not be used).'],
      ['ab', '„etwas abstellen“ – trennbares Verb: „stellen … ab“.', '"etwas abstellen" (put down/leave) – separable verb: "stellen … ab".'],
      ['solange', '„solange“ = in dieser Zeit. „wann“ und „wohin“ sind Fragewörter und passen nicht.', '"solange" = in the meantime. "wann" and "wohin" are question words and do not fit.'],
      ['erinnern', '„jemanden an etwas erinnern“ – nach „möchten“ der Infinitiv.', '"jemanden an etwas erinnern" (remind someone of) – infinitive after "möchten".'],
      ['holen', '„die Tonnen zurückholen“ – „holen … zurück“.', '"die Tonnen zurückholen" (bring the bins back) – "holen … zurück".'],
      ['wenden', '„sich an jemanden wenden“ = jemanden fragen/kontaktieren.', '"sich an jemanden wenden" = to contact someone.'],
      ['unter', '„unter der Nummer …“ erreichbar – feste Wendung.', '"unter der Nummer …" (on/at the number) – fixed phrase.'],
    ],
  ),
  sb2Set(
    'sb2-04',
    'gesundheit',
    `Liebe Katrin,

vielen Dank für deine Karte! Ich habe mich sehr darüber [1]. Inzwischen geht es mir schon viel besser. Die Operation am Knie ist gut [2], und ich darf seit gestern wieder ein bisschen laufen.

Das Krankenhaus war in Ordnung, nur das Essen hat mir überhaupt nicht [3]. Zum Glück hat mir mein Mann jeden Tag etwas Leckeres [4].

Jetzt muss ich noch sechs Wochen lang zweimal pro Woche zur Krankengymnastik. Die Übungen sind ziemlich [5], aber die Physiotherapeutin ist sehr nett und motiviert mich. Wenn ich fleißig übe, kann ich im Sommer vielleicht wieder Tennis spielen. Darauf freue ich mich am [6]!

Bis dahin bin ich noch krankgeschrieben. Mir ist oft langweilig, weil ich nicht viel [7] kann. Hast du nicht Lust, mich mal zu [8]? Wir könnten zusammen Kaffee trinken und ein bisschen [9].

Ruf mich doch an, wenn du Zeit hast. Ich bin fast immer zu Hause.

Liebe Grüße und bis [10]
Sabine`,
    ['anrufen', 'anstrengend', 'bald', 'besuchen', 'erholt', 'Freude', 'gefreut', 'gestern', 'geschmeckt', 'Hunger', 'meisten', 'mitgebracht', 'reden', 'unternehmen', 'verlaufen'],
    [
      ['gefreut', '„sich über etwas freuen“ – Perfekt: „habe mich … gefreut“.', '"sich über etwas freuen" – perfect: "habe mich … gefreut".'],
      ['verlaufen', '„Die Operation ist gut verlaufen“ = ohne Probleme.', '"Die Operation ist gut verlaufen" = it went well.'],
      ['geschmeckt', '„Das Essen hat mir nicht geschmeckt“ – passt zu Essen.', '"Das Essen hat mir nicht geschmeckt" (I didn\'t like the taste) – goes with food.'],
      ['mitgebracht', '„jemandem etwas mitbringen“ – Perfekt „hat … mitgebracht“.', '"jemandem etwas mitbringen" (bring someone something) – perfect "hat … mitgebracht".'],
      ['anstrengend', '„ziemlich anstrengend, aber …“ – das „aber“ zeigt den Gegensatz zu „nett“.', '"ziemlich anstrengend, aber …" – "aber" shows the contrast with "nett".'],
      ['meisten', '„sich am meisten freuen“ – Superlativ von „viel“.', '"sich am meisten freuen" – superlative of "viel".'],
      ['unternehmen', '„nicht viel unternehmen können“ = nicht viel machen/ausgehen.', '"nicht viel unternehmen können" = can\'t do/go out much.'],
      ['besuchen', '„Lust haben, mich zu besuchen“. „anrufen“ bräuchte die Form „anzurufen“.', '"Lust haben, mich zu besuchen". "anrufen" would need the form "anzurufen".'],
      ['reden', '„ein bisschen reden“ = sich unterhalten.', '"ein bisschen reden" = to chat a little.'],
      ['bald', '„Bis bald!“ – Gruß am Ende.', '"Bis bald!" (see you soon) – closing phrase.'],
    ],
  ),
  sb2Set(
    'sb2-05',
    'freizeit',
    `Liebe Mitglieder des Wandervereins Grünental,

in diesem Jahr feiert unser Verein sein 25-jähriges [1]. Aus diesem [2] laden wir Sie herzlich zu unserem Sommerfest am Samstag, dem 15. Juli, ein. Das Fest [3] ab 14 Uhr auf der Wiese hinter dem Vereinsheim statt.

Für die Kinder gibt es ein buntes [4] mit Spielen, Kinderschminken und einer Schatzsuche. Um 16 Uhr zeigt unser Vorsitzender Fotos aus 25 Jahren Vereinsgeschichte. Am Abend spielt die Band „Bergklang“ zum [5] auf.

Für Essen und Getränke ist gesorgt. Wir würden uns aber freuen, wenn Sie einen Kuchen oder einen Salat [6] könnten. Bitte tragen Sie sich dafür in die Liste im Vereinsheim [7].

Außerdem suchen wir noch Helferinnen und Helfer, die beim Aufbau [8] können. Wer Zeit hat, melde sich bitte bei Frau Ott.

Das Fest findet bei jedem [9] statt. Wenn es regnet, feiern wir im großen Saal des Vereinsheims.

Wir freuen uns auf einen schönen Tag mit [10]!
Ihr Vorstand`,
    ['Anlass', 'aus', 'backen', 'ein', 'findet', 'Geburtstag', 'Ihnen', 'Jubiläum', 'mitbringen', 'mithelfen', 'Musik', 'Programm', 'Sie', 'Tanz', 'Wetter'],
    [
      ['Jubiläum', '„sein 25-jähriges Jubiläum“ – neutral wie „sein … -es“. „Geburtstag“ ist maskulin.', '"sein 25-jähriges Jubiläum" (anniversary) – neuter like "sein … -es". "Geburtstag" is masculine.'],
      ['Anlass', '„aus diesem Anlass“ = deshalb, zu diesem Ereignis.', '"aus diesem Anlass" = on this occasion.'],
      ['findet', '„Das Fest findet … statt“ – trennbares Verb „stattfinden“.', '"Das Fest findet … statt" – separable verb "stattfinden" (take place).'],
      ['Programm', '„ein buntes Programm“ – neutral, passt zu „buntes“.', '"ein buntes Programm" (a varied programme) – neuter, matches "buntes".'],
      ['Tanz', '„zum Tanz aufspielen“ = Musik zum Tanzen machen. „Musik“ ist feminin und passt nicht zu „zum“.', '"zum Tanz aufspielen" = play music for dancing. "Musik" is feminine and does not fit "zum".'],
      ['mitbringen', '„einen Kuchen oder Salat mitbringen“. Einen Salat kann man nicht „backen“.', '"bring a cake or a salad". You cannot "bake" a salad.'],
      ['ein', '„sich in eine Liste eintragen“ – trennbares Verb: „tragen … ein“.', '"sich in eine Liste eintragen" (put your name down) – separable: "tragen … ein".'],
      ['mithelfen', '„beim Aufbau mithelfen“ = helfen.', '"beim Aufbau mithelfen" = help with setting up.'],
      ['Wetter', '„bei jedem Wetter“ = auch wenn es regnet.', '"bei jedem Wetter" = whatever the weather.'],
      ['Ihnen', '„mit“ + Dativ → „mit Ihnen“. „Sie“ ist Akkusativ/Nominativ.', '"mit" + dative → "mit Ihnen". "Sie" is accusative/nominative.'],
    ],
  ),
  sb2Set(
    'sb2-06',
    'einkaufen',
    `Sehr geehrte Damen und Herren,

vor zwei Wochen habe ich in Ihrem Geschäft in der Königstraße einen Staubsauger der [1] „Saugfix“ gekauft. Leider bin ich mit dem Gerät überhaupt nicht [2].

Schon nach wenigen Tagen hat der Staubsauger sehr laute Geräusche gemacht, und seit gestern [3] er gar nicht mehr. Ich habe ihn genau so benutzt, wie es in der [4] beschrieben ist.

Als ich das Gerät zurückbringen wollte, hat mir der Verkäufer gesagt, dass ich es [5] an den Hersteller schicken muss. Das finde ich nicht in Ordnung, denn ich habe den Staubsauger bei Ihnen gekauft. Außerdem hat der Verkäufer sehr [6] reagiert und mir kaum zugehört.

Ich habe noch zwei Jahre [7] auf das Gerät. Deshalb bitte ich Sie, mir entweder einen neuen Staubsauger zu geben oder mir das Geld [8]. Eine Kopie des Kassenbons [9] ich diesem Brief bei.

Ich erwarte Ihre Antwort [10] zum 30. April.

Mit freundlichen Grüßen
Klaus Reinhardt`,
    ['Bedienungsanleitung', 'bis', 'funktioniert', 'Garantie', 'Kunden', 'lege', 'Marke', 'schicke', 'seit', 'selbst', 'Typ', 'unfreundlich', 'zufrieden', 'zurückzahlen', 'zurückzuzahlen'],
    [
      ['Marke', '„ein Gerät der Marke …“ – feminin wie „der“ (Genitiv). „Typ“ ist maskulin.', '"ein Gerät der Marke …" (of the brand) – feminine like "der" (genitive). "Typ" is masculine.'],
      ['zufrieden', '„mit etwas zufrieden sein“.', '"mit etwas zufrieden sein" (be satisfied with).'],
      ['funktioniert', '„er funktioniert nicht mehr“ = er geht nicht mehr.', '"er funktioniert nicht mehr" = it no longer works.'],
      ['Bedienungsanleitung', '„wie es in der Bedienungsanleitung beschrieben ist“.', '"as described in the operating instructions".'],
      ['selbst', '„es selbst an den Hersteller schicken“ = ohne Hilfe des Geschäfts.', '"send it to the manufacturer myself" = without the shop\'s help.'],
      ['unfreundlich', 'Kritik am Verkäufer, „kaum zugehört“ → „unfreundlich“.', 'Criticism of the salesman, "hardly listened" → "unfreundlich" (unfriendly).'],
      ['Garantie', '„Garantie auf ein Gerät haben“.', '"Garantie auf ein Gerät haben" (have a guarantee on).'],
      ['zurückzuzahlen', 'Parallel zu „zu geben“: Infinitiv mit „zu“ → „zurückzuzahlen“. „zurückzahlen“ fehlt das „zu“.', 'Parallel to "zu geben": infinitive with "zu" → "zurückzuzahlen". "zurückzahlen" lacks the "zu".'],
      ['lege', '„etwas einem Brief beilegen“ – „lege … bei“. „beischicken“ gibt es nicht.', '"etwas einem Brief beilegen" (enclose) – "lege … bei". "beischicken" does not exist.'],
      ['bis', '„bis zum 30. April“ = spätestens an diesem Tag. „seit“ bezieht sich auf die Vergangenheit.', '"bis zum 30. April" = by 30 April. "seit" refers to the past.'],
    ],
  ),
  sb2Set(
    'sb2-07',
    'dienstleistungen',
    `Neu im Bürgeramt: Termine online buchen

Wer einen neuen Personalausweis braucht oder nach einem Umzug seine neue Adresse [1] muss, musste bisher oft lange im Bürgeramt warten. Das soll jetzt anders werden. Ab dem 1. März können Bürgerinnen und Bürger ihren Termin bequem im Internet [2].

Auf der Internetseite der Stadt wählt man zuerst das [3], zum Beispiel „Reisepass beantragen“. Dann sieht man alle freien Termine der nächsten vier Wochen. Nach der Buchung bekommt man eine E-Mail mit allen wichtigen Informationen: Welche [4] muss man mitbringen? Wie viel kostet der Ausweis?

Wer keinen Computer hat, kann natürlich auch weiterhin [5] einen Termin vereinbaren. Unter der Nummer 115 helfen Mitarbeiterinnen und Mitarbeiter bei der Buchung.

Wichtig: Wer seinen Termin nicht wahrnehmen kann, sollte ihn rechtzeitig [6], damit andere Bürger ihn nutzen können.

In den ersten Wochen [7] das Bürgeramt zusätzlich am Samstagvormittag geöffnet, um die vielen Anfragen zu [8]. Die Stadt [9], dass die Wartezeiten dadurch deutlich kürzer werden. Bisher mussten Bürger [10] bis zu drei Stunden im Wartebereich sitzen.`,
    ['abgeben', 'absagen', 'anmelden', 'Anliegen', 'Antrag', 'bearbeiten', 'buchen', 'Geld', 'hofft', 'ist', 'manchmal', 'online', 'sind', 'telefonisch', 'Unterlagen'],
    [
      ['anmelden', '„eine neue Adresse anmelden“ = beim Amt melden.', '"eine neue Adresse anmelden" = register a new address.'],
      ['buchen', '„einen Termin buchen“ – passt auch zur Überschrift.', '"einen Termin buchen" (book an appointment) – also in the headline.'],
      ['Anliegen', '„das Anliegen“ (neutral) = das, was man erledigen möchte. „Antrag“ ist maskulin.', '"das Anliegen" (neuter) = your concern/request. "Antrag" is masculine.'],
      ['Unterlagen', '„Welche Unterlagen muss man mitbringen?“ = Dokumente. „Geld“ steht nicht im Plural.', '"Which documents do you have to bring?" "Geld" is not plural.'],
      ['telefonisch', 'Ohne Computer → „telefonisch“ (Nummer 115). „online“ ist das Gegenteil.', 'Without a computer → "telefonisch" (by phone, number 115). "online" is the opposite.'],
      ['absagen', '„einen Termin absagen“, damit andere ihn nutzen können.', '"einen Termin absagen" (cancel) so others can use it.'],
      ['ist', 'Subjekt „das Bürgeramt“ (Singular): „ist … geöffnet“. „sind“ wäre Plural.', 'Subject "das Bürgeramt" (singular): "ist … geöffnet". "sind" would be plural.'],
      ['bearbeiten', '„Anfragen bearbeiten“ = sich um sie kümmern.', '"Anfragen bearbeiten" = deal with requests.'],
      ['hofft', '„Die Stadt hofft, dass …“.', '"Die Stadt hofft, dass …" (the city hopes that …).'],
      ['manchmal', '„manchmal bis zu drei Stunden … sitzen“ = ab und zu.', '"sometimes sit (wait) for up to three hours".'],
    ],
  ),
  sb2Set(
    'sb2-08',
    'ausbildung',
    `Liebe Kursteilnehmerinnen und Kursteilnehmer,

herzlich willkommen im Kurs „Deutsch B1 – Prüfungsvorbereitung“! Wir freuen uns, dass Sie sich [1] uns entschieden haben.

Der Kurs [2] am Montag, dem 4. September, und endet mit der Prüfung am 15. Dezember. Der Unterricht findet immer montags und mittwochs von 18 bis 20.15 Uhr im [3] 204 statt.

Bitte bringen Sie zur ersten Stunde das [4] „Ziel B1“ mit. Sie können es in jeder Buchhandlung kaufen oder in unserem Sekretariat [5].

Regelmäßige Teilnahme ist sehr wichtig. Wenn Sie einmal nicht kommen können, [6] Sie bitte Ihrer Kursleiterin Bescheid.

Die Prüfungsgebühr ist nicht in der Kursgebühr [7]. Sie beträgt 180 Euro und muss bis spätestens 1. November [8] werden.

Wenn Sie Fragen haben, können Sie sich jederzeit an uns [9]. Unser Sekretariat ist montags bis freitags von 9 bis 16 Uhr [10].

Wir wünschen Ihnen viel Erfolg!
Ihre Volkshochschule Talstadt`,
    ['beginnt', 'bestellen', 'bezahlt', 'damit', 'enthalten', 'für', 'geben', 'gemacht', 'geöffnet', 'Klasse', 'Kurs', 'Lehrbuch', 'Raum', 'wenden', 'wohin'],
    [
      ['für', '„sich für etwas entscheiden“.', '"sich für etwas entscheiden" (decide on).'],
      ['beginnt', '„Der Kurs beginnt … und endet …“.', '"The course begins … and ends …".'],
      ['Raum', '„im Raum 204“ – maskulin passt zu „im“. „Klasse“ ist feminin.', '"im Raum 204" – masculine fits "im". "Klasse" is feminine.'],
      ['Lehrbuch', '„das Lehrbuch „Ziel B1““ – neutral wie „das“. „Kurs“ ist maskulin.', '"das Lehrbuch …" – neuter like "das". "Kurs" is masculine.'],
      ['bestellen', '„ein Buch im Sekretariat bestellen“.', '"order a book at the office".'],
      ['geben', '„jemandem Bescheid geben“ = informieren.', '"jemandem Bescheid geben" = let someone know.'],
      ['enthalten', '„in der Kursgebühr enthalten sein“ = schon dabei sein.', '"in der Kursgebühr enthalten sein" = included in the course fee.'],
      ['bezahlt', 'Passiv: „muss … bezahlt werden“.', 'Passive: "muss … bezahlt werden" (must be paid).'],
      ['wenden', '„sich an jemanden wenden“ = jemanden fragen.', '"sich an jemanden wenden" = contact someone.'],
      ['geöffnet', '„Das Sekretariat ist … geöffnet“.', '"The office is open …".'],
    ],
  ),
  sb2Set(
    'sb2-09',
    'familie',
    `Liebe Lisa,

ich hoffe, dir und deiner Familie geht es gut! Ich schreibe dir, weil ich eine große [1] an dich habe.

Am 20. Oktober feiern meine Eltern ihre goldene Hochzeit. Sie sind dann schon 50 Jahre [2]! Wir möchten ihnen eine Überraschung machen und haben alle Verwandten zu einem großen Fest in einem Restaurant [3]. Meine Eltern wissen noch nichts davon.

Das Problem ist: Die Feier geht bis spät in die Nacht, und meine Kinder müssen um acht Uhr ins Bett. Könntest du vielleicht an diesem Abend auf sie [4]? Natürlich nur, wenn du Zeit hast. Die Kinder [5] dich ja schon und freuen sich immer, wenn du kommst.

Ich würde die beiden um 19 Uhr zu dir bringen. Sie könnten bei dir [6], und ich hole sie am nächsten Morgen ab. Ihre Schlafanzüge und ihre Lieblingsbücher [7] ich mit. Als kleines Dankeschön [8] ich dich nächste Woche zum Essen ein.

Bitte gib mir bis Ende der Woche [9], ob es klappt. Falls es bei dir nicht geht, ist das natürlich kein Problem. [10] frage ich meine Nachbarin.

Tausend Dank schon mal und liebe Grüße
Merve`,
    ['aufpassen', 'aufräumen', 'Bescheid', 'Bitte', 'bringe', 'dann', 'eingeladen', 'geheiratet', 'kennen', 'lade', 'lädt', 'übernachten', 'verheiratet', 'wissen', 'Wunsch'],
    [
      ['Bitte', '„eine große Bitte an jemanden haben“ – feminin wie „eine große“. „Wunsch“ ist maskulin.', '"eine große Bitte an jemanden haben" (a big favour to ask) – feminine like "eine große". "Wunsch" is masculine.'],
      ['verheiratet', '„50 Jahre verheiratet sein“. „geheiratet“ beschreibt nur den Tag der Hochzeit.', '"50 Jahre verheiratet sein" (married for 50 years). "geheiratet" only describes the wedding day.'],
      ['eingeladen', '„jemanden zu einem Fest einladen“ – Perfekt „haben … eingeladen“.', '"jemanden zu einem Fest einladen" – perfect "haben … eingeladen".'],
      ['aufpassen', '„auf jemanden aufpassen“ = betreuen.', '"auf jemanden aufpassen" = look after someone.'],
      ['kennen', '„jemanden kennen“ – Personen kennt man, Fakten „weiß“ man.', '"jemanden kennen" – you "kennen" people, you "wissen" facts.'],
      ['übernachten', '„bei jemandem übernachten“ = dort schlafen.', '"bei jemandem übernachten" = stay the night.'],
      ['bringe', '„etwas mitbringen“ – „bringe … mit“, 1. Person.', '"etwas mitbringen" – "bringe … mit", 1st person.'],
      ['lade', '„jemanden einladen“ – Subjekt „ich“ → „lade … ein“. „lädt“ ist 3. Person.', '"jemanden einladen" – subject "ich" → "lade … ein". "lädt" is 3rd person.'],
      ['Bescheid', '„jemandem Bescheid geben“ = informieren.', '"jemandem Bescheid geben" = let someone know.'],
      ['dann', '„Dann frage ich …“ = in diesem Fall.', '"Dann frage ich …" = in that case I\'ll ask …'],
    ],
  ),
  sb2Set(
    'sb2-10',
    'umwelt',
    `Weniger Plastik im Alltag – so geht's

Jedes Jahr [1] in Deutschland rund drei Millionen Tonnen Plastikverpackungen weggeworfen. Nur ein Teil davon wird [2] recycelt. Dabei kann jeder mit ein paar einfachen Tipps viel Müll [3].

Nehmen Sie zum Einkaufen immer eine Stofftasche mit. Obst und Gemüse können Sie lose kaufen und in kleinen Netzen [4], statt Plastiktüten zu benutzen.

Auch beim Getränkekauf können Sie etwas für die Umwelt tun: Kaufen Sie Mehrwegflaschen [5] Einwegflaschen. Noch besser ist Leitungswasser – es ist in Deutschland von sehr guter [6] und viel billiger.

Viele Supermärkte füllen Käse und Wurst an der Theke auch in [7] eigene Dosen. Fragen Sie einfach nach!

Kaffee zum Mitnehmen ist sehr [8], aber die Becher landen nach wenigen Minuten im Müll. Mit einem eigenen Becher sparen Sie oft auch Geld: Viele Cafés geben dafür einen [9] von 10 bis 20 Cent.

Und zum Schluss: Werfen Sie Plastik nicht in den Restmüll, sondern in die gelbe Tonne. Nur so [10] es wiederverwertet werden.`,
    ['beliebt', 'Geschmack', 'kann', 'mitgebracht', 'mitgebrachte', 'Qualität', 'Rabatt', 'Rechnung', 'statt', 'tatsächlich', 'transportieren', 'trotz', 'vermeiden', 'werden', 'worden'],
    [
      ['werden', 'Passiv Präsens: „werden … weggeworfen“, Subjekt Plural („Tonnen“). „worden“ gehört zum Perfekt.', 'Present passive: "werden … weggeworfen", plural subject ("Tonnen"). "worden" belongs to the perfect.'],
      ['tatsächlich', '„tatsächlich recycelt“ = wirklich, in der Realität.', '"tatsächlich recycelt" = actually recycled.'],
      ['vermeiden', '„Müll vermeiden“ = keinen Müll entstehen lassen.', '"Müll vermeiden" = avoid producing waste.'],
      ['transportieren', '„in Netzen transportieren“ = nach Hause bringen.', '"carry them home in nets".'],
      ['statt', '„Mehrweg statt Einweg“ = an Stelle von. „trotz“ ergibt keinen Sinn.', '"reusable instead of single-use" = "statt". "trotz" makes no sense.'],
      ['Qualität', '„von sehr guter Qualität“ – feminin wie „guter“. „Geschmack“ ist maskulin.', '"von sehr guter Qualität" – feminine like "guter". "Geschmack" is masculine.'],
      ['mitgebrachte', 'Adjektiv vor dem Nomen mit Endung: „in mitgebrachte eigene Dosen“ (Akk. Plural). „mitgebracht“ hat keine Endung.', 'Adjective before a noun needs an ending: "in mitgebrachte eigene Dosen" (acc. plural). "mitgebracht" has no ending.'],
      ['beliebt', '„sehr beliebt, aber …“ = viele Leute mögen es.', '"very popular, but …".'],
      ['Rabatt', '„einen Rabatt von 10 bis 20 Cent geben“ = Preisnachlass. „Rechnung“ ist feminin.', '"give a discount of 10 to 20 cents". "Rechnung" is feminine.'],
      ['kann', '„Nur so kann es wiederverwertet werden“ – Modalverb + Passiv.', '"Only then can it be recycled" – modal + passive.'],
    ],
  ),
];
