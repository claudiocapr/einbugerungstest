/**
 * Sprachbausteine Teil 1, sets 1–10: letters and e-mails with gaps [1]–[10],
 * three options each, testing grammar. Written for this app.
 */
import type { Sb1Set } from '../types.ts';
import { g, sb1Set } from './build.ts';

export const sb1a: Sb1Set[] = [
  sb1Set(
    'sb1-01',
    'person',
    `Liebe Sandra,

vielen Dank für deine lange E-Mail! Entschuldige, [1] ich erst heute antworte, aber die letzten Wochen waren sehr stressig. Wie du weißt, bin ich im März nach Hamburg gezogen. Am Anfang habe ich [2] hier ziemlich allein gefühlt, weil ich niemanden kannte. Inzwischen geht es mir aber viel besser. In meinem Haus wohnt eine nette Frau, [3] auch aus Polen kommt. Wir treffen uns oft [4] Kaffee.

Meine neue Arbeit gefällt mir gut, [5] ich manchmal sehr lange im Büro bleiben muss. Am Wochenende gehe ich oft an die Elbe oder in [6] Park in meiner Nähe.

Hast du Lust, mich im Sommer zu besuchen? Ich [7] mich sehr freuen! Du kannst natürlich bei mir schlafen. Schreib mir doch, wann du Urlaub [8].

Und wie geht es dir? Hast du die Prüfung [9]? Ich drücke dir die Daumen!

Viele Grüße, auch an [10] Familie
Kasia`,
    [
      g(['ob', 'dass', 'weil'], 'dass', 'Konnektor: dass-Satz', '„Entschuldige, dass …“: Nach „entschuldigen“ folgt ein dass-Satz. „weil“ nennt einen Grund, „ob“ leitet eine Ja/Nein-Frage ein.', '"Entschuldige, dass …" (sorry that …) takes a dass-clause. "weil" gives a reason, "ob" introduces a yes/no question.'),
      g(['sich', 'mir', 'mich'], 'mich', 'Reflexivpronomen: sich fühlen (Akk.)', '„sich fühlen“ ist reflexiv mit Akkusativ: ich fühle mich. „mir“ ist Dativ, „sich“ passt nur zur 3. Person.', '"sich fühlen" is reflexive with the accusative: ich fühle mich. "mir" is dative; "sich" only fits the 3rd person.'),
      g(['die', 'der', 'das'], 'die', 'Relativpronomen: Nominativ feminin', 'Bezugswort „eine Frau“ (feminin), im Relativsatz Subjekt → „die“.', 'The antecedent "eine Frau" is feminine and the subject of the relative clause → "die".'),
      g(['für', 'zum', 'auf'], 'zum', 'Präposition: sich treffen zu + Dativ', '„sich zum Kaffee treffen“ (zum = zu dem). „auf“ bräuchte einen Artikel („auf einen Kaffee“).', '"sich zum Kaffee treffen" (zum = zu dem). "auf" would need an article ("auf einen Kaffee").'),
      g(['weil', 'trotzdem', 'obwohl'], 'obwohl', 'Konnektor: obwohl + Nebensatz', 'Gegensatz mit Verb am Ende („bleiben muss“) → „obwohl“. „trotzdem“ verlangt Verb auf Position 2, „weil“ passt inhaltlich nicht.', 'Contrast with the verb at the end ("bleiben muss") → "obwohl". "trotzdem" needs the verb in 2nd position; "weil" makes no sense here.'),
      g(['den', 'dem', 'der'], 'den', 'Wechselpräposition: in + Akkusativ (wohin?)', '„gehe in den Park“ – Richtung (wohin?) → Akkusativ, „Park“ ist maskulin → „den“.', '"gehe in den Park" – direction (where to?) → accusative; "Park" is masculine → "den".'),
      g(['wäre', 'würde', 'hätte'], 'würde', 'Konjunktiv II: würde + Infinitiv', '„Ich würde mich sehr freuen“ – würde + Infinitiv „freuen“. „wäre“ und „hätte“ passen nicht zu „mich freuen“.', '"Ich würde mich sehr freuen" – würde + infinitive "freuen". "wäre" and "hätte" do not combine with "mich freuen".'),
      g(['hat', 'bist', 'hast'], 'hast', 'Verbform: haben, 2. Person Singular', 'Subjekt „du“, Urlaub „haben“ → „du hast“. „hat“ ist 3. Person, „bist“ ist von „sein“.', 'Subject "du", "Urlaub haben" → "du hast". "hat" is 3rd person; "bist" is from "sein".'),
      g(['bestanden', 'bestehen', 'besteht'], 'bestanden', 'Perfekt: haben + Partizip II', '„Hast du … bestanden?“ – Perfekt mit „haben“ braucht das Partizip II.', '"Hast du … bestanden?" – the perfect with "haben" needs the past participle.'),
      g(['deiner', 'deine', 'deinen'], 'deine', 'Possessivartikel: an + Akkusativ', '„Grüße an deine Familie“: „an“ + Akkusativ, „Familie“ feminin → „deine“.', '"Grüße an deine Familie": "an" + accusative, "Familie" is feminine → "deine".'),
    ],
  ),
  sb1Set(
    'sb1-02',
    'familie',
    `Lieber Onkel Peter,

ich hoffe, es geht dir und Tante Rosa gut. Ich schreibe dir heute, [1] ich eine große Neuigkeit habe: Anna und ich heiraten im September! Letzten Monat hat Anna mich gefragt, [2] ich sie heiraten möchte. Natürlich habe ich sofort Ja gesagt!

Die Hochzeit findet am 14. September in Annas Heimatdorf statt. Das ist ein kleiner Ort [3] der Nähe von Freiburg. Nach der Trauung feiern wir in einem Gasthaus, [4] Garten direkt am See liegt. Wir würden uns sehr freuen, wenn ihr beide [5] könntet.

Für die Übernachtung haben wir schon ein paar Zimmer in einer Pension reserviert. Ihr müsst [6] also um nichts kümmern. Könntest du mir bis Ende Juni sagen, ob ihr kommt? Dann kann ich die Zimmer fest [7].

Mama hat mir übrigens erzählt, dass du [8] Rücken operiert worden bist. Ich hoffe, du hast keine Schmerzen mehr. Bis September bist du bestimmt wieder fit genug, [9] mit uns zu tanzen!

Liebe Grüße an euch [10]
Dein Michael`,
    [
      g(['denn', 'weil', 'deshalb'], 'weil', 'Konnektor: weil + Nebensatz', 'Grund mit Verb am Ende („habe“) → „weil“. „denn“ verlangt Hauptsatzstellung, „deshalb“ nennt eine Folge.', 'A reason with the verb at the end ("habe") → "weil". "denn" needs main-clause order; "deshalb" introduces a consequence.'),
      g(['ob', 'dass', 'wenn'], 'ob', 'Indirekte Frage: ob', 'Indirekte Ja/Nein-Frage nach „gefragt“ → „ob“.', 'An indirect yes/no question after "gefragt" → "ob".'),
      g(['bei', 'in', 'an'], 'in', 'Feste Wendung: in der Nähe von', 'Die Wendung heißt „in der Nähe von“.', 'The fixed phrase is "in der Nähe von" (near).'),
      g(['deren', 'dem', 'dessen'], 'dessen', 'Relativpronomen: Genitiv (dessen)', '„Ein Gasthaus, dessen Garten …“ – Besitz, Bezugswort „Gasthaus“ ist neutral → „dessen“. „deren“ wäre feminin/Plural.', '"Ein Gasthaus, dessen Garten …" – possession; "Gasthaus" is neuter → "dessen". "deren" would be feminine/plural.'),
      g(['kommt', 'gekommen', 'kommen'], 'kommen', 'Modalverb + Infinitiv', '„wenn ihr … kommen könntet“ – nach dem Modalverb steht der Infinitiv.', '"wenn ihr … kommen könntet" – a modal verb takes the infinitive.'),
      g(['euch', 'sich', 'uns'], 'euch', 'Reflexivpronomen: ihr → euch', '„sich kümmern um“, Subjekt „ihr“ → „ihr müsst euch … kümmern“.', '"sich kümmern um" with the subject "ihr" → "ihr müsst euch … kümmern".'),
      g(['gebucht', 'buchen', 'bucht'], 'buchen', 'Modalverb + Infinitiv', '„Dann kann ich die Zimmer fest buchen“ – Modalverb „kann“ + Infinitiv.', '"Dann kann ich die Zimmer fest buchen" – modal "kann" + infinitive.'),
      g(['am', 'im', 'beim'], 'am', 'Präposition: an + Dativ (Körperteil)', '„am Rücken operiert“ – bei Körperteilen „an“ + Dativ.', '"am Rücken operiert" – body parts take "an" + dative.'),
      g(['damit', 'um', 'für'], 'um', 'Infinitivsatz: genug, um … zu', '„fit genug, um … zu tanzen“ – „um … zu“ + Infinitiv. „damit“ bräuchte ein Subjekt und ein konjugiertes Verb.', '"fit genug, um … zu tanzen" – "um … zu" + infinitive. "damit" would need a subject and a finite verb.'),
      g(['beiden', 'beide', 'beides'], 'beide', 'Indefinitum: euch beide (Akk.)', '„Grüße an euch beide“ – „an“ + Akkusativ, Personen im Plural → „beide“. „beides“ bezieht sich auf Sachen.', '"Grüße an euch beide" – "an" + accusative, plural people → "beide". "beides" refers to things.'),
    ],
  ),
  sb1Set(
    'sb1-03',
    'wohnen',
    `Sehr geehrte Damen und Herren,

ich wohne seit drei Jahren in Ihrem Haus in der Gartenstraße 12 und möchte mich heute [1] ein Problem beschweren. Seit Anfang November funktioniert die Heizung in meiner Wohnung nicht richtig. Obwohl ich die Heizkörper ganz aufdrehe, [2] die Räume nicht wärmer als 16 Grad.

Ich habe den Hausmeister schon zweimal angerufen, [3] leider ist bis heute niemand gekommen. Besonders schwierig ist die Situation für meine kleine Tochter, [4] seit einer Woche erkältet ist.

Ich bitte Sie deshalb, das Problem so schnell [5] möglich zu lösen. Bitte schicken Sie [6] Handwerker, der die Heizung überprüft. Ich bin jeden Tag ab 15 Uhr zu Hause. Sollte das nicht möglich sein, [7] Sie mich bitte vorher an.

Außerdem möchte ich Sie darauf hinweisen, dass ich die Miete für November mindern werde, [8] die Heizung nicht bald repariert wird.

Ich hoffe auf eine schnelle Antwort und bedanke mich [9] Ihnen im Voraus.

Mit freundlichen [10]
Elena Popescu`,
    [
      g(['über', 'auf', 'für'], 'über', 'Verb mit Präposition: sich beschweren über', 'Man beschwert sich „über“ etwas (+ Akkusativ).', 'You complain "über" something (+ accusative).'),
      g(['wird', 'werden', 'wurden'], 'werden', 'Verbform: Plural, Präsens', 'Subjekt „die Räume“ (Plural), Präsens wie „aufdrehe“ → „werden“. „wurden“ ist Vergangenheit.', 'Subject "die Räume" (plural), present tense like "aufdrehe" → "werden". "wurden" is past.'),
      g(['aber', 'denn', 'oder'], 'aber', 'Konnektor: aber (Gegensatz)', 'Gegensatz: angerufen, „aber“ niemand ist gekommen. „denn“ würde einen Grund nennen.', 'Contrast: I called, "aber" nobody came. "denn" would give a reason.'),
      g(['die', 'der', 'deren'], 'die', 'Relativpronomen: Nominativ feminin', 'Bezugswort „Tochter“ (feminin) ist Subjekt im Relativsatz → „die“.', 'Antecedent "Tochter" (feminine) is the subject of the relative clause → "die".'),
      g(['als', 'so', 'wie'], 'wie', 'Vergleich: so … wie möglich', 'Feste Wendung „so schnell wie möglich“. „als“ steht nach dem Komparativ.', 'Fixed phrase "so schnell wie möglich". "als" follows a comparative.'),
      g(['ein', 'einem', 'einen'], 'einen', 'Artikel: Akkusativ maskulin', '„schicken“ + Akkusativ, „Handwerker“ maskulin → „einen“.', '"schicken" + accusative, "Handwerker" is masculine → "einen".'),
      g(['ruf', 'rufen', 'rufe'], 'rufen', 'Imperativ: Sie-Form', 'Höfliche Bitte in der Sie-Form: „rufen Sie mich … an“. „ruf“ ist die du-Form.', 'Polite request in the Sie form: "rufen Sie mich … an". "ruf" is the du form.'),
      g(['ob', 'falls', 'als'], 'falls', 'Konnektor: falls (Bedingung)', 'Bedingung → „falls“ (= wenn). „ob“ leitet eine indirekte Frage ein, „als“ bezieht sich auf die Vergangenheit.', 'A condition → "falls" (= if). "ob" introduces an indirect question; "als" refers to the past.'),
      g(['mit', 'von', 'bei'], 'bei', 'Verb mit Präposition: sich bedanken bei', 'Man bedankt sich „bei“ jemandem (+ Dativ) „für“ etwas.', 'You thank someone with "sich bedanken bei" (+ dative) "für" something.'),
      g(['Grüße', 'Grüßen', 'Gruß'], 'Grüßen', 'Grußformel: mit + Dativ Plural', '„Mit freundlichen Grüßen“ – „mit“ + Dativ Plural → Endung -n.', '"Mit freundlichen Grüßen" – "mit" + dative plural → ending -n.'),
    ],
  ),
  sb1Set(
    'sb1-04',
    'arbeit',
    `Sehr geehrte Frau Dr. Wagner,

auf Ihrer Internetseite habe ich gelesen, dass Ihre Firma Praktikumsplätze im Bereich Marketing anbietet. Ich interessiere mich sehr [1] ein Praktikum in Ihrem Unternehmen.

Zurzeit studiere ich Wirtschaft an der Universität Leipzig. Im Studium habe ich schon viel über Werbung und Kommunikation [2]. Bevor ich nach Deutschland kam, [3] ich zwei Jahre bei einer Werbeagentur in Madrid.

Ich spreche fließend Spanisch und Englisch, und mein Deutsch ist [4] gut, dass ich auch Kundengespräche führen kann. Außerdem kenne ich mich gut mit sozialen Medien [5].

Das Praktikum müsste ich zwischen Juli und September machen, [6] ich in dieser Zeit keine Vorlesungen habe. Könnten Sie mir bitte mitteilen, [7] das Praktikum bezahlt wird?

Meinen Lebenslauf und meine Zeugnisse finden Sie [8] Anhang. Über eine Einladung zu [9] persönlichen Gespräch würde ich mich sehr freuen. Ich freue mich darauf, von Ihnen [10] hören.

Mit freundlichen Grüßen
Lucía Fernández`,
    [
      g(['an', 'für', 'auf'], 'für', 'Verb mit Präposition: sich interessieren für', 'Man interessiert sich „für“ etwas (+ Akkusativ).', 'You are interested in something: "sich interessieren für" (+ accusative).'),
      g(['gelernt', 'gelernt haben', 'lernen'], 'gelernt', 'Perfekt: haben + Partizip II', '„habe … gelernt“ – das Hilfsverb „habe“ steht schon im Satz, es fehlt nur das Partizip II.', '"habe … gelernt" – the auxiliary "habe" is already there; only the participle is missing.'),
      g(['gearbeitet', 'arbeite', 'arbeitete'], 'arbeitete', 'Präteritum', 'Vergangenheit wie „kam“ und kein Hilfsverb im Satz → Präteritum „arbeitete“. „gearbeitet“ bräuchte „habe/hatte“.', 'Past like "kam" and no auxiliary in the clause → simple past "arbeitete". "gearbeitet" would need "habe/hatte".'),
      g(['sehr', 'so', 'zu'], 'so', 'Konsekutiv: so …, dass', '„so gut, dass …“ drückt eine Folge aus. „sehr“ und „zu“ passen nicht zu „dass“.', '"so gut, dass …" expresses a consequence. "sehr" and "zu" do not go with "dass".'),
      g(['aus', 'an', 'ein'], 'aus', 'Trennbares Verb: sich auskennen mit', '„sich mit etwas auskennen“ – das Präfix „aus“ steht am Satzende.', '"sich mit etwas auskennen" (to know a lot about) – the prefix "aus" goes to the end.'),
      g(['denn', 'deshalb', 'weil'], 'weil', 'Konnektor: weil + Nebensatz', 'Grund mit Verb am Ende („habe“) → „weil“. Nach „denn“ stünde das Verb an Position 2.', 'A reason with the verb at the end ("habe") → "weil". After "denn" the verb would be in 2nd position.'),
      g(['dass', 'ob', 'wenn'], 'ob', 'Indirekte Frage: ob', 'Indirekte Ja/Nein-Frage („Wird es bezahlt?“) → „ob“.', 'Indirect yes/no question ("Is it paid?") → "ob".'),
      g(['im', 'in', 'am'], 'im', 'Feste Wendung: im Anhang', 'Man sagt „im Anhang“ (= in dem Anhang).', 'The phrase is "im Anhang" (in the attachment).'),
      g(['einen', 'einer', 'einem'], 'einem', 'Artikel: zu + Dativ neutral', '„zu“ verlangt den Dativ, „Gespräch“ ist neutral → „einem“.', '"zu" takes the dative; "Gespräch" is neuter → "einem".'),
      g(['zu', 'um', 'für'], 'zu', 'Infinitiv mit zu', '„Ich freue mich darauf, von Ihnen zu hören“ – Infinitiv mit „zu“. „um … zu“ würde einen Zweck ausdrücken.', '"Ich freue mich darauf, von Ihnen zu hören" – infinitive with "zu". "um … zu" would express a purpose.'),
    ],
  ),
  sb1Set(
    'sb1-05',
    'ausbildung',
    `Hallo Tom,

wie geht's? Ich muss dir unbedingt von meinem neuen Deutschkurs erzählen! Seit zwei Wochen gehe ich jeden Abend in die Sprachschule, [1] direkt neben meinem Büro liegt. Der Kurs ist ziemlich anstrengend, aber er macht mir [2] Spaß.

Unsere Lehrerin heißt Frau Becker. Sie erklärt alles sehr gut und hat immer Geduld, wenn wir etwas nicht [3]. In meiner Klasse sind zwölf Leute aus zehn Ländern. Mit [4] Teilnehmerin aus Brasilien lerne ich oft zusammen. Sie spricht schon besser Deutsch [5] ich, aber ich helfe ihr bei der Grammatik.

Am schwierigsten finde ich die Artikel. Frau Becker sagt, wir sollen jedes Nomen immer [6] dem Artikel lernen.

Im Juni will ich die B1-Prüfung machen. Wenn ich sie bestehe, [7] ich mich für eine bessere Stelle bewerben. Ich habe aber ein bisschen Angst [8] der Prüfung.

Was machst du eigentlich gerade? Hast du immer noch so viel [9] tun? Ruf mich doch mal an, [10] du Zeit hast.

Bis bald
Ali`,
    [
      g(['der', 'das', 'die'], 'die', 'Relativpronomen: Nominativ feminin', 'Bezugswort „die Sprachschule“ (feminin), Subjekt im Relativsatz → „die“.', 'Antecedent "die Sprachschule" (feminine), subject of the relative clause → "die".'),
      g(['viel', 'viele', 'vielen'], 'viel', 'Mengenwort: viel + Nomen ohne Plural', '„Spaß“ ist hier nicht zählbar → „viel Spaß“ ohne Endung.', '"Spaß" is uncountable here → "viel Spaß" without an ending.'),
      g(['versteht', 'verstehen', 'verstanden'], 'verstehen', 'Verbform: wir, Präsens', 'Subjekt „wir“ im Nebensatz → „verstehen“ am Ende.', 'Subject "wir" in the subordinate clause → "verstehen" at the end.'),
      g(['eine', 'einem', 'einer'], 'einer', 'Artikel: mit + Dativ feminin', '„mit“ verlangt den Dativ, „Teilnehmerin“ ist feminin → „einer“.', '"mit" takes the dative; "Teilnehmerin" is feminine → "einer".'),
      g(['wie', 'als', 'dann'], 'als', 'Vergleich: Komparativ + als', 'Nach dem Komparativ „besser“ steht „als“. „wie“ steht bei Gleichheit (so gut wie).', 'After the comparative "besser" comes "als". "wie" is for equality (so gut wie).'),
      g(['mit', 'bei', 'von'], 'mit', 'Präposition: mit (zusammen)', 'Das Nomen zusammen „mit“ dem Artikel lernen.', 'Learn the noun together "mit" (with) its article.'),
      g(['konnte', 'kann', 'gekonnt'], 'kann', 'Modalverb: Präsens', 'Reale Bedingung in der Zukunft („Wenn ich sie bestehe“) → Präsens „kann“. „konnte“ ist Vergangenheit.', 'A real future condition ("Wenn ich sie bestehe") → present "kann". "konnte" is past.'),
      g(['für', 'vor', 'über'], 'vor', 'Nomen mit Präposition: Angst vor', 'Man hat „Angst vor“ etwas (+ Dativ).', 'You are afraid of something: "Angst vor" (+ dative).'),
      g(['zu', 'um', 'für'], 'zu', 'Wendung: viel zu tun haben', '„viel zu tun haben“ – Infinitiv mit „zu“.', '"viel zu tun haben" (to have a lot to do) – infinitive with "zu".'),
      g(['als', 'wenn', 'ob'], 'wenn', 'Konnektor: wenn (Bedingung/Zeit)', '„Ruf mich an, wenn du Zeit hast“ – Bedingung in der Gegenwart/Zukunft. „als“ nur für einmalige Vergangenheit.', '"Call me when/if you have time" – present/future condition. "als" is only for a single event in the past.'),
    ],
  ),
  sb1Set(
    'sb1-06',
    'gesundheit',
    `Sehr geehrte Damen und Herren,

leider muss ich meinen Termin [1] Donnerstag, den 12. Mai, um 9.30 Uhr absagen. Mein Sohn hat [2] gestern hohes Fieber, und ich muss [3] um ihn kümmern.

Könnten Sie mir bitte einen neuen Termin geben? Am besten wäre es für mich in der nächsten Woche, [4] am Montag oder am Mittwoch. An diesen Tagen arbeite ich erst ab 13 Uhr, [5] ich vormittags gut kommen kann.

Außerdem habe ich noch eine Frage: Bei meinem letzten Besuch hat mir Dr. Krause ein Medikament gegen Rückenschmerzen [6]. Die Tabletten helfen gut, aber ich habe bald keine mehr. Muss ich für ein neues Rezept in die Praxis kommen, oder [7] Sie es mir auch zuschicken?

Ich wäre Ihnen sehr dankbar, [8] Sie mich kurz zurückrufen könnten. Sie erreichen mich am besten [9] Handy unter der Nummer 0176 123 45 67.

Vielen Dank für Ihre [10] und freundliche Grüße
Marta Nowak`,
    [
      g(['an', 'am', 'im'], 'am', 'Zeitangabe: am + Wochentag', 'Vor Wochentagen und Daten steht „am“ (= an dem).', 'Days and dates take "am" (= an dem).'),
      g(['vor', 'ab', 'seit'], 'seit', 'Temporale Präposition: seit', 'Das Fieber begann gestern und dauert noch an → „seit gestern“. „vor gestern“ gibt es nicht, „ab“ bezieht sich auf einen Startpunkt in der Zukunft.', 'The fever started yesterday and is still going on → "seit gestern". "ab" refers to a starting point, usually in the future.'),
      g(['mich', 'mir', 'sich'], 'mich', 'Reflexivpronomen: sich kümmern um', '„sich kümmern um“ ist reflexiv mit Akkusativ: ich muss mich kümmern.', '"sich kümmern um" is reflexive with the accusative: ich muss mich kümmern.'),
      g(['weder', 'entweder', 'sowohl'], 'entweder', 'Doppelkonnektor: entweder … oder', 'Alternative mit „oder“ → „entweder … oder“. „weder“ gehört zu „noch“, „sowohl“ zu „als auch“.', 'An alternative with "oder" → "entweder … oder". "weder" goes with "noch", "sowohl" with "als auch".'),
      g(['sodass', 'deshalb', 'trotzdem'], 'sodass', 'Konnektor: sodass (Folge) + Nebensatz', 'Folge mit Verb am Ende („kommen kann“) → „sodass“. „deshalb“ bräuchte das Verb auf Position 2.', 'A consequence with the verb at the end ("kommen kann") → "sodass". "deshalb" would need the verb in 2nd position.'),
      g(['verschreibt', 'verschreiben', 'verschrieben'], 'verschrieben', 'Perfekt: haben + Partizip II', '„hat … verschrieben“ – Perfekt mit dem Partizip II.', '"hat … verschrieben" – perfect tense with the past participle.'),
      g(['können', 'könnt', 'kann'], 'können', 'Verbform: Sie-Form', 'Subjekt „Sie“ (höflich) → „können Sie“.', 'Subject "Sie" (polite) → "können Sie".'),
      g(['dass', 'wenn', 'ob'], 'wenn', 'Konnektor: wenn (Bedingung) nach „dankbar“', '„Ich wäre dankbar, wenn Sie … könnten“ – höfliche Bitte mit Bedingung.', '"Ich wäre dankbar, wenn Sie … könnten" – a polite request with a condition.'),
      g(['mit', 'per', 'von'], 'per', 'Präposition: per (Kommunikationsmittel)', '„per Handy/Telefon/E-Mail erreichen“ – ohne Artikel steht „per“.', '"per Handy/Telefon/E-Mail erreichen" – without an article you use "per".'),
      g(['helfen', 'geholfen', 'Hilfe'], 'Hilfe', 'Wortart: Nomen nach Artikel', 'Nach „für Ihre“ braucht man ein Nomen: „Hilfe“.', 'After "für Ihre" a noun is needed: "Hilfe".'),
    ],
  ),
  sb1Set(
    'sb1-07',
    'essen',
    `Liebe Jana, lieber Felix,

habt ihr am Samstag, den 8. Juni, schon etwas vor? Wir möchten euch gern [1] Abendessen einladen! Unsere neue Wohnung ist endlich fertig, und wir wollen mit ein paar Freunden feiern.

Paul kocht etwas Besonderes: ein Gericht aus Georgien, [2] er im Urlaub kennengelernt hat. Es ist eine Art Brot mit Käse und Ei. Ich habe es schon probiert – es schmeckt wirklich [3]! Zum Nachtisch mache ich einen Schokoladenkuchen, [4] ihr liebt doch Schokolade.

Felix, du isst doch kein Fleisch, oder? Kein Problem, das ganze Menü ist vegetarisch. Gibt es sonst etwas, [5] ihr nicht esst? Sagt uns bitte Bescheid.

Ihr müsst nichts mitbringen. Wenn ihr wollt, [6] ihr aber eine Flasche Wein mitnehmen. Wir fangen um 19 Uhr an. Mit dem Bus [7] ihr am besten bis zur Haltestelle „Schillerplatz“.

Wir würden uns sehr freuen, [8] ihr kommt! Bitte sagt uns bis Mittwoch, [9] ihr Zeit habt, [10] wir genug einkaufen können.

Liebe Grüße
Clara`,
    [
      g(['zu', 'zum', 'für'], 'zum', 'Verb mit Präposition: einladen zu + Dativ', '„jemanden zum Abendessen einladen“ – „zu“ + Dativ, zusammen mit dem Artikel → „zum“.', '"jemanden zum Abendessen einladen" – "zu" + dative, merged with the article → "zum".'),
      g(['das', 'dem', 'den'], 'das', 'Relativpronomen: Akkusativ neutral', 'Bezugswort „Gericht“ (neutral), im Relativsatz Akkusativobjekt von „kennengelernt“ → „das“.', 'Antecedent "Gericht" (neuter), accusative object of "kennengelernt" → "das".'),
      g(['leckeres', 'lecker', 'leckere'], 'lecker', 'Adjektiv prädikativ (ohne Endung)', 'Nach „schmecken“ steht das Adjektiv ohne Endung: „es schmeckt lecker“.', 'After "schmecken" the adjective has no ending: "es schmeckt lecker".'),
      g(['weil', 'denn', 'deshalb'], 'denn', 'Konnektor: denn + Hauptsatz', 'Danach folgt ein Hauptsatz („ihr liebt doch …“, Verb auf Position 2) → „denn“. Nach „weil“ stünde das Verb am Ende.', 'A main clause follows ("ihr liebt doch …", verb second) → "denn". After "weil" the verb would go last.'),
      g(['was', 'das', 'welches'], 'was', 'Relativpronomen: was nach „etwas“', 'Nach „etwas, alles, nichts“ steht das Relativpronomen „was“.', 'After "etwas, alles, nichts" the relative pronoun is "was".'),
      g(['kann', 'können', 'könnt'], 'könnt', 'Modalverb: ihr-Form', 'Subjekt „ihr“ → „ihr könnt“.', 'Subject "ihr" → "ihr könnt".'),
      g(['fahrt', 'fährt', 'fahren'], 'fahrt', 'Verbform: ihr, Präsens', 'Subjekt „ihr“ → „ihr fahrt“ (ohne Umlaut). „fährt“ ist 3. Person Singular.', 'Subject "ihr" → "ihr fahrt" (no umlaut). "fährt" is 3rd person singular.'),
      g(['ob', 'als', 'wenn'], 'wenn', 'Konnektor: wenn nach „sich freuen“', '„Wir würden uns freuen, wenn ihr kommt.“ – „ob“ leitet eine Frage ein, „als“ bezieht sich auf die Vergangenheit.', '"Wir würden uns freuen, wenn ihr kommt." – "ob" introduces a question; "als" refers to the past.'),
      g(['ob', 'wenn', 'dass'], 'ob', 'Indirekte Frage: ob', '„Sagt uns, ob ihr Zeit habt“ – indirekte Ja/Nein-Frage.', '"Sagt uns, ob ihr Zeit habt" – an indirect yes/no question.'),
      g(['um', 'dass', 'damit'], 'damit', 'Konnektor: damit (Zweck)', 'Zweck mit eigenem Subjekt („wir“) und Verb am Ende → „damit“. „um … zu“ braucht einen Infinitiv.', 'Purpose with its own subject ("wir") and the verb at the end → "damit". "um … zu" needs an infinitive.'),
    ],
  ),
  sb1Set(
    'sb1-08',
    'einkaufen',
    `Sehr geehrte Damen und Herren,

am 3. März habe ich in Ihrem Online-Shop eine Kaffeemaschine [1] Marke „Kaffeeglück“ bestellt. Die Lieferung ist gestern endlich angekommen, [2] leider bin ich sehr enttäuscht.

Erstens war der Karton beschädigt, und zweitens funktioniert die Maschine nicht. [3] ich sie einschalte, leuchtet zwar ein rotes Licht, aber das Wasser wird nicht heiß. Ich habe alles genau so gemacht, [4] es in der Bedienungsanleitung steht.

Außerdem hatten Sie mir eine Lieferung innerhalb von drei Tagen versprochen. Tatsächlich habe ich aber fast zwei Wochen [5] die Maschine gewartet.

Ich möchte die Kaffeemaschine deshalb zurückgeben und bitte Sie, mir den Kaufpreis von 249 Euro [6] erstatten. Eine Kopie der Rechnung finden Sie [7] Anhang. Bitte teilen Sie mir mit, [8] ich das Gerät schicken soll.

Ich hoffe, [9] Sie sich schnell um mein Anliegen kümmern, und erwarte Ihre Antwort bis [10] 20. März.

Mit freundlichen Grüßen
Bernd Hoffmann`,
    [
      g(['die', 'der', 'den'], 'der', 'Artikel: Genitiv feminin', '„eine Kaffeemaschine der Marke …“ – Genitiv, „Marke“ ist feminin → „der“.', '"eine Kaffeemaschine der Marke …" – genitive; "Marke" is feminine → "der".'),
      g(['aber', 'denn', 'sondern'], 'aber', 'Konnektor: aber (Gegensatz)', 'Gegensatz: endlich angekommen, „aber“ enttäuscht. „sondern“ steht nur nach einer Verneinung.', 'Contrast: finally arrived, "aber" disappointed. "sondern" only follows a negation.'),
      g(['Als', 'Ob', 'Wenn'], 'Wenn', 'Konnektor: wenn (Gegenwart/wiederholt)', 'Jedes Mal in der Gegenwart → „wenn“. „als“ nur für ein einmaliges Ereignis in der Vergangenheit.', 'Every time, in the present → "wenn". "als" is only for a single event in the past.'),
      g(['als', 'wie', 'was'], 'wie', 'Vergleich: so …, wie', '„genau so, wie es in der Anleitung steht“ – Vergleich der Art und Weise mit „wie“.', '"genau so, wie es in der Anleitung steht" – comparing the manner with "wie".'),
      g(['für', 'auf', 'an'], 'auf', 'Verb mit Präposition: warten auf', 'Man wartet „auf“ etwas (+ Akkusativ).', 'You wait for something: "warten auf" (+ accusative).'),
      g(['um', 'für', 'zu'], 'zu', 'Infinitiv mit zu nach „bitten“', '„Ich bitte Sie, … zu erstatten“ – nach „bitten“ folgt der Infinitiv mit „zu“, ohne „um“.', '"Ich bitte Sie, … zu erstatten" – "bitten" is followed by "zu" + infinitive, without "um".'),
      g(['im', 'in', 'am'], 'im', 'Feste Wendung: im Anhang', 'Man sagt „im Anhang“.', 'The phrase is "im Anhang" (in the attachment).'),
      g(['wo', 'wohin', 'woher'], 'wohin', 'Fragewort: wohin (Richtung)', '„schicken“ drückt eine Richtung aus → „wohin“.', '"schicken" expresses a direction → "wohin" (where to).'),
      g(['dass', 'ob', 'damit'], 'dass', 'Konnektor: dass nach „hoffen“', '„Ich hoffe, dass …“ – Inhalt der Hoffnung.', '"Ich hoffe, dass …" – the content of the hope.'),
      g(['am', 'zum', 'im'], 'zum', 'Zeitangabe: bis zum + Datum', '„bis zum 20. März“ – „bis“ + „zu“ + Dativ vor einem Datum mit Artikel.', '"bis zum 20. März" – "bis" + "zu" + dative before a date with an article.'),
    ],
  ),
  sb1Set(
    'sb1-09',
    'dienstleistungen',
    `Sehr geehrte Damen und Herren,

leider habe ich gestern meine Geldbörse verloren. Darin [1] auch meine Bankkarte und meine Kreditkarte. Ich habe die Karten sofort telefonisch sperren [2], [3] niemand damit einkaufen kann.

Nun brauche ich neue Karten. Am Telefon hat man mir gesagt, dass ich den Antrag schriftlich stellen muss. Deshalb schreibe ich [4] heute diese E-Mail.

Könnten Sie mir bitte mitteilen, wie lange es dauert, [5] die neuen Karten bei mir ankommen? Wäre es möglich, die Karten an meine Arbeitsadresse zu schicken? Dort bin ich tagsüber, [6] zu Hause leider nie jemand ist.

Außerdem habe ich eine Frage zu [7] Konto. Seit Januar bezahle ich jeden Monat 6,90 Euro Gebühren, obwohl mir bei der Kontoeröffnung ein kostenloses Konto [8] wurde. Können Sie mir erklären, [9] das so ist?

Ich [10] mich über eine baldige Antwort freuen.

Mit freundlichen Grüßen
Yusuf Demir`,
    [
      g(['war', 'waren', 'wart'], 'waren', 'Subjekt-Verb-Kongruenz: Plural', 'Zwei Subjekte („Bankkarte und Kreditkarte“) → Plural „waren“.', 'Two subjects ("Bankkarte und Kreditkarte") → plural "waren".'),
      g(['lassen', 'gelassen', 'lässt'], 'lassen', 'Perfekt von lassen + Infinitiv', '„Ich habe die Karten sperren lassen“ – mit einem zweiten Infinitiv bleibt „lassen“ im Infinitiv.', '"Ich habe die Karten sperren lassen" – with another infinitive, "lassen" stays in the infinitive.'),
      g(['um', 'weil', 'damit'], 'damit', 'Konnektor: damit (Zweck)', 'Zweck mit eigenem Subjekt („niemand“) → „damit“. „um … zu“ bräuchte einen zu-Infinitiv.', 'Purpose with its own subject ("niemand") → "damit". "um … zu" would need a zu-infinitive.'),
      g(['Ihnen', 'Sie', 'Ihr'], 'Ihnen', 'Personalpronomen: Dativ (Sie-Form)', '„jemandem schreiben“ – Dativ → „Ihnen“.', '"jemandem schreiben" – dative → "Ihnen".'),
      g(['seit', 'bis', 'als'], 'bis', 'Konnektor: bis (Zeitpunkt des Endes)', '„Wie lange dauert es, bis …?“ – Ende des Zeitraums.', '"Wie lange dauert es, bis …?" – the end of the time span.'),
      g(['denn', 'weil', 'deshalb'], 'weil', 'Konnektor: weil + Nebensatz', 'Grund mit Verb am Ende („ist“) → „weil“.', 'A reason with the verb at the end ("ist") → "weil".'),
      g(['mein', 'meinen', 'meinem'], 'meinem', 'Possessivartikel: zu + Dativ neutral', '„zu“ verlangt den Dativ, „Konto“ ist neutral → „meinem“.', '"zu" takes the dative; "Konto" is neuter → "meinem".'),
      g(['versprochen', 'versprechen', 'verspricht'], 'versprochen', 'Passiv Präteritum: wurde + Partizip II', '„… ein Konto versprochen wurde“ – Passiv mit „wurde“ + Partizip II.', '"… ein Konto versprochen wurde" – passive with "wurde" + past participle.'),
      g(['wozu', 'warum', 'wofür'], 'warum', 'Fragewort: warum (Grund)', 'Gefragt ist nach dem Grund → „warum“.', 'The question is about the reason → "warum".'),
      g(['wäre', 'würde', 'hätte'], 'würde', 'Konjunktiv II: würde + Infinitiv', '„Ich würde mich … freuen“ – höfliche Form mit „würde“.', '"Ich würde mich … freuen" – polite form with "würde".'),
    ],
  ),
  sb1Set(
    'sb1-10',
    'reisen',
    `Liebe Oma,

viele Grüße aus Portugal! Wir sind jetzt [1] fünf Tagen in Lissabon, und es gefällt uns super. Jeden Tag scheint die Sonne, und es ist [2] wärmer als bei uns in Deutschland.

Unser Hotel liegt mitten in der Altstadt. Von [3] Zimmer aus kann man bis zum Meer sehen. Gestern sind wir mit einer alten Straßenbahn durch die Stadt [4]. Das war toll, auch wenn die Bahn so voll war, [5] wir kaum stehen konnten.

Am Montag haben wir einen Ausflug nach Sintra gemacht. Dort gibt es ein Schloss, [6] Farben wie im Märchen sind – rot, gelb und blau! Am liebsten esse ich hier gegrillten Fisch, Lena mag lieber die süßen Kuchen, [7] es an jeder Ecke gibt.

Am Samstag fliegen wir zurück. Wenn du Zeit hast, besuchen wir dich am Sonntag und zeigen [8] die Fotos. Wir haben dir auch etwas [9]!

Ich hoffe, dass es dir gut geht und dass du [10] nicht einsam fühlst.

Ganz liebe Grüße, auch von Lena
Jonas`,
    [
      g(['vor', 'seit', 'für'], 'seit', 'Temporale Präposition: seit + Dativ', 'Der Aufenthalt hat vor fünf Tagen begonnen und dauert noch → „seit fünf Tagen“.', 'The stay began five days ago and continues → "seit fünf Tagen".'),
      g(['sehr', 'mehr', 'viel'], 'viel', 'Verstärkung des Komparativs: viel', 'Vor einem Komparativ („wärmer“) steht „viel“, nicht „sehr“.', 'Before a comparative ("wärmer") you use "viel", not "sehr".'),
      g(['unserem', 'unserer', 'unseren'], 'unserem', 'Possessivartikel: von + Dativ neutral', '„von“ verlangt den Dativ, „Zimmer“ ist neutral → „unserem“.', '"von" takes the dative; "Zimmer" is neuter → "unserem".'),
      g(['fahren', 'gefahren', 'fährt'], 'gefahren', 'Perfekt: sein + Partizip II', '„sind … gefahren“ – Perfekt mit „sein“ braucht das Partizip II.', '"sind … gefahren" – the perfect with "sein" needs the past participle.'),
      g(['dass', 'als', 'wie'], 'dass', 'Konsekutiv: so …, dass', '„so voll, dass …“ drückt die Folge aus.', '"so voll, dass …" expresses the consequence.'),
      g(['deren', 'dem', 'dessen'], 'dessen', 'Relativpronomen: Genitiv neutral', '„ein Schloss, dessen Farben …“ – Besitz, „Schloss“ ist neutral → „dessen“.', '"ein Schloss, dessen Farben …" – possession; "Schloss" is neuter → "dessen".'),
      g(['die', 'denen', 'deren'], 'die', 'Relativpronomen: Akkusativ Plural', '„die Kuchen, die es … gibt“ – „es gibt“ + Akkusativ, Plural → „die“.', '"die Kuchen, die es … gibt" – "es gibt" takes the accusative, plural → "die".'),
      g(['dich', 'dir', 'du'], 'dir', 'Personalpronomen: Dativ', '„jemandem etwas zeigen“ – die Person steht im Dativ → „dir“.', '"jemandem etwas zeigen" – the person is dative → "dir".'),
      g(['mitgebringt', 'mitbringen', 'mitgebracht'], 'mitgebracht', 'Perfekt: Partizip II (unregelmäßig, trennbar)', '„haben … mitgebracht“ – Partizip II von „mitbringen“ ist unregelmäßig.', '"haben … mitgebracht" – the participle of "mitbringen" is irregular.'),
      g(['dich', 'dir', 'sich'], 'dich', 'Reflexivpronomen: sich fühlen (Akk.)', '„du fühlst dich“ – reflexiv, Akkusativ, 2. Person.', '"du fühlst dich" – reflexive, accusative, 2nd person.'),
    ],
  ),
];
