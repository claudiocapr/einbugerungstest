/**
 * Sprachbausteine Teil 2, sets 11–20. Written for this app.
 */
import type { Sb2Set } from '../types.ts';
import { sb2Set } from './build.ts';

export const sb2b: Sb2Set[] = [
  sb2Set(
    'sb2-11',
    'medien',
    `Hallo Paul,

du hattest mich doch gefragt, welchen Handyvertrag ich habe. Ich habe vor zwei Monaten den Anbieter [1] und bin bisher sehr zufrieden.

Mein alter Vertrag war viel zu teuer. Ich habe jeden Monat 40 Euro bezahlt, obwohl ich kaum telefoniere. Jetzt zahle ich nur noch 12 Euro und habe 20 Gigabyte Datenvolumen. Das [2] mir völlig, weil ich zu Hause sowieso WLAN habe.

Der Wechsel war ganz einfach. Ich musste nur ein Formular im Internet [3], und der neue Anbieter hat alles andere [4]. Meine alte Telefonnummer konnte ich [5]. Nach einer Woche kam die neue SIM-Karte mit der Post.

Ein kleiner [6]: Den Kundenservice erreicht man nur per Chat, nicht per Telefon. Das ist für manche Leute vielleicht [7]. Mich stört es aber nicht.

Wichtig ist, dass du vorher prüfst, wann du deinen alten Vertrag [8] kannst. Bei mir war das zum Glück schon nach einem Monat möglich.

Wenn du willst, schicke ich dir den [9] zu der Internetseite. Und falls du Hilfe brauchst, ruf mich einfach [10]!

Viele Grüße
Mira`,
    ['Adresse', 'an', 'ausfüllen', 'ausgefüllt', 'behalten', 'erledigt', 'gekündigt', 'gewechselt', 'hin', 'kündigen', 'Link', 'Nachteil', 'Problem', 'reicht', 'unpraktisch'],
    [
      ['gewechselt', '„den Anbieter wechseln“ – Perfekt „habe … gewechselt“.', '"den Anbieter wechseln" (switch provider) – perfect "habe … gewechselt".'],
      ['reicht', '„Das reicht mir“ = das ist genug für mich.', '"Das reicht mir" = that is enough for me.'],
      ['ausfüllen', '„ein Formular ausfüllen“ – nach „musste“ der Infinitiv. „ausgefüllt“ ist das Partizip.', '"ein Formular ausfüllen" (fill in a form) – infinitive after "musste". "ausgefüllt" is the participle.'],
      ['erledigt', '„alles andere erledigen“ – Perfekt „hat … erledigt“.', '"alles andere erledigen" (take care of everything else) – perfect "hat … erledigt".'],
      ['behalten', '„die Nummer behalten“ = nicht verlieren, weiter benutzen.', '"die Nummer behalten" = keep the number.'],
      ['Nachteil', '„Ein kleiner Nachteil“ – maskulin wie „kleiner“; danach kommt etwas Negatives. „Problem“ ist neutral.', '"Ein kleiner Nachteil" (a small drawback) – masculine like "kleiner". "Problem" is neuter.'],
      ['unpraktisch', '„Das ist für manche Leute unpraktisch“ – „Mich stört es aber nicht“ zeigt: etwas Negatives.', '"Das ist für manche unpraktisch" – "but it doesn\'t bother me" shows it is something negative.'],
      ['kündigen', '„einen Vertrag kündigen“ – nach „kannst“ der Infinitiv.', '"einen Vertrag kündigen" (cancel a contract) – infinitive after "kannst".'],
      ['Link', '„den Link zu der Internetseite schicken“ – maskulin wie „den“. „Adresse“ ist feminin.', '"den Link … schicken" – masculine like "den". "Adresse" is feminine.'],
      ['an', '„jemanden anrufen“ – „ruf mich … an“.', '"jemanden anrufen" – "ruf mich … an" (give me a call).'],
    ],
  ),
  sb2Set(
    'sb2-12',
    'gesellschaft',
    `Nachbarn helfen Nachbarn

Liebe Nachbarinnen und Nachbarn,

in unserer Straße wohnen viele Menschen, die [1] Hilfe brauchen: ältere Leute, die nicht mehr schwer tragen können, Familien mit kleinen Kindern oder Menschen, die gerade krank sind. Gleichzeitig gibt es viele, die gern helfen würden, aber nicht wissen, [2].

Deshalb möchten wir eine Nachbarschaftshilfe [3]. Die Idee ist einfach: Wer Hilfe braucht, schreibt einen Zettel und hängt ihn an die [4] im Eingang von Haus Nr. 7. Wer helfen kann, nimmt den Zettel ab und meldet sich.

Man kann zum Beispiel für jemanden einkaufen, mit dem Hund spazieren gehen, beim Ausfüllen von Formularen helfen oder kleine [5] in der Wohnung machen. Geld soll dabei keine [6] spielen. Wer möchte, kann sich mit einem Kuchen oder einer Einladung zum Kaffee [7].

Zum ersten Treffen laden wir alle [8] ein: am Freitag, dem 5. April, um 18 Uhr im Gemeinschaftsraum. Dort wollen wir uns [9] kennenlernen und besprechen, wie wir das Projekt organisieren. Für Getränke und Snacks ist [10].

Wir freuen uns auf Sie!
Familie Okoro und Herr Lindner (Haus Nr. 7)`,
    ['bedanken', 'Bedeutung', 'Brett', 'damit', 'danken', 'gegenseitig', 'gekümmert', 'gesorgt', 'gründen', 'herzlich', 'manchmal', 'Pinnwand', 'Reparaturen', 'Rolle', 'wie'],
    [
      ['manchmal', '„die manchmal Hilfe brauchen“ = ab und zu.', '"who sometimes need help".'],
      ['wie', '„nicht wissen, wie“ (man helfen kann). „damit“ leitet keine indirekte Frage ein.', '"not know how" (to help). "damit" does not introduce an indirect question.'],
      ['gründen', '„eine Nachbarschaftshilfe gründen“ = neu anfangen, ins Leben rufen.', '"eine Nachbarschaftshilfe gründen" = set up a neighbourhood help group.'],
      ['Pinnwand', '„an die Pinnwand hängen“ – feminin wie „die“. „Brett“ ist neutral („an das Brett“).', '"an die Pinnwand hängen" (on the noticeboard) – feminine like "die". "Brett" is neuter.'],
      ['Reparaturen', '„kleine Reparaturen machen“.', '"do small repairs".'],
      ['Rolle', '„keine Rolle spielen“ = nicht wichtig sein. „Bedeutung“ passt nicht zu „spielen“.', '"keine Rolle spielen" = not matter. "Bedeutung" does not go with "spielen".'],
      ['bedanken', '„sich bedanken“ ist reflexiv („kann sich … bedanken“). „danken“ ist nicht reflexiv.', '"sich bedanken" is reflexive. "danken" is not.'],
      ['herzlich', '„Wir laden Sie herzlich ein“ – feste Wendung.', '"We cordially invite you" – fixed phrase.'],
      ['gegenseitig', '„sich gegenseitig kennenlernen“ = einander.', '"get to know each other".'],
      ['gesorgt', '„Für Getränke ist gesorgt“ = es gibt Getränke. „gekümmert“ bräuchte „sich … um“.', '"Für Getränke ist gesorgt" = drinks are provided. "gekümmert" would need "sich … um".'],
    ],
  ),
  sb2Set(
    'sb2-13',
    'essen',
    `Sehr geehrte Damen und Herren,

unsere Firma feiert am 30. Juni ihr zehnjähriges Bestehen. Zu diesem [1] möchten wir für unsere 60 Mitarbeiterinnen und Mitarbeiter ein Buffet [2]. Ein Kollege hat uns Ihren Partyservice [3], und Ihr Angebot auf der Internetseite hat uns sehr gut gefallen.

Wir stellen uns ein warmes Buffet mit Fleisch, Fisch und mehreren vegetarischen Gerichten vor. Einige Kolleginnen und Kollegen essen [4] vegan; bitte planen Sie auch für sie etwas ein. Außerdem hat ein Mitarbeiter eine [5] gegen Nüsse.

Die Feier findet in unserem Firmengebäude statt. Wir haben dort eine große Küche, [6] Sie benutzen können. Brauchen Sie auch Personal für den Service, oder [7] Sie das Essen nur?

Bitte schicken Sie uns ein [8] Angebot mit allen Kosten, also auch für Geschirr, Besteck und Gläser. Unser Budget [9] bei etwa 35 Euro pro Person.

Für Rückfragen stehe ich Ihnen gern zur [10].

Mit freundlichen Grüßen
Corinna Albers`,
    ['Allergie', 'Anlass', 'ausschließlich', 'beträgt', 'bestellen', 'die', 'empfohlen', 'genaue', 'genaues', 'Grund', 'Krankheit', 'liefern', 'liegt', 'Verfügung', 'wo'],
    [
      ['Anlass', '„zu diesem Anlass“ = für dieses Ereignis. „Grund“ geht nur mit „aus diesem Grund“.', '"zu diesem Anlass" = for this occasion. "Grund" only works as "aus diesem Grund".'],
      ['bestellen', '„ein Buffet bestellen“.', '"order a buffet".'],
      ['empfohlen', '„jemandem etwas empfehlen“ – Perfekt „hat … empfohlen“.', '"recommend something to someone" – perfect "hat … empfohlen".'],
      ['ausschließlich', '„ausschließlich vegan“ = nur vegan.', '"ausschließlich vegan" = exclusively vegan.'],
      ['Allergie', '„eine Allergie gegen Nüsse“. „Krankheit gegen“ gibt es nicht.', '"an allergy to nuts". "Krankheit gegen" does not exist.'],
      ['die', 'Relativpronomen: „eine Küche, die Sie benutzen können“ (Akk. feminin). „wo“ lässt das Objekt von „benutzen“ fehlen.', 'Relative pronoun: "a kitchen which you can use" (acc. feminine). "wo" leaves "benutzen" without an object.'],
      ['liefern', '„das Essen nur liefern“ (ohne Service).', '"only deliver the food" (without service).'],
      ['genaues', '„ein genaues Angebot“ – neutral, Endung „-es“ nach „ein“.', '"ein genaues Angebot" – neuter, ending "-es" after "ein".'],
      ['liegt', '„Das Budget liegt bei 35 Euro“. „beträgt“ steht ohne „bei“.', '"Das Budget liegt bei 35 Euro". "beträgt" is used without "bei".'],
      ['Verfügung', '„jemandem zur Verfügung stehen“ = bereit sein zu helfen.', '"jemandem zur Verfügung stehen" = be available.'],
    ],
  ),
  sb2Set(
    'sb2-14',
    'person',
    `Hallo Julia,

ich habe deine Anzeige am schwarzen Brett der Uni gelesen. Du suchst einen Tandempartner für Spanisch, und ich suche jemanden, mit [1] ich Deutsch üben kann. Vielleicht passen wir ja [2]!

Ich möchte mich kurz [3]: Ich heiße Diego, bin 26 Jahre alt und komme aus Valencia. Seit einem halben Jahr lebe ich in Göttingen und mache hier meinen Master in Biologie. Ich habe schon einen Deutschkurs [4], aber mir fehlt die Praxis. Besonders beim Sprechen bin ich noch sehr [5].

In meiner [6] spiele ich gern Fußball und koche gern. Vielleicht könnten wir uns mal zum Kochen treffen? Ich zeige dir, wie man eine richtige Paella macht, und wir sprechen dabei abwechselnd Deutsch und Spanisch.

Ich habe meistens [7] Zeit, am besten dienstags oder donnerstags. Wie oft sollten wir uns treffen? Ich fände einmal pro Woche [8].

Schreib mir doch, ob du [9] hast. Ich würde mich sehr freuen!

Viele Grüße
Diego

P.S. Meine Handynummer ist 0172 556 78 90, falls du lieber [10] möchtest.`,
    ['abends', 'besucht', 'dem', 'den', 'Ferien', 'Freizeit', 'gelernt', 'ideal', 'kennenlernen', 'Lust', 'telefonieren', 'unsicher', 'vorstellen', 'wem', 'zusammen'],
    [
      ['dem', 'Relativpronomen nach „mit“ (Dativ), Bezugswort „jemanden“ (maskulin) → „mit dem“.', 'Relative pronoun after "mit" (dative), antecedent "jemanden" (masculine) → "mit dem".'],
      ['zusammen', '„zusammenpassen“ = gut zueinander passen.', '"zusammenpassen" = be a good match.'],
      ['vorstellen', '„sich vorstellen“ = Name, Herkunft usw. nennen. „sich kennenlernen“ braucht zwei Personen.', '"sich vorstellen" = introduce yourself. "sich kennenlernen" needs two people.'],
      ['besucht', '„einen Kurs besuchen“ – Perfekt „habe … besucht“. „einen Kurs gelernt“ ist falsch.', '"einen Kurs besuchen" (attend a course) – perfect "habe … besucht". "einen Kurs gelernt" is wrong.'],
      ['unsicher', '„beim Sprechen unsicher sein“ – passt zu „mir fehlt die Praxis“.', '"unsure when speaking" – fits "I lack practice".'],
      ['Freizeit', '„In meiner Freizeit“ – Singular feminin. „Ferien“ ist Plural.', '"In meiner Freizeit" – feminine singular. "Ferien" is plural.'],
      ['abends', '„meistens abends Zeit haben“.', '"usually have time in the evenings".'],
      ['ideal', '„Ich fände einmal pro Woche ideal“ = am besten.', '"I\'d find once a week ideal".'],
      ['Lust', '„Lust haben“ = etwas gern machen wollen.', '"Lust haben" = feel like doing something.'],
      ['telefonieren', '„falls du lieber telefonieren möchtest“ – passt zur Handynummer.', '"in case you\'d rather talk on the phone" – fits the phone number.'],
    ],
  ),
  sb2Set(
    'sb2-15',
    'reisen',
    `Liebe Fahrgäste,

wegen Bauarbeiten [1] die Strecke zwischen Altburg und Neustein vom 10. bis 24. Juli komplett gesperrt. In dieser Zeit fahren keine Züge. Stattdessen [2] Busse zwischen den beiden Bahnhöfen.

Bitte beachten Sie, dass die Fahrt mit dem Bus etwa 30 Minuten länger [3] als mit dem Zug. Planen Sie deshalb mehr Zeit ein, besonders wenn Sie in Neustein einen [4] erreichen müssen.

Die Busse fahren direkt vor dem Bahnhofsgebäude ab. Folgen Sie einfach den gelben [5]. Fahrräder können in den Bussen leider nicht [6] werden. Kinderwagen und Rollstühle sind kein Problem.

Ihre Fahrkarten [7] auch in den Ersatzbussen. Sie müssen also kein neues Ticket kaufen.

Wir wissen, dass die Bauarbeiten für Sie [8] sind, und bitten um Ihr Verständnis. Nach den Arbeiten können die Züge auf dieser Strecke schneller fahren, und es wird weniger [9] geben.

Aktuelle Informationen [10] Sie jederzeit in unserer App und auf unserer Internetseite.

Ihre Regiobahn Mitte`,
    ['Anschluss', 'ärgerlich', 'dauert', 'fahren', 'finden', 'gelten', 'gültig', 'ist', 'mitgenommen', 'mitnehmen', 'Schilder', 'Schildern', 'sind', 'Verbindung', 'Verspätungen'],
    [
      ['ist', 'Zustandspassiv: „Die Strecke ist … gesperrt“, Subjekt Singular. „sind“ wäre Plural.', 'Stative passive: "the line is closed", singular subject. "sind" would be plural.'],
      ['fahren', '„Stattdessen fahren Busse“.', '"Instead, buses run".'],
      ['dauert', '„Die Fahrt dauert 30 Minuten länger“.', '"The journey takes 30 minutes longer".'],
      ['Anschluss', '„einen Anschluss erreichen“ = den nächsten Zug. „Verbindung“ ist feminin und passt nicht zu „einen“.', '"catch a connection". "Verbindung" is feminine and does not fit "einen".'],
      ['Schildern', '„den gelben Schildern folgen“ – Dativ Plural mit -n. „Schildern“, nicht „Schilder“.', '"follow the yellow signs" – dative plural with -n: "Schildern", not "Schilder".'],
      ['mitgenommen', 'Passiv: „können nicht mitgenommen werden“. „mitnehmen“ ist der Infinitiv.', 'Passive: "cannot be taken along". "mitnehmen" is the infinitive.'],
      ['gelten', '„Die Fahrkarten gelten“ = sind gültig. „gültig“ ist ein Adjektiv und bräuchte „sind“.', '"The tickets are valid" = "gelten". "gültig" is an adjective and would need "sind".'],
      ['ärgerlich', '„Bauarbeiten sind ärgerlich“ – deshalb „bitten wir um Verständnis“.', '"the works are annoying" – hence "we ask for your understanding".'],
      ['Verspätungen', '„weniger Verspätungen“ = Züge kommen pünktlicher.', '"fewer delays".'],
      ['finden', '„Informationen finden Sie in der App“.', '"You will find information in the app".'],
    ],
  ),
  sb2Set(
    'sb2-16',
    'arbeit',
    `Liebe neue Kolleginnen und Kollegen,

herzlich willkommen bei Lindner Elektrotechnik! Wir freuen uns, dass Sie ab heute zu unserem Team [1]. Damit Sie sich schnell zurechtfinden, haben wir hier die wichtigsten Informationen für Sie [2].

Arbeitszeit: Bei uns gilt Gleitzeit. Sie können zwischen 7 und 9 Uhr [3] und müssen bis mindestens 15 Uhr bleiben. Ihre Arbeitszeit [4] Sie bitte jeden Tag am Terminal neben dem Eingang ein.

Kantine: Das Mittagessen kostet für Mitarbeiter nur 4,50 Euro. Die Kantine ist von 11.30 bis 14 Uhr [5].

Krankheit: Wenn Sie krank sind, informieren Sie bitte so früh wie möglich Ihren [6]. Ab dem dritten Krankheitstag brauchen wir eine [7] vom Arzt.

Urlaub: Ihren Urlaub [8] Sie bitte mindestens vier Wochen vorher bei Ihrer Abteilungsleitung.

In den ersten Wochen hat jeder neue Mitarbeiter einen Paten. Das ist ein erfahrener Kollege, der Ihnen bei allen Fragen [9].

Wir wünschen Ihnen einen guten Start und viel [10] bei Ihrer neuen Aufgabe!

Ihre Personalabteilung`,
    ['Abteilung', 'anfangen', 'beantragen', 'Bescheinigung', 'Erfolg', 'geöffnet', 'gehören', 'gehört', 'hilft', 'Rezept', 'tragen', 'unterstützt', 'Vorgesetzten', 'zusammengestellt', 'zusammenstellen'],
    [
      ['gehören', '„zu einem Team gehören“, Subjekt „Sie“ (Plural) → „gehören“.', '"zu einem Team gehören" (belong to a team), subject "Sie" → "gehören".'],
      ['zusammengestellt', 'Perfekt: „haben … zusammengestellt“ = gesammelt und geordnet.', 'Perfect: "haben … zusammengestellt" = put together.'],
      ['anfangen', '„zwischen 7 und 9 Uhr anfangen“ = mit der Arbeit beginnen.', '"start between 7 and 9".'],
      ['tragen', '„die Arbeitszeit eintragen“ – „tragen … ein“.', '"eintragen" (enter/record) – "tragen … ein".'],
      ['geöffnet', '„Die Kantine ist … geöffnet“.', '"The canteen is open …".'],
      ['Vorgesetzten', '„Ihren Vorgesetzten informieren“ = Chef/Chefin. „Abteilung“ ist feminin und passt nicht zu „Ihren“.', '"inform your superior". "Abteilung" is feminine and does not fit "Ihren".'],
      ['Bescheinigung', '„eine Bescheinigung vom Arzt“ = Krankmeldung. „Rezept“ ist neutral.', '"a certificate from the doctor". "Rezept" is neuter.'],
      ['beantragen', '„Urlaub beantragen“ = offiziell um Urlaub bitten.', '"apply for leave".'],
      ['hilft', '„jemandem (Dativ) helfen“ → „der Ihnen hilft“. „unterstützen“ braucht den Akkusativ („Sie“).', '"jemandem helfen" (dative) → "der Ihnen hilft". "unterstützen" needs the accusative ("Sie").'],
      ['Erfolg', '„viel Erfolg“ – guter Wunsch.', '"viel Erfolg" (good luck / every success).'],
    ],
  ),
  sb2Set(
    'sb2-17',
    'wohnen',
    `Liebe Ines,

endlich habe ich eine Wohnung gefunden! Nach drei Monaten Suche hatte ich schon fast keine [1] mehr. Aber letzte Woche hat mich die Vermieterin angerufen und mir die Wohnung [2].

Sie liegt in einem ruhigen Viertel, nicht weit vom Zentrum. Die Wohnung hat zwei Zimmer, eine kleine Küche und ein Bad mit [3]. Das Schönste ist der Balkon: Von dort hat man einen tollen [4] über die ganze Stadt.

Die Miete ist zwar ein bisschen höher, als ich [5] hatte, aber dafür ist alles neu renoviert. Die Nebenkosten sind schon [6].

Am 1. März ziehe ich ein. Vorher muss ich noch viele Möbel [7]: Ich brauche eine neue Küche und ein Bett. Zum Glück hilft mir mein Bruder beim [8].

Wenn alles fertig ist, möchte ich eine kleine Party [9]. Du bist natürlich herzlich eingeladen! Ich sage dir rechtzeitig [10].

Liebe Grüße
Ayşe`,
    ['anbieten', 'angeboten', 'Antwort', 'Aussicht', 'Badewanne', 'Bescheid', 'Blick', 'eingezogen', 'feiern', 'geplant', 'Hoffnung', 'inklusive', 'kaufen', 'teurer', 'Umzug'],
    [
      ['Hoffnung', '„keine Hoffnung mehr haben“.', '"have no hope left".'],
      ['angeboten', '„jemandem eine Wohnung anbieten“ – Perfekt „hat … angeboten“.', '"offer someone a flat" – perfect "hat … angeboten".'],
      ['Badewanne', '„ein Bad mit Badewanne“.', '"a bathroom with a bathtub".'],
      ['Blick', '„einen tollen Blick über die Stadt“ – maskulin wie „einen tollen“. „Aussicht“ ist feminin.', '"a great view over the city" – masculine like "einen tollen". "Aussicht" is feminine.'],
      ['geplant', '„höher, als ich geplant hatte“ – Plusquamperfekt.', '"higher than I had planned" – past perfect.'],
      ['inklusive', '„Die Nebenkosten sind schon inklusive“ = im Preis enthalten.', '"The service charges are already included".'],
      ['kaufen', '„Möbel kaufen“ – passt zu „Ich brauche eine neue Küche und ein Bett“.', '"buy furniture".'],
      ['Umzug', '„beim Umzug helfen“ – maskulin wie „beim“.', '"help with the move" – masculine like "beim".'],
      ['feiern', '„eine Party feiern“.', '"have a party".'],
      ['Bescheid', '„jemandem Bescheid sagen“ = informieren. „Antwort sagen“ ist falsch.', '"jemandem Bescheid sagen" = let someone know. "Antwort sagen" is wrong.'],
    ],
  ),
  sb2Set(
    'sb2-18',
    'ausbildung',
    `Tag der offenen Tür im Ausbildungszentrum

Du gehst bald von der Schule ab und weißt noch nicht, welcher Beruf zu dir [1]? Dann komm am Samstag, dem 18. März, zu unserem Tag der offenen Tür! Von 10 bis 16 Uhr kannst du bei uns 15 verschiedene Handwerksberufe [2] – vom Elektroniker über die Friseurin bis zum Zimmermann.

In unseren Werkstätten zeigen dir Auszubildende ihre [3]. Du darfst auch selbst etwas ausprobieren: Wie wäre es zum Beispiel, eine kleine Holzkiste zu bauen oder eine Lampe [4]?

Außerdem kannst du mit Ausbildern sprechen und dich über die [5] informieren: Welchen Schulabschluss brauchst du? Wie lange dauert die Ausbildung?

Viele Betriebe suchen [6] Auszubildende. Wenn dir ein Beruf gefällt, kannst du an diesem Tag gleich einen Termin für ein Praktikum [7]. Bring am besten deinen Lebenslauf und dein letztes [8] mit.

Auch deine Eltern sind herzlich willkommen. Für sie gibt es um 13 Uhr einen [9] zum Thema „Wie unterstütze ich mein Kind bei der Berufswahl?“.

Der Eintritt ist [10]. Für Essen und Getränke ist gesorgt.`,
    ['anschließen', 'anzuschließen', 'Arbeit', 'dringend', 'frei', 'gelernt', 'kennenlernen', 'passen', 'passt', 'vereinbaren', 'Voraussetzungen', 'Vorstellung', 'Vortrag', 'Zeugnis', 'Zeugnissen'],
    [
      ['passt', '„Welcher Beruf passt zu dir?“ – Subjekt Singular → „passt“.', '"Which job suits you?" – singular subject → "passt".'],
      ['kennenlernen', '„Berufe kennenlernen“ = erfahren, wie sie sind.', '"get to know trades".'],
      ['Arbeit', '„Auszubildende zeigen dir ihre Arbeit“.', '"Apprentices show you their work".'],
      ['anzuschließen', 'Parallel zu „zu bauen“: Infinitiv mit „zu“, trennbar → „anzuschließen“.', 'Parallel to "zu bauen": zu-infinitive, separable → "anzuschließen".'],
      ['Voraussetzungen', '„sich über die Voraussetzungen informieren“ – die Fragen danach (Schulabschluss …) zeigen es.', '"find out about the requirements" – the questions that follow (school-leaving certificate …) show it.'],
      ['dringend', '„dringend Auszubildende suchen“ = sehr nötig brauchen.', '"urgently looking for apprentices".'],
      ['vereinbaren', '„einen Termin vereinbaren“.', '"make an appointment".'],
      ['Zeugnis', '„dein letztes Zeugnis“ – neutral Singular wie „dein letztes“.', '"your last school report" – neuter singular like "dein letztes".'],
      ['Vortrag', '„einen Vortrag zum Thema …“ – maskulin wie „einen“. „Vorstellung“ ist feminin.', '"a talk on …" – masculine like "einen". "Vorstellung" is feminine.'],
      ['frei', '„Der Eintritt ist frei“ = kostenlos.', '"Admission is free".'],
    ],
  ),
  sb2Set(
    'sb2-19',
    'freizeit',
    `Sehr geehrte Damen und Herren,

ich bin vor Kurzem nach Lindenberg gezogen und suche einen Schwimmverein für meine Tochter und mich. Auf Ihrer Internetseite habe ich gesehen, dass Sie Kurse für Kinder und Erwachsene [1].

Meine Tochter ist acht Jahre alt und kann schon ein bisschen schwimmen. Sie hat im letzten Sommer das Seepferdchen-Abzeichen [2]. Jetzt möchte sie gern regelmäßig trainieren. Gibt es bei Ihnen eine Gruppe, die für ihr [3] passt?

Ich selbst bin früher viel geschwommen, habe aber in den letzten Jahren kaum noch Sport [4]. Deshalb würde ich gern in einer Gruppe für Wiedereinsteiger [5]. Leider arbeite ich bis 18 Uhr, ich kann also nur abends oder am Wochenende.

Könnten Sie mir bitte [6], wie hoch der Mitgliedsbeitrag ist? Gibt es vielleicht einen [7] für Familien?

Außerdem würde ich gern wissen, ob man vorher ein [8] machen kann, bevor man Mitglied wird. Ich möchte zuerst sehen, ob uns das Training [9].

Mit freundlichen Grüßen
Nadia Haddad

P.S. Brauchen wir für die Anmeldung ein ärztliches [10]?`,
    ['Alter', 'anbieten', 'anbietet', 'Attest', 'bekommen', 'Ermäßigung', 'fragen', 'gefällt', 'gelernt', 'getrieben', 'mitmachen', 'mitteilen', 'Probetraining', 'Rabatt', 'schmeckt'],
    [
      ['anbieten', '„dass Sie Kurse anbieten“ – Subjekt „Sie“ → „anbieten“. „anbietet“ ist 3. Person Singular.', '"that you offer courses" – subject "Sie" → "anbieten". "anbietet" is 3rd person singular.'],
      ['bekommen', '„ein Abzeichen bekommen“. „ein Abzeichen gelernt“ ist falsch.', '"get a badge". "learnt a badge" is wrong.'],
      ['Alter', '„für ihr Alter passen“ – sie ist acht Jahre alt.', '"suit her age" – she is eight.'],
      ['getrieben', '„Sport treiben“ – Perfekt „habe … getrieben“.', '"Sport treiben" (do sport) – perfect "habe … getrieben".'],
      ['mitmachen', '„in einer Gruppe mitmachen“ = teilnehmen.', '"join in a group".'],
      ['mitteilen', '„jemandem etwas mitteilen“ = sagen, informieren. „fragen“ passt nicht zu „mir … wie hoch“.', '"let me know". "fragen" does not fit "mir … how high".'],
      ['Rabatt', '„einen Rabatt für Familien“ – maskulin wie „einen“. „Ermäßigung“ ist feminin.', '"a discount for families" – masculine like "einen". "Ermäßigung" is feminine.'],
      ['Probetraining', '„ein Probetraining machen“ = einmal zum Testen mittrainieren.', '"do a trial session".'],
      ['gefällt', '„ob uns das Training gefällt“.', '"whether we like the training".'],
      ['Attest', '„ein ärztliches Attest“ = Bescheinigung vom Arzt.', '"a medical certificate".'],
    ],
  ),
  sb2Set(
    'sb2-20',
    'gesundheit',
    `Gesund im Büro

Viele Menschen, die im Büro arbeiten, [1] unter Rückenschmerzen. Kein Wunder: Sie sitzen oft acht Stunden oder länger vor dem Computer und bewegen sich kaum. Mit ein paar einfachen Regeln können Sie aber viel für Ihre Gesundheit [2].

Achten Sie zuerst auf Ihren Arbeitsplatz. Der Bildschirm sollte etwa eine Armlänge von Ihren Augen [3] sein. Stellen Sie Ihren Stuhl so ein, dass Ihre Füße ganz auf dem Boden stehen.

Am wichtigsten ist aber Bewegung. Stehen Sie mindestens einmal pro Stunde [4] und gehen Sie ein paar Schritte. Telefonieren Sie zum Beispiel im Stehen, oder [5] Sie Ihre Kollegen im Büro nebenan, statt ihnen eine E-Mail zu schreiben.

Auch in der Mittagspause sollten Sie nicht am Schreibtisch [6]. Ein kurzer Spaziergang an der frischen Luft hilft gegen Müdigkeit und macht den Kopf wieder [7].

Nach der Arbeit ist Sport ein guter [8] zum Sitzen. Schwimmen und Radfahren sind besonders gut für den Rücken.

Wenn die Schmerzen trotzdem nicht besser werden, sollten Sie zum Arzt [9]. Viele Krankenkassen bieten außerdem kostenlose Kurse an, zum Beispiel eine Rückenschule. Fragen Sie [10] bei Ihrer Kasse nach!`,
    ['ab', 'Ärzte', 'auf', 'Ausgleich', 'besuchen', 'besucht', 'bleiben', 'einfach', 'entfernt', 'Ergebnis', 'frei', 'gehen', 'haben', 'leiden', 'tun'],
    [
      ['leiden', '„unter etwas leiden“ = Schmerzen/Probleme haben.', '"suffer from something".'],
      ['tun', '„viel für die Gesundheit tun“.', '"do a lot for your health".'],
      ['entfernt', '„eine Armlänge entfernt sein“ = so weit weg.', '"be an arm\'s length away".'],
      ['auf', '„aufstehen“ – „stehen Sie … auf“.', '"aufstehen" (get up) – "stehen Sie … auf".'],
      ['besuchen', '„Kollegen besuchen“ = zu ihnen gehen. „besucht“ passt nicht zum Imperativ.', '"visit colleagues". "besucht" does not fit the imperative.'],
      ['bleiben', '„nicht am Schreibtisch bleiben“.', '"not stay at your desk".'],
      ['frei', '„den Kopf frei machen“ = sich wieder konzentrieren können.', '"clear your head".'],
      ['Ausgleich', '„ein guter Ausgleich zum Sitzen“ – maskulin wie „ein guter“. „Ergebnis“ ist neutral.', '"a good balance to sitting" – masculine like "ein guter". "Ergebnis" is neuter.'],
      ['gehen', '„zum Arzt gehen“.', '"go to the doctor".'],
      ['einfach', '„Fragen Sie einfach nach!“ = ohne Problem, ganz leicht.', '"Just ask!".'],
    ],
  ),
];
