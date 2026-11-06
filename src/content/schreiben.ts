// Owned by the Schreiben + Modelltest agent. Keep the export names: the Modelltest imports them.
//
// Every e-mail, Leitpunkt and model answer below was written for this app. It
// follows the format of telc Deutsch B1 (an e-mail to answer, four points, an
// informal or semi-formal reply of about 100–150 words) and copies no telc text.
import type { PhraseGroup, WritingTask } from './types.ts';

export const writingTasks: WritingTask[] = [
  {
    id: 'schreiben-01',
    topic: 'wohnen',
    register: 'informal',
    incoming: {
      from: 'Tobias',
      subject: 'Umzug am Samstag – hilfst du mir?',
      body: `Hallo,

endlich ist es so weit: Ich habe eine neue Wohnung gefunden und ziehe am nächsten Samstag um. Die Wohnung ist größer und liegt näher an meiner Arbeit. Leider haben zwei Freunde, die mir helfen wollten, kurzfristig abgesagt. Hättest du vielleicht Zeit? Ich brauche jemanden zum Tragen und vielleicht auch ein paar Kartons. Du bist doch letztes Jahr auch umgezogen – hast du einen Tipp für mich?

Ich würde mich sehr über eine Antwort freuen!

Viele Grüße
Tobias`,
    },
    points: [
      'ob Sie am Samstag helfen können',
      'was Sie mitbringen können',
      'welchen Tipp Sie für den Umzug haben',
      'wie Sie nach dem Umzug feiern könnten',
    ],
    model: `Lieber Tobias,

vielen Dank für deine E-Mail. Herzlichen Glückwunsch zur neuen Wohnung! Natürlich helfe ich dir am Samstag gern. Allerdings kann ich erst ab 10 Uhr kommen, weil ich morgens noch meine Mutter zum Bahnhof bringen muss. Ist das in Ordnung?

In meinem Keller stehen noch etwa zehn Kartons von meinem Umzug. Die bringe ich dir mit, außerdem Klebeband und ein paar alte Decken für die Möbel.

Mein wichtigster Tipp: Schreib auf jeden Karton, in welches Zimmer er gehört. Dann geht das Auspacken viel schneller. Bei mir hat das super funktioniert.

Wenn alles fertig ist, sollten wir ein bisschen feiern. Wie wäre es mit Pizza und einem kühlen Getränk auf deinem neuen Balkon?

Bis Samstag und viele Grüße
Deine Elena`,
  },
  {
    id: 'schreiben-02',
    topic: 'familie',
    register: 'informal',
    incoming: {
      from: 'Sabine',
      subject: 'Wir heiraten!',
      body: `Hallo,

ich habe tolle Neuigkeiten: Marco und ich heiraten am 14. Juni! Die Feier findet in einem kleinen Hotel am See statt, ungefähr eine Stunde von dir entfernt. Wir würden uns riesig freuen, wenn du dabei bist. Natürlich kannst du gern auch jemanden mitbringen. Gib mir bitte bis Ende des Monats Bescheid, damit ich alles planen kann. Ach ja, viele Gäste fragen schon nach Geschenken – wir haben aber eigentlich alles.

Liebe Grüße
Sabine`,
    },
    points: [
      'sich bedanken und zusagen',
      'wer mitkommt',
      'ob Sie im Hotel übernachten möchten',
      'welche Geschenkidee Sie haben',
    ],
    model: `Liebe Sabine,

herzlichen Dank für die Einladung! Ich freue mich so sehr für euch beide. Selbstverständlich komme ich am 14. Juni zu eurer Hochzeit.

Wenn es für euch in Ordnung ist, bringe ich meinen Freund Jonas mit. Du hast ihn ja schon im letzten Sommer kennengelernt.

Nach der Feier möchten wir nicht mehr mit dem Auto nach Hause fahren. Deshalb würden wir gern im Hotel übernachten. Kannst du mir sagen, ob es noch freie Zimmer gibt und was eine Nacht kostet?

Zum Geschenk habe ich eine Idee: Ihr reist doch so gern. Vielleicht könnten alle Gäste etwas Geld für eure Hochzeitsreise geben? Dann bekommt ihr keine Sachen, die ihr nicht braucht.

Ich wünsche euch eine schöne Zeit bei den Vorbereitungen!

Liebe Grüße
Deine Aylin`,
  },
  {
    id: 'schreiben-03',
    topic: 'ausbildung',
    register: 'semiformal',
    incoming: {
      from: 'Karin Becker (Volkshochschule)',
      subject: 'Ihr Deutschkurs – Ihre Meinung ist uns wichtig',
      body: `Liebe Kursteilnehmerinnen und Kursteilnehmer,

unser B1-Kurs endet in zwei Wochen. Ich möchte unsere Kurse immer weiter verbessern und bitte Sie deshalb um eine kurze Rückmeldung. Was hat Ihnen gut gefallen, und was sollten wir ändern? Im Herbst beginnt außerdem ein B2-Kurs am Abend. Wenn Sie Interesse haben, schreiben Sie mir bitte auch, welche Themen Sie sich dafür wünschen.

Vielen Dank und freundliche Grüße
Karin Becker`,
    },
    points: [
      'was Ihnen im Kurs gefallen hat',
      'was man verbessern könnte',
      'ob Sie den B2-Kurs besuchen möchten',
      'welche Themen Sie sich wünschen',
    ],
    model: `Liebe Frau Becker,

vielen Dank für Ihre E-Mail. Gern schreibe ich Ihnen meine Meinung zum Kurs.

Besonders gut haben mir die Gespräche in kleinen Gruppen gefallen. Dabei konnte ich viel sprechen und habe meine Angst vor Fehlern verloren. Auch Ihre Erklärungen zur Grammatik waren immer sehr klar. Außerdem fand ich unseren Ausflug ins Stadtmuseum sehr interessant.

Verbessern könnte man vielleicht die Hausaufgaben. Manchmal waren es zu viele, und als Berufstätige hatte ich abends wenig Zeit dafür.

Den B2-Kurs im Herbst möchte ich auf jeden Fall besuchen, weil ich im nächsten Jahr eine Ausbildung als Pflegefachkraft beginnen will. Deshalb würde ich mir Themen aus der Arbeitswelt wünschen, zum Beispiel Bewerbungen, Telefongespräche und Gespräche mit Kollegen.

Ich freue mich schon auf den neuen Kurs.

Mit freundlichen Grüßen
Maria Santos`,
  },
  {
    id: 'schreiben-04',
    topic: 'arbeit',
    register: 'semiformal',
    incoming: {
      from: 'Thomas Wagner (Teamleiter Lager)',
      subject: 'Dienstplan nächste Woche',
      body: `Guten Tag,

wie Sie vielleicht schon gehört haben, ist unser Kollege Herr Fischer für zwei Wochen krank. Deshalb muss ich den Dienstplan für nächste Woche ändern. Könnten Sie am Donnerstag und Freitag die Frühschicht übernehmen? Dafür würden Sie am Montag oder Dienstag frei bekommen. Ich weiß, dass das sehr kurzfristig ist. Bitte antworten Sie mir bis morgen, damit ich den Plan fertig machen kann.

Viele Grüße
Thomas Wagner`,
    },
    points: [
      'ob Sie die Schichten übernehmen können',
      'warum ein Tag schwierig für Sie ist',
      'welchen Vorschlag Sie machen',
      'was Sie noch wissen möchten',
    ],
    model: `Sehr geehrter Herr Wagner,

vielen Dank für Ihre Nachricht. Es tut mir leid, dass Herr Fischer krank ist, und ich helfe natürlich gern.

Die Frühschicht am Donnerstag kann ich ohne Probleme übernehmen. Am Freitag ist es leider schwierig, weil ich um 8 Uhr einen Arzttermin habe. Diesen Termin habe ich schon vor drei Monaten vereinbart.

Mein Vorschlag wäre deshalb: Ich arbeite am Donnerstag früh und am Freitag in der Spätschicht. Vielleicht kann Frau Yilmaz die Frühschicht am Freitag machen? Sie hat mir gesagt, dass sie gern mehr Stunden arbeiten möchte.

Außerdem habe ich noch eine Frage: Bekomme ich den freien Tag am Montag oder am Dienstag? Dann kann ich die Betreuung meiner Kinder besser planen.

Für Rückfragen stehe ich Ihnen gern zur Verfügung.

Mit freundlichen Grüßen
Ahmed Karimi`,
  },
  {
    id: 'schreiben-05',
    topic: 'gesundheit',
    register: 'informal',
    incoming: {
      from: 'Markus',
      subject: 'Pech beim Fußball',
      body: `Hi,

stell dir vor: Beim Fußballspielen am Sonntag bin ich so unglücklich gefallen, dass ich mir das Bein gebrochen habe. Jetzt liege ich im Krankenhaus und muss noch mindestens eine Woche bleiben. Die Ärzte sind sehr nett, aber mir ist total langweilig! Und zu Hause kümmert sich niemand um meine Katze, weil meine Freundin gerade beruflich in Hamburg ist. Was gibt es bei dir Neues? Schreib mir doch mal!

Viele Grüße aus Zimmer 214
Markus`,
    },
    points: [
      'gute Besserung wünschen',
      'wann Sie ihn besuchen können',
      'wie Sie bei der Katze helfen können',
      'was es bei Ihnen Neues gibt',
    ],
    model: `Lieber Markus,

oh je, das tut mir wirklich leid! Ich wünsche dir gute Besserung und hoffe, dass du keine starken Schmerzen mehr hast.

Natürlich besuche ich dich bald. Am Mittwochnachmittag habe ich frei, dann komme ich gegen 15 Uhr vorbei. Soll ich dir etwas mitbringen? Vielleicht ein paar Zeitschriften oder deinen Lieblingskuchen?

Um deine Katze musst du dir keine Sorgen machen. Hat deine Nachbarin vielleicht einen Ersatzschlüssel? Dann hole ich ihn heute noch ab. Bis deine Freundin zurück ist, gehe ich jeden Abend zu dir und gebe der Katze Futter und frisches Wasser.

Bei mir gibt es auch Neuigkeiten: Seit letzter Woche lerne ich Gitarre. Das macht viel Spaß, aber meine Nachbarn finden es bestimmt nicht so toll.

Bis Mittwoch!
Dein Kemal`,
  },
  {
    id: 'schreiben-06',
    topic: 'wohnen',
    register: 'semiformal',
    incoming: {
      from: 'Peter Schulz (Hausverwaltung)',
      subject: 'Neue Fenster im Haus',
      body: `Sehr geehrte Mieterinnen und Mieter,

ab dem 3. März werden in unserem Haus die alten Fenster durch neue ersetzt. Die Handwerker brauchen pro Wohnung etwa einen halben Tag. Bitte teilen Sie mir mit, an welchem Tag zwischen dem 3. und dem 7. März Sie zu Hause sind. Falls Sie keine Zeit haben, können Sie Ihren Schlüssel auch bei einer Nachbarin oder einem Nachbarn lassen. Wenn es in Ihrer Wohnung sonst noch Probleme gibt, schreiben Sie mir bitte ebenfalls.

Mit freundlichen Grüßen
Peter Schulz`,
    },
    points: [
      'wann die Handwerker kommen können',
      'wer sonst einen Schlüssel hat',
      'welches andere Problem es in Ihrer Wohnung gibt',
      'was Sie zu den Arbeiten noch wissen möchten',
    ],
    model: `Sehr geehrter Herr Schulz,

vielen Dank für Ihre Information über die neuen Fenster. Darüber freue ich mich sehr, denn im Winter ist es in meiner Wohnung oft ziemlich kalt.

Am besten passt mir Mittwoch, der 5. März. An diesem Tag habe ich Urlaub und bin den ganzen Tag zu Hause. Falls es am Mittwoch nicht klappt, hat meine Nachbarin Frau Lang aus dem zweiten Stock einen Ersatzschlüssel. Sie ist fast immer zu Hause.

Außerdem möchte ich Ihnen ein anderes Problem mitteilen: Im Badezimmer tropft seit zwei Wochen der Wasserhahn. Könnte ein Handwerker bei dieser Gelegenheit auch danach sehen?

Zum Schluss noch eine Frage: Muss ich vor den Arbeiten meine Möbel von den Fenstern wegstellen?

Vielen Dank im Voraus und mit freundlichen Grüßen
Lukas Meier`,
  },
  {
    id: 'schreiben-07',
    topic: 'freizeit',
    register: 'informal',
    incoming: {
      from: 'Lena',
      subject: 'Tanzkurs?',
      body: `Hallo,

ich habe eine Idee! In der Tanzschule bei mir um die Ecke beginnt im Oktober ein Salsa-Kurs für Anfänger. Der Kurs ist dienstags oder donnerstags um 19 Uhr und kostet 80 Euro für zehn Abende. Allein möchte ich aber nicht hingehen. Hast du nicht Lust mitzukommen? Ich weiß, dass du früher viel Sport gemacht hast. Sag mir bitte bald Bescheid, denn die Plätze sind begrenzt.

Liebe Grüße
Lena`,
    },
    points: [
      'ob Sie Lust auf den Kurs haben',
      'welcher Tag Ihnen besser passt',
      'welche Erfahrungen Sie mit Sport oder Tanzen haben',
      'welche Frage Sie zum Kurs haben',
    ],
    model: `Liebe Lena,

danke für deine Nachricht und die tolle Idee! Schon lange habe ich keinen Sport mehr gemacht, deshalb komme ich sehr gern mit.

Dienstags kann ich leider nicht, weil ich an diesem Tag bis 19 Uhr arbeite. Der Donnerstag passt mir dagegen perfekt.

Wie du weißt, habe ich früher Volleyball im Verein gespielt. Getanzt habe ich aber noch nie, nur auf Partys. Hoffentlich bin ich nicht zu ungeschickt! Zum Glück ist es ja ein Kurs für Anfänger.

Eine Frage habe ich noch: Brauchen wir besondere Schuhe, oder können wir normale Turnschuhe tragen? Vielleicht kannst du in der Tanzschule nachfragen.

Melde dich, wenn du uns angemeldet hast. Danach könnten wir zusammen etwas trinken gehen. Ich freue mich schon sehr darauf!

Liebe Grüße
Dein Sven`,
  },
  {
    id: 'schreiben-08',
    topic: 'gesellschaft',
    register: 'semiformal',
    incoming: {
      from: 'Selin Yilmaz (2. Stock)',
      subject: 'Eine kleine Bitte',
      body: `Liebe Nachbarin, lieber Nachbar,

ich hoffe, es geht Ihnen gut. Mein Mann und ich fahren vom 10. bis 24. August zu unserer Familie in die Türkei. Leider haben wir niemanden, der sich in dieser Zeit um unsere Wohnung kümmert. Könnten Sie vielleicht zweimal pro Woche unsere Blumen gießen und den Briefkasten leeren? Den Schlüssel würde ich Ihnen vorher geben. Natürlich helfe ich Ihnen auch gern einmal, wenn Sie verreisen.

Viele Grüße
Selin Yilmaz`,
    },
    points: [
      'ob Sie helfen können',
      'was Sie über die Pflanzen wissen möchten',
      'wann Sie den Schlüssel abholen können',
      'worum Sie Frau Yilmaz später bitten möchten',
    ],
    model: `Liebe Frau Yilmaz,

vielen Dank für Ihre E-Mail. Natürlich helfe ich Ihnen gern, das ist doch selbstverständlich unter Nachbarn.

Damit Ihren Pflanzen nichts passiert, habe ich noch ein paar Fragen. Wie viel Wasser brauchen die Blumen? Und sollen die Pflanzen auf dem Balkon bleiben oder in die Wohnung?

Den Schlüssel kann ich gern bei Ihnen abholen, dann müssen Sie nicht extra kommen. Am besten passt es mir am Freitagabend nach 18 Uhr. Dann können Sie mir auch gleich zeigen, wo die Gießkanne steht.

Eine kleine Bitte habe ich auch: Im Oktober bin ich eine Woche auf einer Fortbildung in München. Wäre es möglich, dass Sie in dieser Zeit meine Post aus dem Briefkasten nehmen?

Ihnen und Ihrem Mann wünsche ich schon jetzt eine gute Reise!

Viele Grüße
Daniela Roth`,
  },
  {
    id: 'schreiben-09',
    topic: 'essen',
    register: 'informal',
    incoming: {
      from: 'Ali',
      subject: 'Meine Geburtstagsparty',
      body: `Hallo,

am Samstag in zwei Wochen werde ich 30 und möchte das mit einer großen Party feiern! Ich lade ungefähr 25 Leute ein, aber meine Wohnung ist leider ziemlich klein. Und ehrlich gesagt habe ich keine Ahnung, was ich für so viele Gäste kochen soll. Du kochst doch so gut! Könntest du mir vielleicht ein bisschen helfen? Hast du auch eine Idee, wo wir feiern könnten?

Bis bald
Ali`,
    },
    points: [
      'welches Essen Sie vorschlagen',
      'wie Sie helfen können',
      'wo man feiern könnte',
      'wann Sie am Samstag kommen',
    ],
    model: `Lieber Ali,

vielen Dank für deine E-Mail! Wie schön, dass du deinen Geburtstag groß feiern willst. Natürlich helfe ich dir gern.

Für 25 Personen würde ich ein Buffet vorschlagen. Das ist einfach, und jeder kann nehmen, was er mag. Ich mache zum Beispiel zwei große Salate und eine vegetarische Lasagne. Du könntest noch Brot, Käse und etwas Obst kaufen.

Was den Ort betrifft: Im Gemeinschaftsraum von unserem Sportverein kann man für wenig Geld feiern. Soll ich mal fragen, ob er an deinem Geburtstag noch frei ist?

Am Samstag komme ich schon um 15 Uhr, damit wir alles in Ruhe vorbereiten können. Meinen Bruder bringe ich auch mit, er kann beim Tragen helfen.

Ich freue mich schon auf die Party!

Viele Grüße
Deine Nadia`,
  },
  {
    id: 'schreiben-10',
    topic: 'arbeit',
    register: 'semiformal',
    incoming: {
      from: 'Julia Neumann (Personalabteilung, Hotel Seeblick)',
      subject: 'Einladung zum Vorstellungsgespräch',
      body: `Sehr geehrte Bewerberin, sehr geehrter Bewerber,

vielen Dank für Ihre Bewerbung als Mitarbeiterin bzw. Mitarbeiter an der Rezeption. Ihre Unterlagen haben uns gut gefallen, und wir möchten Sie gern kennenlernen. Wir laden Sie deshalb am Dienstag, den 12. Mai, um 10 Uhr zu einem Gespräch in unser Hotel ein. Das Gespräch dauert etwa eine Stunde. Bitte bestätigen Sie den Termin bis Freitag.

Mit freundlichen Grüßen
Julia Neumann`,
    },
    points: [
      'sich für die Einladung bedanken',
      'warum der Termin nicht passt',
      'welchen anderen Termin Sie vorschlagen',
      'was Sie zum Gespräch mitbringen sollen',
    ],
    model: `Sehr geehrte Frau Neumann,

herzlichen Dank für Ihre Einladung zum Vorstellungsgespräch. Ich habe mich sehr darüber gefreut, denn die Stelle an Ihrer Rezeption interessiert mich wirklich.

Leider kann ich am Dienstag, den 12. Mai, nicht kommen. An diesem Tag habe ich die letzte Prüfung meines Deutschkurses, und die kann ich nicht verschieben. Das tut mir sehr leid.

Wäre ein anderer Termin möglich? Am Mittwoch und am Donnerstag in derselben Woche habe ich den ganzen Tag Zeit. Auch ein Gespräch am Montag, den 11. Mai, wäre für mich kein Problem.

Außerdem möchte ich gern wissen, ob ich zum Gespräch noch Unterlagen mitbringen soll, zum Beispiel meine Zeugnisse im Original.

Über eine kurze Antwort würde ich mich freuen.

Mit freundlichen Grüßen
Olga Petrenko`,
  },
  {
    id: 'schreiben-11',
    topic: 'medien',
    register: 'informal',
    incoming: {
      from: 'Mia',
      subject: 'Brauche deinen Rat!',
      body: `Hi,

mein alter Laptop ist kaputt, und ich muss mir schnell einen neuen kaufen. Ich brauche ihn vor allem für mein Studium, also zum Schreiben und für Online-Seminare. Leider habe ich überhaupt keine Ahnung von Technik, und im Geschäft verstehe ich die Verkäufer oft nicht. Du kennst dich doch damit aus! Was soll ich tun? Mehr als 600 Euro kann ich nicht ausgeben.

Danke schon mal und liebe Grüße
Mia`,
    },
    points: [
      'worauf Mia beim Kauf achten soll',
      'ob sie online oder im Geschäft kaufen soll',
      'welche Erfahrungen Sie mit Ihrem Laptop gemacht haben',
      'ob Sie mitkommen können',
    ],
    model: `Liebe Mia,

so ein Pech mit deinem Laptop! Aber keine Sorge, ich helfe dir gern.

Für dein Studium brauchst du keinen teuren Laptop. Wichtig sind ein guter Akku, genug Arbeitsspeicher und eine gute Kamera für die Online-Seminare. Für 600 Euro bekommst du schon ein ordentliches Gerät.

Online ist es oft billiger, aber im Geschäft kannst du den Laptop vorher ausprobieren. Deshalb würde ich in den Laden gehen und dort fragen, ob sie den Preis aus dem Internet auch anbieten.

Mein eigener Laptop ist schon fünf Jahre alt und funktioniert immer noch gut. Allerdings habe ich damals zu wenig Speicher gekauft, und das ärgert mich heute.

Wenn du möchtest, komme ich am Samstagvormittag mit in die Stadt. Danach können wir noch einen Kaffee trinken.

Liebe Grüße
Dein Paul`,
  },
  {
    id: 'schreiben-12',
    topic: 'ausbildung',
    register: 'semiformal',
    incoming: {
      from: 'Sandra Hoffmann (Klassenlehrerin 3b)',
      subject: 'Schulfest am 20. Juni',
      body: `Liebe Eltern der Klasse 3b,

am Samstag, den 20. Juni, feiern wir unser Schulfest. Jede Klasse organisiert einen Stand mit Spielen, Essen oder Getränken. Für unseren Stand brauche ich noch Ihre Hilfe. Wer kann zum Beispiel einen Kuchen backen, beim Aufbau helfen oder zwei Stunden am Stand verkaufen? Ideen für unseren Stand sind ebenfalls herzlich willkommen. Bitte antworten Sie mir bis zum 5. Juni.

Herzliche Grüße
Sandra Hoffmann`,
    },
    points: [
      'wie Sie beim Schulfest helfen können',
      'wann Sie Zeit haben',
      'welche Idee Sie für den Stand haben',
      'was Sie noch wissen möchten',
    ],
    model: `Liebe Frau Hoffmann,

vielen Dank für Ihre Nachricht über das Schulfest. Mein Sohn Leon spricht schon seit Tagen von nichts anderem!

Gern backe ich für unseren Stand einen Kuchen, vielleicht einen Apfelkuchen. Außerdem kann ich beim Verkaufen helfen. Am besten passt es mir von 14 bis 16 Uhr, weil ich am Vormittag noch arbeiten muss.

Für den Stand hätte ich eine Idee: Die Kinder könnten selbst gemachte Limonade verkaufen. Das ist billig und gesund und macht den Kindern bestimmt Spaß. Die Zitronen und den Zucker kann ich gern besorgen. Das Geld könnte dann in die Klassenkasse gehen.

Zum Schluss habe ich noch eine Frage: Dürfen auch Geschwister zum Fest kommen? Leons kleine Schwester möchte nämlich unbedingt mitkommen.

Mit freundlichen Grüßen
Mehmet Aydin`,
  },
  {
    id: 'schreiben-13',
    topic: 'reisen',
    register: 'informal',
    incoming: {
      from: 'Paul',
      subject: 'Zurück aus Norwegen',
      body: `Hallo,

seit gestern bin ich wieder zu Hause. Die drei Wochen in Norwegen waren einfach fantastisch: Berge, Seen und fast keine Menschen! Wir haben gezeltet und sind jeden Tag gewandert. Nur das Wetter war manchmal nicht so toll. Und wie war dein Sommer? Hast du schon Pläne für den Herbst? Ich habe übrigens über 500 Fotos gemacht …

Viele Grüße
Paul`,
    },
    points: [
      'wie Ihr Sommer war',
      'welche Reisepläne Sie für den Herbst haben',
      'was Sie über Norwegen wissen möchten',
      'wann Sie sich treffen können',
    ],
    model: `Lieber Paul,

schön, dass du wieder da bist! Deine Reise klingt wirklich toll, auch wenn das Wetter nicht immer gut war.

Mein Sommer war leider nicht so spannend. Ich musste viel arbeiten, weil zwei Kollegen im Urlaub waren. Am Wochenende war ich aber oft mit meiner Schwester am See schwimmen.

Im Oktober habe ich endlich zwei Wochen frei. Vielleicht fahre ich nach Portugal, denn dort ist es im Herbst noch warm.

Norwegen interessiert mich sehr. Wie teuer war das Leben dort? Man hört ja, dass das Essen sehr viel kostet. Und hattet ihr keine Angst, allein in den Bergen zu zelten?

Am besten erzählst du mir alles persönlich. Hast du nächsten Freitag Zeit? Dann koche ich etwas, und du zeigst mir deine Fotos – aber bitte nicht alle 500!

Viele Grüße
Deine Katja`,
  },
  {
    id: 'schreiben-14',
    topic: 'gesellschaft',
    register: 'semiformal',
    incoming: {
      from: 'Bernd Krüger (Nachbarschaftsverein Weststadt)',
      subject: 'Helferinnen und Helfer gesucht',
      body: `Liebe Nachbarinnen und Nachbarn,

auch in diesem Jahr möchten wir im September wieder ein Straßenfest für alle Bewohnerinnen und Bewohner unseres Viertels organisieren. Dafür suchen wir noch Menschen, die mithelfen: beim Aufbau, beim Kinderprogramm, beim Verkauf von Essen oder bei der Musik. Wenn Sie Zeit und Lust haben, schreiben Sie mir bitte, wobei Sie helfen möchten. Über neue Ideen freuen wir uns natürlich auch.

Mit freundlichen Grüßen
Bernd Krüger`,
    },
    points: [
      'warum Sie mithelfen möchten',
      'wobei Sie helfen können',
      'welche Idee Sie für das Fest haben',
      'welche Information Sie noch brauchen',
    ],
    model: `Sehr geehrter Herr Krüger,

vielen Dank für Ihre E-Mail. Ich wohne erst seit einem halben Jahr in der Weststadt und kenne noch nicht viele Nachbarn. Deshalb möchte ich sehr gern beim Straßenfest mithelfen.

Da ich Erzieherin bin, würde ich am liebsten beim Kinderprogramm mitmachen. Mit Kindern zu spielen und zu basteln macht mir viel Spaß.

Für das Fest habe ich auch eine Idee: In unserem Viertel leben Menschen aus vielen Ländern. Wie wäre es mit einem internationalen Buffet? Jeder bringt ein typisches Gericht aus seiner Heimat mit.

Allerdings habe ich noch eine Frage: Gibt es vor dem Fest ein Treffen für alle Helferinnen und Helfer? Dann könnten wir alles gemeinsam besprechen.

Ich freue mich auf Ihre Antwort.

Mit freundlichen Grüßen
Fatima El Amrani`,
  },
  {
    id: 'schreiben-15',
    topic: 'umwelt',
    register: 'informal',
    incoming: {
      from: 'Clara',
      subject: 'Auto verkaufen?',
      body: `Hallo,

ich denke gerade darüber nach, mein Auto zu verkaufen. Es ist alt, kostet viel Geld und ist natürlich auch schlecht für die Umwelt. In Zukunft möchte ich mit dem Fahrrad zur Arbeit fahren, das sind ungefähr acht Kilometer. Du fährst doch schon seit Jahren mit dem Rad, oder? Wie ist das im Winter oder wenn es regnet? Ich bin mir wirklich noch nicht sicher.

Liebe Grüße
Clara`,
    },
    points: [
      'wie Sie zur Arbeit kommen',
      'welche Vor- und Nachteile das Fahrrad hat',
      'welchen Tipp Sie Clara geben',
      'welchen Vorschlag Sie für das Wochenende machen',
    ],
    model: `Liebe Clara,

was für eine gute Idee! Ich finde es toll, dass du mehr für die Umwelt tun möchtest.

Seit vier Jahren fahre ich fast jeden Tag mit dem Fahrrad zur Arbeit. Nur bei Schnee nehme ich den Bus.

Das Fahrrad hat viele Vorteile: Man spart Geld, bleibt fit und steht nie im Stau. Morgens bin ich nach der Fahrt sogar wacher als früher. Ein Nachteil ist natürlich der Regen. Mit guter Regenkleidung ist das aber kein großes Problem.

Mein Tipp: Verkauf dein Auto nicht sofort. Probier zuerst einen Monat lang aus, ob dir das Radfahren gefällt. Dann weißt du es sicher.

Hast du Lust, am Sonntag eine kleine Radtour mit mir zu machen? Wir könnten am Fluss entlang zu dem neuen Café fahren. Dort zeige ich dir auch meine Regenjacke!

Viele Grüße
Dein Tom`,
  },
  {
    id: 'schreiben-16',
    topic: 'einkaufen',
    register: 'semiformal',
    incoming: {
      from: 'Sabine Lehmann (Kundenservice WohnStil24)',
      subject: 'Ihre Reklamation – Bestellnummer 48213',
      body: `Sehr geehrte Kundin, sehr geehrter Kunde,

vielen Dank für Ihre Nachricht. Es tut uns leid, dass Sie mit Ihrer Bestellung nicht zufrieden sind. Damit wir Ihre Reklamation schnell bearbeiten können, brauchen wir noch einige Informationen. Bitte beschreiben Sie genau, was mit dem Artikel nicht in Ordnung ist, und teilen Sie uns mit, wie wir das Problem für Sie lösen sollen.

Mit freundlichen Grüßen
Sabine Lehmann`,
    },
    points: [
      'was Sie bestellt haben und wann es ankam',
      'was kaputt ist',
      'was Sie jetzt möchten',
      'wie man Sie am besten erreicht',
    ],
    model: `Sehr geehrte Frau Lehmann,

vielen Dank für Ihre schnelle Antwort.

Am 2. April habe ich bei Ihnen einen Schreibtisch aus Holz bestellt. Das Paket ist erst am 15. April angekommen, also fast zwei Wochen später als versprochen.

Leider war der Schreibtisch beschädigt. Eine Ecke der Tischplatte ist gebrochen, und zwei Schrauben haben gefehlt. Deshalb konnte ich den Tisch nicht aufbauen. Fotos von dem Schaden habe ich an diese E-Mail angehängt.

Den ganzen Schreibtisch möchte ich nicht zurückschicken, weil das Paket sehr schwer ist. Am liebsten hätte ich eine neue Tischplatte und die fehlenden Schrauben. Wenn das nicht möglich ist, bitte ich Sie um mein Geld zurück.

Am besten erreichen Sie mich per E-Mail oder nachmittags ab 15 Uhr telefonisch.

Mit freundlichen Grüßen
Jan Kowalski`,
  },
  {
    id: 'schreiben-17',
    topic: 'arbeit',
    register: 'informal',
    incoming: {
      from: 'Jonas',
      subject: 'Neuer Job!',
      body: `Hallo,

ich habe Neuigkeiten: Seit Montag arbeite ich als Koch in einem Restaurant in der Altstadt! Die Kollegen sind sehr nett, aber die Arbeitszeiten sind ganz anders als früher. Ich arbeite jetzt oft abends und am Wochenende. Ehrlich gesagt bin ich nach der Arbeit total müde. Wie läuft es eigentlich bei dir im Job? Wir haben uns schon so lange nicht mehr gesehen!

Liebe Grüße
Jonas`,
    },
    points: [
      'zum neuen Job gratulieren',
      'wie es bei Ihrer Arbeit läuft',
      'welchen Tipp Sie für die Arbeitszeiten haben',
      'wann und wo Sie sich treffen können',
    ],
    model: `Lieber Jonas,

herzlichen Glückwunsch zu deiner neuen Stelle! Ich weiß, wie lange du schon in einem richtigen Restaurant arbeiten wolltest.

Bei mir ist im Moment viel los. In unserer Firma gibt es ein neues Computerprogramm, und ich muss allen Kollegen erklären, wie es funktioniert. Das ist anstrengend, aber auch interessant.

Dass du nach der Arbeit müde bist, kann ich gut verstehen. Am Anfang ist alles neu, und dein Körper muss sich an die späten Arbeitszeiten gewöhnen. Mein Tipp: Geh nicht sofort ins Bett, sondern entspann dich zuerst ein bisschen. Und plane deine freien Tage gut, damit du genug Zeit für Sport und Freunde hast.

Wann hast du denn frei? Vielleicht könnten wir am Montag zusammen frühstücken. Ich kenne ein nettes Café am Markt.

Viele Grüße
Deine Lisa`,
  },
  {
    id: 'schreiben-18',
    topic: 'freizeit',
    register: 'semiformal',
    incoming: {
      from: 'Monika Schmidt (Volkshochschule)',
      subject: 'Ihr Fotokurs am Wochenende',
      body: `Sehr geehrte Teilnehmerinnen und Teilnehmer,

leider müssen wir Ihnen mitteilen, dass der Fotokurs „Bessere Bilder mit dem Smartphone“ am 8. und 9. November nicht stattfinden kann, weil der Kursleiter krank ist. Wir können Ihnen zwei neue Termine anbieten: den 22./23. November oder den 6./7. Dezember. Wenn keiner dieser Termine passt, bekommen Sie die Kursgebühr natürlich zurück. Bitte geben Sie uns bis Ende der Woche Bescheid.

Mit freundlichen Grüßen
Monika Schmidt`,
    },
    points: [
      'wie Sie auf die Absage reagieren',
      'welcher neue Termin für Sie passt',
      'ob eine Freundin noch mitmachen kann',
      'welche anderen Kurse Sie interessieren',
    ],
    model: `Sehr geehrte Frau Schmidt,

vielen Dank für Ihre Nachricht. Schade, dass der Kurs ausfällt, aber das ist natürlich verständlich. Ich wünsche dem Kursleiter gute Besserung.

Der Termin am 22. und 23. November passt mir gut. Im Dezember habe ich dagegen keine Zeit, weil ich mit meiner Familie verreise. Bitte melden Sie mich deshalb für den neuen Termin im November an. Die Kursgebühr müssen Sie mir also nicht zurückzahlen.

Eine Freundin von mir möchte gern auch an dem Kurs teilnehmen. Gibt es noch einen freien Platz? Wenn ja, wie kann sie sich anmelden?

Außerdem interessiere ich mich für Ihre Computerkurse. Bieten Sie im nächsten Jahr vielleicht einen Kurs zur Bildbearbeitung an? Gern würde ich lernen, wie man Fotos am Computer schöner macht.

Mit freundlichen Grüßen
Elif Demir`,
  },
  {
    id: 'schreiben-19',
    topic: 'familie',
    register: 'informal',
    incoming: {
      from: 'Anna',
      subject: 'Unser kleiner Sohn ist da!',
      body: `Hallo,

ich habe wunderbare Nachrichten: Am Dienstag ist unser Sohn Felix auf die Welt gekommen! Er ist gesund, wiegt 3400 Gramm und schläft – zum Glück – schon ziemlich viel. Seit gestern sind wir wieder zu Hause, noch ein bisschen müde, aber sehr glücklich. Du musst ihn unbedingt bald kennenlernen! Was gibt es bei dir Neues?

Ganz liebe Grüße
Anna`,
    },
    points: [
      'gratulieren',
      'wann Sie zu Besuch kommen können',
      'welche Hilfe Sie anbieten',
      'was es bei Ihnen Neues gibt',
    ],
    model: `Liebe Anna,

herzlichen Glückwunsch zur Geburt von Felix! Ich habe mich riesig über deine Nachricht gefreut. Schön, dass es euch beiden gut geht.

Natürlich möchte ich den Kleinen so bald wie möglich sehen. Passt es euch am Samstagnachmittag? Lange bleibe ich auch nicht, denn ihr braucht sicher viel Ruhe.

Kann ich euch irgendwie helfen? Ich könnte zum Beispiel für euch einkaufen oder eine große Portion Suppe kochen. Dann müsst ihr euch in den ersten Wochen nicht ums Essen kümmern. Für Felix habe ich übrigens schon ein kleines Geschenk gekauft.

Bei mir gibt es auch eine Neuigkeit: Endlich habe ich meine B1-Prüfung bestanden! Jetzt suche ich eine Stelle als Krankenpflegerin. Drück mir bitte die Daumen!

Ganz liebe Grüße, auch an Felix und deinen Mann
Deine Irina`,
  },
  {
    id: 'schreiben-20',
    topic: 'gesundheit',
    register: 'semiformal',
    incoming: {
      from: 'Praxis Dr. Klein',
      subject: 'Ihr Termin am 18. Oktober',
      body: `Sehr geehrte Patientin, sehr geehrter Patient,

leider müssen wir Ihren Termin am 18. Oktober um 9:30 Uhr absagen, weil unsere Praxis wegen einer Fortbildung geschlossen ist. Bitte teilen Sie uns mit, wann Sie einen neuen Termin möchten. In dringenden Fällen wenden Sie sich bitte an unsere Vertretung, die Praxis Dr. Berger in der Lindenstraße 4. Wir bitten um Ihr Verständnis.

Mit freundlichen Grüßen
Ihr Praxisteam Dr. Klein`,
    },
    points: [
      'wie Sie auf die Absage reagieren',
      'wann Sie einen neuen Termin möchten',
      'warum Sie vorher ein Rezept brauchen',
      'was Sie zum neuen Termin noch wissen möchten',
    ],
    model: `Sehr geehrtes Praxisteam,

vielen Dank für Ihre Information. Ich verstehe natürlich, dass die Praxis wegen der Fortbildung geschlossen ist.

Gern hätte ich einen neuen Termin in der Woche danach. Am besten passt es mir am Dienstag oder Mittwoch, weil ich an diesen Tagen erst mittags arbeiten muss. Ein Termin am frühen Morgen wäre also ideal.

Allerdings habe ich ein kleines Problem: Meine Tabletten gegen Bluthochdruck sind in einer Woche alle. Könnten Sie mir bitte schon vorher ein neues Rezept ausstellen? Dann hole ich es gern in der Praxis ab.

Zum Schluss noch eine Frage: Bei dem Termin soll auch Blut abgenommen werden. Muss ich dafür nüchtern kommen, oder darf ich vorher frühstücken?

Vielen Dank im Voraus und freundliche Grüße
Andrzej Nowak`,
  },
];

