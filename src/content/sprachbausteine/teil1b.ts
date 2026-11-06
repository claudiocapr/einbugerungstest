/**
 * Sprachbausteine Teil 1, sets 11–20. Written for this app.
 */
import type { Sb1Set } from '../types.ts';
import { g, sb1Set } from './build.ts';

export const sb1b: Sb1Set[] = [
  sb1Set(
    'sb1-11',
    'freizeit',
    `Hi Mehmet,

danke für deine Nachricht! Natürlich erinnere ich mich [1] unseren Ausflug zum Bodensee letztes Jahr. Das war wirklich ein tolles Wochenende!

Du hast gefragt, was ich in meiner Freizeit mache. Seit Oktober spiele ich in einem Volleyballverein. Die Leute im Verein sind total nett, und [2] Training gehen wir oft noch zusammen etwas trinken. Am Anfang war ich ziemlich schlecht, aber inzwischen spiele ich schon [3] besser.

Nächsten Samstag spielen wir gegen eine Mannschaft, [4] letztes Jahr Meister geworden ist. Ich bin schon sehr nervös!

Hättest du nicht Lust, mal zu einem Training [5]? Ich bin sicher, [6] es dir gefallen würde. Wir suchen noch Spieler, weil zwei Leute [7] einer Verletzung pausieren müssen.

Und was machst du so? Spielst du immer noch Gitarre? Ich würde gern mal [8] Band hören!

Melde [9] doch, wenn du Zeit hast. Vielleicht können wir uns [10] Wochenende treffen?

Viele Grüße
Jan`,
    [
      g(['auf', 'an', 'für'], 'an', 'Verb mit Präposition: sich erinnern an', 'Man erinnert sich „an“ etwas (+ Akkusativ).', 'You remember something: "sich erinnern an" (+ accusative).'),
      g(['nachdem', 'nach dem', 'danach'], 'nach dem', 'Präposition vs. Konnektor: nach dem + Nomen', 'Vor einem Nomen („Training“) steht die Präposition „nach dem“. „nachdem“ leitet einen Nebensatz ein, „danach“ steht allein.', 'Before a noun ("Training") you need the preposition "nach dem". "nachdem" introduces a clause; "danach" stands alone.'),
      g(['mehr', 'sehr', 'viel'], 'viel', 'Verstärkung des Komparativs: viel', 'Vor „besser“ (Komparativ) steht „viel“. „sehr besser“ ist falsch.', 'Before "besser" (comparative) you use "viel". "sehr besser" is wrong.'),
      g(['die', 'der', 'das'], 'die', 'Relativpronomen: Nominativ feminin', 'Bezugswort „Mannschaft“ (feminin) ist Subjekt → „die“.', 'Antecedent "Mannschaft" (feminine) is the subject → "die".'),
      g(['mitkommen', 'mitzukommen', 'mitgekommen'], 'mitzukommen', 'Infinitiv mit zu (trennbares Verb)', '„Lust haben, … mitzukommen“ – Infinitiv mit „zu“; bei trennbaren Verben steht „zu“ in der Mitte.', '"Lust haben, … mitzukommen" – infinitive with "zu"; with separable verbs "zu" goes in the middle.'),
      g(['dass', 'ob', 'wenn'], 'dass', 'Konnektor: dass nach „sicher sein“', '„Ich bin sicher, dass …“ – Inhalt der Aussage. „ob“ würde Unsicherheit ausdrücken.', '"Ich bin sicher, dass …" – the content of the statement. "ob" would express uncertainty.'),
      g(['trotz', 'wegen', 'statt'], 'wegen', 'Präposition: wegen + Genitiv (Grund)', 'Grund für die Pause → „wegen einer Verletzung“. „trotz“ wäre ein Gegensatz.', 'The reason for the break → "wegen einer Verletzung". "trotz" would be a contrast.'),
      g(['deiner', 'deinen', 'deine'], 'deine', 'Possessivartikel: Akkusativ feminin', '„hören“ + Akkusativ, „Band“ ist feminin → „deine“.', '"hören" + accusative; "Band" is feminine → "deine".'),
      g(['dich', 'dir', 'sich'], 'dich', 'Reflexivpronomen: sich melden (Akk.)', '„Melde dich“ – reflexiv, Imperativ in der du-Form.', '"Melde dich" – reflexive, du-form imperative.'),
      g(['im', 'am', 'zum'], 'am', 'Zeitangabe: am Wochenende', 'Man sagt „am Wochenende“.', 'The phrase is "am Wochenende".'),
    ],
  ),
  sb1Set(
    'sb1-12',
    'medien',
    `Sehr geehrte Redaktion,

mit großem Interesse habe ich Ihren Artikel „Kinder und Handys“ vom 15. Oktober gelesen. Ich bin Mutter von zwei Kindern im Alter [1] 9 und 13 Jahren und kenne das Problem gut.

In Ihrem Artikel schreiben Sie, dass Eltern ihren Kindern erst mit 14 Jahren ein Smartphone kaufen [2]. Ich finde diese Forderung nicht realistisch. In der Klasse meines Sohnes hat fast jedes Kind ein Handy. Wer keins hat, gehört nicht dazu, [3] alle Informationen über Chatgruppen verschickt werden.

Natürlich sehe ich auch die Gefahren. Viele Kinder verbringen zu viel Zeit [4] Bildschirm und schlafen zu wenig. Deshalb haben wir klare Regeln: Nach 20 Uhr bleiben alle Handys in der Küche, auch [5] von uns Eltern. Außerdem sprechen wir regelmäßig darüber, [6] die Kinder im Internet sehen.

Meiner Meinung nach ist ein Verbot nicht die Lösung. Wichtiger wäre es, [7] die Schulen den Kindern zeigen, wie man das Handy sinnvoll benutzt. Leider wird das an vielen Schulen noch nicht [8].

Ich würde mich freuen, [9] Sie zu diesem Thema auch einmal die Meinung [10] Eltern und Lehrern veröffentlichen würden.

Mit freundlichen Grüßen
Sabine Kraus`,
    [
      g(['von', 'mit', 'zu'], 'von', 'Feste Wendung: im Alter von', 'Die Wendung heißt „im Alter von … Jahren“.', 'The phrase is "im Alter von … Jahren" (aged …).'),
      g(['sollte', 'solltet', 'sollten'], 'sollten', 'Modalverb: Plural (Konjunktiv II als Rat)', 'Subjekt „Eltern“ (Plural) → „sollten“.', 'Subject "Eltern" (plural) → "sollten".'),
      g(['denn', 'weil', 'deshalb'], 'weil', 'Konnektor: weil + Nebensatz', 'Grund mit Verb am Ende („verschickt werden“) → „weil“.', 'A reason with the verb at the end ("verschickt werden") → "weil".'),
      g(['im', 'vom', 'am'], 'am', 'Präposition: am Bildschirm', 'Man sitzt oder verbringt Zeit „am Bildschirm“ (an + Dativ).', 'You spend time "am Bildschirm" (at the screen; an + dative).'),
      g(['deren', 'die', 'denen'], 'die', 'Demonstrativpronomen: die (= die Handys)', '„auch die von uns Eltern“ = auch die Handys von uns Eltern → „die“ (Nominativ Plural).', '"auch die von uns Eltern" = also the phones of us parents → "die" (nominative plural).'),
      g(['was', 'das', 'dass'], 'was', 'Indirekte Frage: was', '„sprechen darüber, was die Kinder sehen“ – indirekte W-Frage („Was sehen sie?“).', '"talk about what the children see" – an indirect wh-question ("What do they see?").'),
      g(['ob', 'dass', 'damit'], 'dass', 'Konnektor: dass (Inhalt)', '„Wichtiger wäre es, dass die Schulen … zeigen“ – „es“ wird durch den dass-Satz erklärt.', '"Wichtiger wäre es, dass die Schulen … zeigen" – "es" is explained by the dass-clause.'),
      g(['gemacht', 'machen', 'macht'], 'gemacht', 'Passiv Präsens: wird + Partizip II', '„wird … nicht gemacht“ – Passiv braucht das Partizip II.', '"wird … nicht gemacht" – the passive needs the past participle.'),
      g(['ob', 'wenn', 'dass'], 'wenn', 'Konnektor: wenn nach „ich würde mich freuen“', '„Ich würde mich freuen, wenn Sie … würden“ – höflicher Wunsch.', '"Ich würde mich freuen, wenn Sie … würden" – a polite wish.'),
      g(['von', 'aus', 'bei'], 'von', 'Präposition: von + Dativ (Zugehörigkeit)', '„die Meinung von Eltern und Lehrern“ – „von“ + Dativ statt Genitiv.', '"die Meinung von Eltern und Lehrern" – "von" + dative instead of the genitive.'),
    ],
  ),
  sb1Set(
    'sb1-13',
    'umwelt',
    `Liebe Mia,

stell dir vor, ich habe mein Auto verkauft! Jetzt fahre ich jeden Tag mit dem Fahrrad zur Arbeit, [1] es regnet. Die Strecke ist zwölf Kilometer lang. Mit dem Auto war ich wegen der vielen Staus auch nicht [2] schneller.

Am Anfang war es ganz schön anstrengend, aber inzwischen bin ich viel fitter [3] vorher. Außerdem spare ich jeden Monat fast 300 Euro. Davon habe ich mir ein richtig [4] E-Bike gekauft.

Seit Kurzem bin ich auch Mitglied in einer Umweltgruppe. Wir treffen uns einmal im Monat und überlegen, [5] wir in unserem Stadtteil etwas für die Umwelt tun können. Letzten Samstag haben wir zum Beispiel am Flussufer Müll [6]. Du glaubst nicht, wie viel da lag!

Im Mai organisieren wir einen Tauschmarkt, [7] man Kleidung, Bücher und Spielzeug tauschen kann. Hättest du Lust, [8] zu helfen?

Ich würde [9] freuen, bald wieder von dir zu hören. Wie geht es [10] Kindern?

Herzliche Grüße
Lukas`,
    [
      g(['weil', 'auch wenn', 'wenn'], 'auch wenn', 'Konnektor: auch wenn (Einräumung)', '„jeden Tag …, auch wenn es regnet“ = sogar bei Regen. „wenn es regnet“ widerspricht „jeden Tag“, „weil“ ergibt keinen Sinn.', '"every day …, auch wenn es regnet" = even when it rains. "wenn" contradicts "every day"; "weil" makes no sense.'),
      g(['sehr', 'mehr', 'viel'], 'viel', 'Verstärkung des Komparativs: viel', '„nicht viel schneller“ – vor dem Komparativ steht „viel“.', '"nicht viel schneller" – before a comparative you use "viel".'),
      g(['als', 'wie', 'dann'], 'als', 'Vergleich: Komparativ + als', 'Nach „fitter“ (Komparativ) folgt „als“.', 'After "fitter" (comparative) comes "als".'),
      g(['guten', 'gutes', 'guter'], 'gutes', 'Adjektivendung: ein + Akkusativ neutral', '„ein … E-Bike“ (neutral, Akkusativ) → „ein gutes E-Bike“.', '"ein … E-Bike" (neuter, accusative) → "ein gutes E-Bike".'),
      g(['welche', 'wie', 'worüber'], 'wie', 'Indirekte Frage: wie', '„überlegen, wie wir etwas tun können“ – Frage nach der Art und Weise.', '"think about how we can do something" – a question about the manner.'),
      g(['sammeln', 'gesammelten', 'gesammelt'], 'gesammelt', 'Perfekt: haben + Partizip II', '„haben … Müll gesammelt“ – Partizip II ohne Endung.', '"haben … Müll gesammelt" – past participle without an ending.'),
      g(['wo', 'wohin', 'was'], 'wo', 'Relativadverb: wo (Ort)', '„einen Tauschmarkt, wo man … tauschen kann“ – Ort ohne Bewegung → „wo“.', '"a swap market where you can swap …" – a place without movement → "wo".'),
      g(['unser', 'uns', 'unseren'], 'uns', 'Personalpronomen: Dativ', '„jemandem helfen“ – Dativ → „uns“.', '"jemandem helfen" – dative → "uns".'),
      g(['mich', 'mir', 'dich'], 'mich', 'Reflexivpronomen: sich freuen (Akk.)', '„ich würde mich freuen“ – reflexiv mit Akkusativ.', '"ich würde mich freuen" – reflexive with the accusative.'),
      g(['deine', 'deinem', 'deinen'], 'deinen', 'Possessivartikel: Dativ Plural', '„Wie geht es + Dativ?“ – „Kindern“ ist Dativ Plural → „deinen“.', '"Wie geht es + dative?" – "Kindern" is dative plural → "deinen".'),
    ],
  ),
  sb1Set(
    'sb1-14',
    'gesellschaft',
    `Sehr geehrter Herr Schuster,

in der Zeitung habe ich gelesen, dass Ihr Verein Menschen sucht, [1] älteren Nachbarn im Alltag helfen. Ich würde mich gern als Helferin [2].

Ich heiße Amina Yilmaz, bin 34 Jahre alt und arbeite in Teilzeit in einer Apotheke. Da ich nur vormittags arbeite, habe ich nachmittags genug Zeit, [3] mich ehrenamtlich zu engagieren. Ich habe auch schon Erfahrung [4] diesem Bereich: Zwei Jahre lang habe ich meine Großmutter gepflegt, bis sie [5] Pflegeheim gezogen ist.

Ich könnte zum Beispiel Einkäufe erledigen, ältere Menschen zum Arzt begleiten oder einfach Zeit [6] ihnen verbringen. Ein Auto habe ich leider nicht, [7] ich fahre gern mit dem Fahrrad.

Bevor ich anfange, hätte ich noch ein paar Fragen: Wie viele Stunden pro Woche [8] man mindestens helfen? Gibt es eine Versicherung für die Helfer? Und muss ich vorher an einer Schulung [9]?

Ich würde mich freuen, wenn Sie [10] bei mir melden würden.

Mit freundlichen Grüßen
Amina Yilmaz`,
    [
      g(['denen', 'die', 'deren'], 'die', 'Relativpronomen: Nominativ Plural', 'Bezugswort „Menschen“ (Plural) ist Subjekt im Relativsatz → „die“.', 'Antecedent "Menschen" (plural) is the subject of the relative clause → "die".'),
      g(['melden', 'gemeldet', 'meldet'], 'melden', 'Konjunktiv II: würde + Infinitiv', '„Ich würde mich … melden“ – nach „würde“ steht der Infinitiv.', '"Ich würde mich … melden" – "würde" takes the infinitive.'),
      g(['damit', 'für', 'um'], 'um', 'Infinitivsatz: um … zu', '„genug Zeit, um mich … zu engagieren“ – „um … zu“ + Infinitiv (gleiches Subjekt).', '"enough time to get involved" – "um … zu" + infinitive (same subject).'),
      g(['auf', 'in', 'bei'], 'in', 'Nomen mit Präposition: Erfahrung in', 'Man hat „Erfahrung in“ einem Bereich.', 'You have "Erfahrung in" (experience in) a field.'),
      g(['im', 'in', 'ins'], 'ins', 'Wechselpräposition: in + Akkusativ (wohin?)', '„ins Pflegeheim ziehen“ – Richtung → Akkusativ, „ins“ = in das.', '"ins Pflegeheim ziehen" – direction → accusative; "ins" = in das.'),
      g(['mit', 'bei', 'zu'], 'mit', 'Präposition: Zeit verbringen mit', 'Man verbringt Zeit „mit“ jemandem.', 'You spend time "mit" (with) someone.'),
      g(['sondern', 'aber', 'denn'], 'aber', 'Konnektor: aber (Gegensatz)', 'Kein Auto, „aber“ ein Fahrrad. „sondern“ korrigiert eine Verneinung im selben Satzteil und passt hier nicht.', 'No car, "aber" a bike. "sondern" corrects a negation within the same clause and does not fit here.'),
      g(['muss', 'müssen', 'musst'], 'muss', 'Modalverb: man → 3. Person Singular', 'Subjekt „man“ → 3. Person Singular „muss“.', 'Subject "man" → 3rd person singular "muss".'),
      g(['teilzunehmen', 'teilgenommen', 'teilnehmen'], 'teilnehmen', 'Modalverb + Infinitiv', '„muss ich … teilnehmen“ – nach „muss“ steht der Infinitiv ohne „zu“.', '"muss ich … teilnehmen" – after "muss" comes the infinitive without "zu".'),
      g(['Sie', 'sich', 'Ihnen'], 'sich', 'Reflexivpronomen: Sie → sich', '„sich melden“ – bei der Höflichkeitsform „Sie“ lautet das Reflexivpronomen „sich“.', '"sich melden" – with polite "Sie" the reflexive pronoun is "sich".'),
    ],
  ),
  sb1Set(
    'sb1-15',
    'wohnen',
    `Hallo Sarah,

hast du am übernächsten Wochenende schon etwas vor? Ich ziehe nämlich um und brauche dringend Hilfe! Endlich habe ich eine Wohnung gefunden, [1] nicht so teuer ist und trotzdem in der Innenstadt liegt. Sie hat einen schönen Balkon, [2] man den ganzen Nachmittag Sonne hat.

Der Umzug ist am Samstag, den 20. Mai. Ein Freund von Paul leiht uns [3] Transporter, deshalb brauchen wir keine Umzugsfirma. Wir wollen um 8 Uhr anfangen, [4] wir bis zum Abend fertig sind. Die neue Wohnung liegt im vierten Stock, und es gibt keinen Aufzug. Deshalb brauchen wir möglichst viele Leute, [5] schwere Möbel tragen können.

Kannst du vielleicht auch ein paar Kartons mitbringen? Ich habe zwar schon viele gekauft, aber ich glaube, es [6] nicht reichen.

Natürlich gibt es zum Mittagessen Pizza [7] alle Helfer, und am Abend feiern wir in der neuen Wohnung. Du kannst auch gern [8] Freund mitbringen!

Ich wäre dir wirklich sehr dankbar, wenn du [9] könntest. Sag mir bitte bis Mittwoch Bescheid, [10] ich planen kann.

Liebe Grüße
Hanna`,
    [
      g(['der', 'die', 'das'], 'die', 'Relativpronomen: Nominativ feminin', 'Bezugswort „Wohnung“ (feminin) ist Subjekt → „die“.', 'Antecedent "Wohnung" (feminine) is the subject → "die".'),
      g(['auf den', 'auf der', 'auf dem'], 'auf dem', 'Relativsatz mit Präposition: auf + Dativ', '„einen Balkon, auf dem man … Sonne hat“ – Ort (wo?) → Dativ, „Balkon“ maskulin → „auf dem“.', '"a balcony on which you get sun" – location (where?) → dative; "Balkon" is masculine → "auf dem".'),
      g(['seinen', 'seinem', 'sein'], 'seinen', 'Possessivartikel: Akkusativ maskulin', '„jemandem etwas leihen“ – die Sache steht im Akkusativ, „Transporter“ maskulin → „seinen“.', '"jemandem etwas leihen" – the thing is accusative; "Transporter" is masculine → "seinen".'),
      g(['um', 'dass', 'damit'], 'damit', 'Konnektor: damit (Zweck)', 'Zweck mit Subjekt und Verb am Ende („fertig sind“) → „damit“.', 'Purpose with a subject and the verb at the end ("fertig sind") → "damit".'),
      g(['denen', 'die', 'der'], 'die', 'Relativpronomen: Nominativ Plural', 'Bezugswort „Leute“ (Plural) ist Subjekt von „tragen können“ → „die“.', 'Antecedent "Leute" (plural) is the subject of "tragen können" → "die".'),
      g(['wird', 'wurde', 'werden'], 'wird', 'Futur: werden + Infinitiv', 'Vermutung über die Zukunft: „es wird nicht reichen“. Subjekt „es“ → „wird“.', 'A prediction about the future: "es wird nicht reichen". Subject "es" → "wird".'),
      g(['an', 'für', 'zu'], 'für', 'Präposition: für + Akkusativ', 'Pizza „für alle Helfer“ – für wen?', 'Pizza "für alle Helfer" – for whom?'),
      g(['dein', 'deinem', 'deinen'], 'deinen', 'Possessivartikel: Akkusativ maskulin', '„mitbringen“ + Akkusativ, „Freund“ maskulin → „deinen“.', '"mitbringen" + accusative; "Freund" is masculine → "deinen".'),
      g(['kommst', 'kommen', 'gekommen'], 'kommen', 'Modalverb + Infinitiv', '„wenn du kommen könntest“ – Infinitiv vor dem Modalverb am Satzende.', '"wenn du kommen könntest" – infinitive before the modal at the end.'),
      g(['damit', 'um', 'deshalb'], 'damit', 'Konnektor: damit (Zweck)', 'Zweck mit eigenem Subjekt („ich“) → „damit“. „um … zu“ bräuchte einen Infinitiv mit „zu“.', 'Purpose with its own subject ("ich") → "damit". "um … zu" would need a zu-infinitive.'),
    ],
  ),
  sb1Set(
    'sb1-16',
    'arbeit',
    `Sehr geehrter Herr Lang,

ich möchte Sie fragen, [1] ich im August zwei Wochen Urlaub nehmen kann. Meine Schwester heiratet am 10. August in der Türkei, und ich würde gern [2] der Hochzeit teilnehmen.

Mir ist klar, dass im August viele Kollegen Urlaub haben. Ich habe deshalb schon mit Frau Bauer gesprochen. Sie hat mir versprochen, mich [3] meiner Abwesenheit zu vertreten. Die wichtigsten Projekte werde ich vorher abschließen, und ich werde Frau Bauer alles genau [4], was sie wissen muss.

Außerdem hätte ich noch eine Bitte: Könnte ich in der Woche vor dem Urlaub [5] Homeoffice arbeiten? Im Büro werde ich ständig unterbrochen, [6] ich zu Hause konzentrierter arbeiten kann.

Natürlich bin ich auch im Urlaub [7] E-Mail erreichbar, falls es Probleme gibt.

Es wäre schön, [8] Sie mir bis Ende des Monats Bescheid geben könnten, [9] ich die Flüge buchen kann.

Vielen Dank im Voraus und [10] Grüße
Ahmet Kaya`,
    [
      g(['ob', 'dass', 'wenn'], 'ob', 'Indirekte Frage: ob', '„fragen, ob …“ – indirekte Ja/Nein-Frage.', '"fragen, ob …" – an indirect yes/no question.'),
      g(['bei', 'an', 'zu'], 'an', 'Verb mit Präposition: teilnehmen an', 'Man nimmt „an“ etwas teil (+ Dativ).', 'You take part in something: "teilnehmen an" (+ dative).'),
      g(['seit', 'trotz', 'während'], 'während', 'Präposition: während + Genitiv (Zeit)', '„während meiner Abwesenheit“ = in der Zeit, in der ich nicht da bin.', '"während meiner Abwesenheit" = during the time I am away.'),
      g(['erklärt', 'erklären', 'erkläre'], 'erklären', 'Futur: werden + Infinitiv', '„ich werde … erklären“ – nach „werden“ steht der Infinitiv.', '"ich werde … erklären" – "werden" takes the infinitive.'),
      g(['im', 'in', 'am'], 'im', 'Feste Wendung: im Homeoffice', 'Man arbeitet „im Homeoffice“.', 'You work "im Homeoffice".'),
      g(['weil', 'während', 'obwohl'], 'während', 'Konnektor: während (Gegensatz)', 'Gegensatz Büro ↔ zu Hause → „während“ (= wohingegen). „weil“ und „obwohl“ ergeben keinen Sinn.', 'Contrast office ↔ home → "während" (= whereas). "weil" and "obwohl" make no sense.'),
      g(['mit', 'durch', 'per'], 'per', 'Präposition: per (Kommunikationsmittel)', '„per E-Mail erreichbar“ – Mittel ohne Artikel.', '"per E-Mail erreichbar" – a means of communication without an article.'),
      g(['wenn', 'ob', 'dass'], 'wenn', 'Konnektor: wenn nach „Es wäre schön“', '„Es wäre schön, wenn Sie … könnten“ – höfliche Bitte im Konjunktiv II.', '"Es wäre schön, wenn Sie … könnten" – a polite request in Konjunktiv II.'),
      g(['weil', 'um', 'damit'], 'damit', 'Konnektor: damit (Zweck)', 'Zweck mit eigenem Subjekt („ich“) → „damit“.', 'Purpose with its own subject ("ich") → "damit".'),
      g(['freundlichen', 'freundliche', 'freundlicher'], 'freundliche', 'Adjektivendung: Akkusativ Plural ohne Artikel', '„Vielen Dank und freundliche Grüße“ – ohne Artikel, Akkusativ Plural → „-e“. „freundlichen“ nur nach „mit“.', '"Vielen Dank und freundliche Grüße" – no article, accusative plural → "-e". "freundlichen" only after "mit".'),
    ],
  ),
  sb1Set(
    'sb1-17',
    'reisen',
    `Sehr geehrte Damen und Herren,

meine Frau und ich möchten vom 12. bis 19. Juli Urlaub an der Ostsee machen und haben Ihr Hotel [1] Internet gefunden.

Wir suchen ein [2] Doppelzimmer mit Balkon und Blick [3] das Meer. Bitte teilen Sie uns mit, [4] viel das Zimmer pro Nacht kostet und ob das Frühstück im Preis enthalten ist.

Wir reisen mit unserem Hund. Er ist klein, sehr ruhig und [5] niemanden. Sind Hunde in Ihrem Hotel erlaubt?

Da wir mit dem Zug anreisen, möchten wir außerdem wissen, [6] es vom Bahnhof bis zu Ihrem Hotel ist. Gibt es einen Bus, oder können Sie uns vielleicht [7] Bahnhof abholen?

Meine Frau hat Probleme mit den Knien. Deshalb wäre es gut, wenn das Zimmer nicht zu hoch [8] oder wenn es einen Aufzug gibt.

Wir würden uns freuen, [9] Sie uns bald ein Angebot schicken. Falls Sie keine Zimmer mehr frei haben, [10] Sie uns vielleicht ein anderes Hotel in der Nähe empfehlen?

Mit freundlichen Grüßen
Peter und Ingrid Lorenz`,
    [
      g(['am', 'im', 'in'], 'im', 'Feste Wendung: im Internet', 'Man findet etwas „im Internet“.', 'You find something "im Internet".'),
      g(['ruhiges', 'ruhigen', 'ruhiger'], 'ruhiges', 'Adjektivendung: ein + Akkusativ neutral', '„ein … Doppelzimmer“ (neutral, Akkusativ) → „ruhiges“.', '"ein … Doppelzimmer" (neuter, accusative) → "ruhiges".'),
      g(['an', 'über', 'auf'], 'auf', 'Nomen mit Präposition: Blick auf', 'Man hat „Blick auf“ etwas (+ Akkusativ).', 'A view of something: "Blick auf" (+ accusative).'),
      g(['wie', 'was', 'wo'], 'wie', 'Fragewort: wie viel', '„wie viel … kostet“ – Frage nach dem Preis.', '"wie viel … kostet" – asking about the price.'),
      g(['stören', 'stört', 'gestört'], 'stört', 'Verbform: 3. Person Singular', 'Subjekt „er“ (der Hund) → „stört“.', 'Subject "er" (the dog) → "stört".'),
      g(['wie viel', 'wie weit', 'wie lange'], 'wie weit', 'Fragewort: wie weit (Entfernung)', 'Gefragt ist die Entfernung: „wie weit es … ist“. „wie lange“ fragt nach der Dauer und bräuchte „dauert“.', 'The question is about distance: "wie weit es … ist". "wie lange" asks about duration and would need "dauert".'),
      g(['zum', 'am', 'vom'], 'vom', 'Präposition: abholen von + Dativ', '„vom Bahnhof abholen“ – Ausgangspunkt → „von dem“ = „vom“.', '"vom Bahnhof abholen" – starting point → "von dem" = "vom".'),
      g(['liegt', 'liegen', 'lege'], 'liegt', 'Verbform: 3. Person Singular', 'Subjekt „das Zimmer“ → „liegt“ am Ende des Nebensatzes.', 'Subject "das Zimmer" → "liegt" at the end of the clause.'),
      g(['ob', 'wenn', 'als'], 'wenn', 'Konnektor: wenn nach „sich freuen“', '„Wir würden uns freuen, wenn Sie …“ – Bedingung/Wunsch.', '"Wir würden uns freuen, wenn Sie …" – condition/wish.'),
      g(['Könntet', 'Konnten', 'Könnten'], 'Könnten', 'Konjunktiv II: höfliche Bitte (Sie)', 'Höfliche Frage in der Sie-Form → „Könnten Sie …?“. „Konnten“ ist Vergangenheit, „Könntet“ die ihr-Form.', 'A polite question in the Sie form → "Könnten Sie …?". "Konnten" is past; "Könntet" is the ihr form.'),
    ],
  ),
  sb1Set(
    'sb1-18',
    'ausbildung',
    `Sehr geehrte Frau Schmidt,

mein Sohn Leon kann leider vom 4. bis 8. März nicht [1] Unterricht kommen. Er muss am Knie operiert werden und soll danach eine Woche im Bett bleiben. [2] bitte ich Sie, ihn für diese Zeit zu entschuldigen. Eine Bescheinigung des Arztes [3] ich Ihnen nach der Operation.

Leon macht sich große Sorgen [4] die Mathearbeit, [5] am 6. März geschrieben wird. Wäre es möglich, dass er die Arbeit später [6]?

Könnten Sie mir außerdem sagen, [7] Hausaufgaben er in dieser Woche machen soll? Seine Freundin Emma wohnt in [8] Nähe und könnte ihm die Arbeitsblätter mitbringen. So [9] er wenigstens zu Hause ein bisschen lernen.

Vielen Dank für Ihr Verständnis. Für Fragen [10] ich Ihnen gern zur Verfügung.

Mit freundlichen Grüßen
Maria Lopes`,
    [
      g(['im', 'zum', 'beim'], 'zum', 'Präposition: kommen zu + Dativ', '„zum Unterricht kommen“ – Ziel → „zu dem“ = „zum“.', '"zum Unterricht kommen" – destination → "zu dem" = "zum".'),
      g(['Deshalb', 'Weil', 'Obwohl'], 'Deshalb', 'Konnektor: deshalb + Verb auf Position 2', 'Danach folgt das Verb direkt („bitte ich“) → Adverb „Deshalb“. Nach „Weil/Obwohl“ stünde das Verb am Ende.', 'The verb follows immediately ("bitte ich") → adverb "Deshalb". After "Weil/Obwohl" the verb would go last.'),
      g(['schickt', 'geschickt', 'schicke'], 'schicke', 'Verbform: 1. Person Singular', 'Subjekt „ich“ → „schicke“ (Präsens mit Zukunftsbedeutung).', 'Subject "ich" → "schicke" (present with future meaning).'),
      g(['über', 'um', 'für'], 'um', 'Wendung: sich Sorgen machen um', 'Man macht sich Sorgen „um“ etwas (+ Akkusativ).', 'You worry about something: "sich Sorgen machen um" (+ accusative).'),
      g(['der', 'das', 'die'], 'die', 'Relativpronomen: Nominativ feminin', 'Bezugswort „Mathearbeit“ (feminin), Subjekt im Passivsatz → „die“.', 'Antecedent "Mathearbeit" (feminine), subject of the passive clause → "die".'),
      g(['nachschreiben', 'nachschreibt', 'nachgeschrieben'], 'nachschreibt', 'Verbform im Nebensatz: 3. Person Singular', 'Im dass-Satz steht das konjugierte Verb am Ende, trennbares Verb zusammen: „dass er … nachschreibt“.', 'In a dass-clause the finite verb goes last and the separable verb stays together: "dass er … nachschreibt".'),
      g(['welche', 'was', 'wie'], 'welche', 'Fragewort: welche + Nomen', 'Vor einem Nomen im Plural („Hausaufgaben“) steht „welche“.', 'Before a plural noun ("Hausaufgaben") you use "welche".'),
      g(['dem', 'die', 'der'], 'der', 'Artikel: in + Dativ feminin', '„in der Nähe“ – Ort (wo?) → Dativ, „Nähe“ feminin → „der“.', '"in der Nähe" – location (where?) → dative; "Nähe" is feminine → "der".'),
      g(['könnt', 'kann', 'können'], 'kann', 'Modalverb: 3. Person Singular', 'Subjekt „er“ → „kann“.', 'Subject "er" → "kann".'),
      g(['stelle', 'steht', 'stehe'], 'stehe', 'Feste Wendung: zur Verfügung stehen', '„Ich stehe Ihnen zur Verfügung“ – Verb „stehen“, 1. Person.', '"Ich stehe Ihnen zur Verfügung" (I am available) – verb "stehen", 1st person.'),
    ],
  ),
  sb1Set(
    'sb1-19',
    'dienstleistungen',
    `Sehr geehrte Damen und Herren,

am 2. Februar habe ich in einer Filiale in Köln ein Paket [1] meine Tochter in München aufgegeben. Das Paket hätte spätestens [2] 5. Februar ankommen sollen. Bis heute hat meine Tochter es aber nicht bekommen.

Im Internet steht, das Paket [3] am 4. Februar zugestellt. Meine Tochter war an diesem Tag zu Hause, [4] niemand hat geklingelt. Auch bei den Nachbarn [5] nichts abgegeben.

In dem Paket waren Geburtstagsgeschenke, [6] Wert ungefähr 150 Euro beträgt. Ich habe die Quittung noch und schicke [7] Ihnen als Anhang.

Ich bitte Sie, [8] Sache zu überprüfen und mir mitzuteilen, wo das Paket jetzt ist. Falls es verloren gegangen ist, möchte ich [9] den Schaden ersetzen lassen.

Ich freue mich [10] eine schnelle Antwort.

Mit freundlichen Grüßen
Gisela Hahn`,
    [
      g(['zu', 'an', 'nach'], 'an', 'Präposition: an + Akkusativ (Empfänger)', 'Ein Paket schickt man „an“ eine Person. „nach“ steht bei Orten ohne Artikel, „zu“ passt nicht.', 'You send a parcel "an" a person. "nach" is for places without an article; "zu" does not fit.'),
      g(['am', 'zum', 'im'], 'am', 'Zeitangabe: am + Datum', 'Vor einem Datum steht „am“.', 'A date takes "am".'),
      g(['würde', 'werde', 'wurde'], 'wurde', 'Passiv Präteritum: wurde + Partizip II', 'Das Ereignis liegt in der Vergangenheit → „wurde … zugestellt“.', 'The event is in the past → "wurde … zugestellt".'),
      g(['sondern', 'aber', 'denn'], 'aber', 'Konnektor: aber (Gegensatz)', 'Gegensatz: zu Hause, „aber“ niemand hat geklingelt.', 'Contrast: at home, "aber" nobody rang.'),
      g(['wird', 'wurde', 'würde'], 'wurde', 'Passiv Präteritum', 'Vergangenheit, Passiv: „wurde nichts abgegeben“.', 'Past, passive: "wurde nichts abgegeben".'),
      g(['deren', 'dessen', 'die'], 'deren', 'Relativpronomen: Genitiv Plural', '„Geschenke, deren Wert …“ – Besitz, Bezugswort im Plural → „deren“.', '"Geschenke, deren Wert …" – possession, plural antecedent → "deren".'),
      g(['ihr', 'ihn', 'sie'], 'sie', 'Personalpronomen: Akkusativ feminin', '„die Quittung“ (feminin) ist Akkusativobjekt → „sie“.', '"die Quittung" (feminine) is the accusative object → "sie".'),
      g(['der', 'die', 'das'], 'die', 'Artikel: Akkusativ feminin', '„die Sache überprüfen“ – Akkusativ, „Sache“ feminin.', '"die Sache überprüfen" – accusative; "Sache" is feminine.'),
      g(['mich', 'mir', 'mein'], 'mir', 'Reflexivpronomen: Dativ', '„sich (Dativ) etwas ersetzen lassen“ – es gibt schon ein Akkusativobjekt („den Schaden“), deshalb Dativ „mir“.', '"sich (dative) etwas ersetzen lassen" – there is already an accusative object ("den Schaden"), so dative "mir".'),
      g(['an', 'für', 'auf'], 'auf', 'Verb mit Präposition: sich freuen auf', 'Etwas Zukünftiges → „sich freuen auf“ (+ Akkusativ).', 'Something in the future → "sich freuen auf" (+ accusative).'),
    ],
  ),
  sb1Set(
    'sb1-20',
    'freizeit',
    `Liebe Anja,

erinnerst du dich noch an die Band „Nachtfalter“, [1] wir vor drei Jahren auf dem Stadtfest gehört haben? Stell dir vor, sie spielen am 21. November in der Stadthalle! Ich habe sofort zwei Karten gekauft – eine für mich und eine für [2]!

Das Konzert beginnt um 20 Uhr. Ich schlage vor, [3] wir uns vorher um 18.30 Uhr in dem kleinen italienischen Restaurant am Marktplatz treffen. Dort haben wir das letzte Mal so gut [4]. Danach können wir zusammen zur Stadthalle laufen.

Die Karten waren nicht ganz billig, aber das ist mir egal. Du hast mir im Sommer so viel beim Umzug geholfen, [5] möchte ich mich bei dir bedanken. Du musst also nichts bezahlen!

Falls du an diesem Tag nicht kannst, sag mir bitte bald Bescheid. Dann frage ich meinen Bruder, [6] er Lust hat. Aber ich würde natürlich viel lieber mit dir [7]!

Übrigens: Ich habe gehört, [8] du einen neuen Job hast. Herzlichen Glückwunsch! Erzähl mir doch beim Essen [9] deiner neuen Arbeit.

Ich freue mich schon sehr auf den Abend [10] dir!

Viele Grüße
Nina`,
    [
      g(['der', 'die', 'das'], 'die', 'Relativpronomen: Akkusativ feminin', 'Bezugswort „die Band“ (feminin), Akkusativobjekt von „gehört“ → „die“.', 'Antecedent "die Band" (feminine), accusative object of "gehört" → "die".'),
      g(['dich', 'dir', 'du'], 'dich', 'Personalpronomen: für + Akkusativ', '„für“ verlangt den Akkusativ → „für dich“.', '"für" takes the accusative → "für dich".'),
      g(['ob', 'wenn', 'dass'], 'dass', 'Konnektor: dass nach „vorschlagen“', '„Ich schlage vor, dass …“ – Inhalt des Vorschlags.', '"Ich schlage vor, dass …" – the content of the suggestion.'),
      g(['essen', 'gegessen', 'isst'], 'gegessen', 'Perfekt: haben + Partizip II', '„haben … gegessen“ – Partizip II.', '"haben … gegessen" – past participle.'),
      g(['deshalb', 'weil', 'denn'], 'deshalb', 'Konnektor: deshalb + Verb auf Position 2', 'Folge, danach direkt das Verb („möchte ich“) → „deshalb“. Nach „weil“ stünde das Verb am Ende.', 'A consequence followed directly by the verb ("möchte ich") → "deshalb". After "weil" the verb would go last.'),
      g(['dass', 'ob', 'wenn'], 'ob', 'Indirekte Frage: ob', '„frage …, ob er Lust hat“ – indirekte Ja/Nein-Frage.', '"frage …, ob er Lust hat" – an indirect yes/no question.'),
      g(['geht', 'gegangen', 'gehen'], 'gehen', 'Konjunktiv II: würde + Infinitiv', '„ich würde … mit dir gehen“ – Infinitiv nach „würde“.', '"ich würde … mit dir gehen" – infinitive after "würde".'),
      g(['dass', 'ob', 'was'], 'dass', 'Konnektor: dass nach „hören“', '„Ich habe gehört, dass …“ – Inhalt einer Information.', '"Ich habe gehört, dass …" – the content of a piece of news.'),
      g(['über', 'nach', 'von'], 'von', 'Verb mit Präposition: erzählen von + Dativ', '„von deiner neuen Arbeit“ – „von“ + Dativ. „über“ verlangt den Akkusativ („über deine“) und passt zur Endung nicht.', '"von deiner neuen Arbeit" – "von" + dative. "über" takes the accusative ("über deine") and does not match the ending.'),
      g(['bei', 'mit', 'für'], 'mit', 'Präposition: mit + Dativ', 'Den Abend zusammen „mit dir“ verbringen.', 'Spending the evening together "mit dir" (with you).'),
    ],
  ),
];