export const writingPhrases: PhraseGroup[] = [
  {
    id: 'anrede-informell',
    label: { de: 'Anrede (informell)', en: 'Greeting (informal)' },
    phrases: [
      { de: 'Liebe Jana,', en: 'Dear Jana, (to a woman)' },
      { de: 'Lieber Tobias,', en: 'Dear Tobias, (to a man)' },
      { de: 'Hallo Mia,', en: 'Hi Mia,' },
      { de: 'Hallo zusammen,', en: 'Hi everyone,' },
    ],
  },
  {
    id: 'anrede-halbformell',
    label: { de: 'Anrede (halbformell)', en: 'Greeting (semi-formal)' },
    phrases: [
      { de: 'Sehr geehrte Frau …,', en: 'Dear Ms … (formal)' },
      { de: 'Sehr geehrter Herr …,', en: 'Dear Mr … (formal)' },
      { de: 'Liebe Frau …,', en: 'Dear Ms … (friendly but polite)' },
      { de: 'Lieber Herr …,', en: 'Dear Mr … (friendly but polite)' },
      { de: 'Sehr geehrte Damen und Herren,', en: 'Dear Sir or Madam,' },
    ],
  },
  {
    id: 'einleitung',
    label: { de: 'Einleitung', en: 'Opening' },
    phrases: [
      { de: 'vielen Dank für deine E-Mail.', en: 'thank you for your e-mail. (du)' },
      { de: 'vielen Dank für Ihre Nachricht.', en: 'thank you for your message. (Sie)' },
      { de: 'ich habe mich sehr über deine Nachricht gefreut.', en: 'I was very happy to get your message.' },
      { de: 'entschuldige, dass ich erst jetzt antworte.', en: 'sorry for only replying now.' },
      { de: 'wie schön, dass …', en: 'how nice that …' },
      { de: 'gern beantworte ich Ihre Fragen.', en: 'I am happy to answer your questions.' },
    ],
  },
  {
    id: 'bedanken',
    label: { de: 'Sich bedanken', en: 'Thanking' },
    phrases: [
      { de: 'Vielen Dank für …', en: 'Many thanks for …' },
      { de: 'Herzlichen Dank für die Einladung!', en: 'Thank you so much for the invitation!' },
      { de: 'Das ist sehr nett von dir.', en: 'That is very kind of you. (du)' },
      { de: 'Das ist sehr freundlich von Ihnen.', en: 'That is very kind of you. (Sie)' },
      { de: 'Ich bedanke mich herzlich für Ihre Hilfe.', en: 'Thank you very much for your help.' },
    ],
  },
  {
    id: 'entschuldigen',
    label: { de: 'Sich entschuldigen / absagen', en: 'Apologising / declining' },
    phrases: [
      { de: 'Es tut mir leid, dass …', en: 'I am sorry that …' },
      { de: 'Leider kann ich nicht kommen, weil …', en: 'Unfortunately I cannot come because …' },
      { de: 'Entschuldige bitte, dass …', en: 'Please excuse that … (du)' },
      { de: 'Ich bitte um Entschuldigung, dass …', en: 'I apologise that … (Sie)' },
      { de: 'Das ist leider schwierig, denn …', en: 'That is difficult, unfortunately, because …' },
    ],
  },
  {
    id: 'zusagen',
    label: { de: 'Zusagen / Glückwünsche', en: 'Accepting / congratulating' },
    phrases: [
      { de: 'Ich komme sehr gern.', en: 'I would love to come.' },
      { de: 'Natürlich helfe ich dir gern.', en: 'Of course I am happy to help you.' },
      { de: 'Herzlichen Glückwunsch zu …!', en: 'Congratulations on …!' },
      { de: 'Ich wünsche dir gute Besserung.', en: 'I hope you get well soon.' },
      { de: 'Ich freue mich sehr für dich.', en: 'I am very happy for you.' },
    ],
  },
  {
    id: 'vorschlag',
    label: { de: 'Vorschläge machen', en: 'Making suggestions' },
    phrases: [
      { de: 'Wie wäre es, wenn wir …?', en: 'How about if we …?' },
      { de: 'Ich schlage vor, dass …', en: 'I suggest that …' },
      { de: 'Hast du Lust, … zu …?', en: 'Do you feel like …? (du)' },
      { de: 'Wir könnten zum Beispiel …', en: 'We could, for example, …' },
      { de: 'Was halten Sie davon, wenn …?', en: 'What do you think about …? (Sie)' },
      { de: 'Mein Vorschlag wäre: …', en: 'My suggestion would be: …' },
    ],
  },
  {
    id: 'bitten',
    label: { de: 'Um etwas bitten / fragen', en: 'Asking for something' },
    phrases: [
      { de: 'Könntest du mir bitte sagen, …?', en: 'Could you please tell me …? (du)' },
      { de: 'Könnten Sie mir bitte mitteilen, …?', en: 'Could you please let me know …? (Sie)' },
      { de: 'Ich wäre Ihnen dankbar, wenn …', en: 'I would be grateful if …' },
      { de: 'Ich habe noch eine Frage: …', en: 'I have one more question: …' },
      { de: 'Weißt du vielleicht, ob …?', en: 'Do you happen to know whether …?' },
      { de: 'Wäre es möglich, dass …?', en: 'Would it be possible that …?' },
    ],
  },
  {
    id: 'gruende',
    label: { de: 'Gründe nennen / Meinung', en: 'Giving reasons / opinions' },
    phrases: [
      { de: '…, weil …', en: '…, because … (verb last)' },
      { de: '…, denn …', en: '…, because … (normal word order)' },
      { de: 'Der Grund dafür ist, dass …', en: 'The reason is that …' },
      { de: 'Ich finde es wichtig, dass …', en: 'I think it is important that …' },
      { de: 'Meiner Meinung nach …', en: 'In my opinion …' },
      { de: 'Für mich ist … besonders wichtig.', en: 'For me … is especially important.' },
    ],
  },
  {
    id: 'konnektoren',
    label: { de: 'Konnektoren', en: 'Linking words' },
    phrases: [
      { de: 'Deshalb …', en: 'That is why … (verb next)' },
      { de: 'Trotzdem …', en: 'Nevertheless … (verb next)' },
      { de: '…, obwohl …', en: '…, although … (verb last)' },
      { de: 'Außerdem …', en: 'Besides / in addition … (verb next)' },
      { de: 'Allerdings …', en: 'However … (verb next)' },
      { de: 'Zuerst … Danach … Zum Schluss …', en: 'First … then … finally …' },
      { de: '…, damit …', en: '…, so that … (verb last)' },
      { de: '…, sondern …', en: '…, but rather …' },
      { de: 'Wenn …, dann …', en: 'If …, then …' },
    ],
  },
  {
    id: 'schluss',
    label: { de: 'Schluss', en: 'Closing line' },
    phrases: [
      { de: 'Ich freue mich auf deine Antwort.', en: 'I look forward to your reply. (du)' },
      { de: 'Ich freue mich auf Ihre Antwort.', en: 'I look forward to your reply. (Sie)' },
      { de: 'Schreib mir bald!', en: 'Write back soon!' },
      { de: 'Bis bald!', en: 'See you soon!' },
      { de: 'Für Rückfragen stehe ich Ihnen gern zur Verfügung.', en: 'I am happy to answer any questions.' },
      { de: 'Vielen Dank im Voraus.', en: 'Thank you in advance.' },
    ],
  },
  {
    id: 'gruss-informell',
    label: { de: 'Gruß (informell)', en: 'Sign-off (informal)' },
    phrases: [
      { de: 'Viele Grüße', en: 'Best wishes' },
      { de: 'Liebe Grüße', en: 'Love / warm wishes' },
      { de: 'Herzliche Grüße', en: 'Warm regards' },
      { de: 'Dein …', en: 'Yours … (from a man)' },
      { de: 'Deine …', en: 'Yours … (from a woman)' },
    ],
  },
  {
    id: 'gruss-halbformell',
    label: { de: 'Gruß (halbformell)', en: 'Sign-off (semi-formal)' },
    phrases: [
      { de: 'Mit freundlichen Grüßen', en: 'Kind regards (formal)' },
      { de: 'Freundliche Grüße', en: 'Kind regards' },
      { de: 'Viele Grüße', en: 'Best wishes (polite but friendly)' },
    ],
  },
];
