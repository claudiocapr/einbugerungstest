/**
 * Hörverstehen Teil 1: five short texts, heard once, one richtig/falsch
 * statement each. Written for this app in the format of telc Deutsch B1.
 *
 * Two kinds of set, as in the exam's practice material: a radio survey (five
 * people answer one question) and mixed everyday texts (radio, announcements,
 * phone messages). All names and places are fictional.
 */
import type { Hoeren1Set } from '../types.ts';
import { a, b, n, rf } from './build.ts';

export const hoeren1Sets: Hoeren1Set[] = [
  {
    id: 'hoeren1-01',
    topic: 'freizeit',
    items: [
      {
        script: [
          n('Wir haben Menschen in Lindenfeld gefragt: Was machen Sie am liebsten nach Feierabend? Hören Sie einige Antworten.'),
          a('Ich arbeite in einer Bäckerei und fange schon um vier Uhr morgens an.'),
          a('Wenn ich nachmittags nach Hause komme, bin ich ehrlich gesagt ziemlich müde. Dann lege ich mich erst mal eine Stunde hin.'),
          a('Später gehe ich oft mit meiner Nachbarin spazieren, meistens am Fluss entlang. Das tut mir gut, weil ich den ganzen Tag in der warmen Backstube stehe.'),
        ],
        item: rf(
          'Die Frau ruht sich nach der Arbeit zuerst aus.',
          true,
          '„Dann lege ich mich erst mal eine Stunde hin.“ – Sie schläft oder liegt also zuerst eine Stunde.',
          'She says she first lies down for an hour ("lege mich hin") – so she rests first.',
        ),
      },
      {
        script: [
          b('Bei mir ist der Feierabend meistens ziemlich kurz. Ich habe zwei kleine Kinder, und wenn ich um sechs nach Hause komme, wollen die natürlich mit mir spielen.'),
          b('Nach dem Abendessen bringe ich sie ins Bett. Erst danach habe ich ein bisschen Zeit für mich, dann lese ich oder schaue eine Serie.'),
          b('Für Sport oder Freunde bleibt unter der Woche leider kaum Zeit.'),
        ],
        item: rf(
          'Der Mann trifft sich nach der Arbeit oft mit Freunden.',
          false,
          '„Für Sport oder Freunde bleibt unter der Woche leider kaum Zeit.“ – Er trifft Freunde also kaum.',
          'He says there is hardly any time for sport or friends during the week – so he does not meet friends often.',
        ),
      },
      {
        script: [
          a('Ich habe vor einem Jahr angefangen, in einem Chor zu singen. Wir proben jeden Dienstag und Donnerstag im Gemeindehaus.'),
          a('Am Anfang war ich sehr nervös, weil ich keine Noten lesen kann. Aber das ist gar kein Problem, die anderen helfen mir.'),
          a('Inzwischen freue ich mich die ganze Woche auf die Proben.'),
        ],
        item: rf(
          'Die Frau musste Noten lesen können, um im Chor mitzumachen.',
          false,
          '„weil ich keine Noten lesen kann. Aber das ist gar kein Problem“ – Sie singt mit, obwohl sie keine Noten lesen kann.',
          'She cannot read music, but says that is no problem – the others help her.',
        ),
      },
      {
        script: [
          b('Ich sitze den ganzen Tag im Büro vor dem Computer. Deshalb brauche ich nach der Arbeit unbedingt Bewegung.'),
          b('Dreimal pro Woche gehe ich ins Fitnessstudio, und am Freitag spiele ich mit Kollegen Fußball. Danach gehen wir manchmal noch zusammen etwas trinken.'),
          b('Fernsehen finde ich dagegen langweilig.'),
        ],
        item: rf(
          'Der Mann treibt mehrmals in der Woche Sport.',
          true,
          '„Dreimal pro Woche gehe ich ins Fitnessstudio“ – und freitags spielt er noch Fußball.',
          'He goes to the gym three times a week and plays football on Fridays.',
        ),
      },
      {
        script: [
          a('Früher habe ich nach der Arbeit oft noch E-Mails gelesen, auch spät am Abend. Das war keine gute Idee, ich konnte dann schlecht schlafen.'),
          a('Jetzt mache ich das Handy um sieben Uhr aus.'),
          a('Ich koche in Ruhe, rufe meine Schwester an oder kümmere mich um die Blumen auf meinem Balkon.'),
        ],
        item: rf(
          'Die Frau ist abends nicht mehr für ihre Arbeit erreichbar.',
          true,
          '„Jetzt mache ich das Handy um sieben Uhr aus.“ – Abends liest sie keine E-Mails mehr.',
          'She switches her phone off at seven and no longer reads e-mails in the evening.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-02',
    topic: 'reisen',
    items: [
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          a('Und nun die Verkehrsmeldungen. Auf der Autobahn A sieben zwischen Nordheim und Kesselbach gibt es nach einem Unfall einen Stau von etwa zwölf Kilometern.'),
          a('Bitte fahren Sie, wenn möglich, über die Bundesstraße. Die Polizei rechnet damit, dass die Strecke erst gegen Mittag wieder frei ist.'),
          a('In der Innenstadt von Lindenfeld ist die Brückenstraße wegen Bauarbeiten bis Ende des Monats gesperrt.'),
        ],
        item: rf(
          'Autofahrer sollen die Autobahn wegen eines Unfalls möglichst meiden.',
          true,
          '„Bitte fahren Sie, wenn möglich, über die Bundesstraße.“ – Man soll also nicht die Autobahn nehmen.',
          'Drivers are asked to take the main road (Bundesstraße) instead if possible – i.e. avoid the motorway.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          b('Hallo Mira, hier ist Jonas. Ich stehe gerade am Bahnhof, und mein Zug hat leider eine Stunde Verspätung.'),
          b('Ich komme also nicht um fünf, sondern erst gegen sechs bei euch an. Du musst mich nicht abholen, ich nehme dann einfach ein Taxi. Bis später!'),
        ],
        item: rf(
          'Jonas möchte, dass Mira ihn am Bahnhof abholt.',
          false,
          '„Du musst mich nicht abholen, ich nehme dann einfach ein Taxi.“',
          'He says she does not need to pick him up – he will take a taxi.',
        ),
      },
      {
        script: [
          n('Sie sind am Flughafen und hören eine Durchsage.'),
          a('Achtung, eine Durchsage für die Passagiere des Fluges nach Lissabon. Ihr Flug startet heute nicht von Gate zwölf, sondern von Gate achtzehn.'),
          a('Das Boarding beginnt wie geplant um zehn Uhr fünfzehn. Bitte halten Sie Ihre Bordkarte und Ihren Ausweis bereit.'),
        ],
        item: rf(
          'Der Flug nach Lissabon startet später als geplant.',
          false,
          '„Das Boarding beginnt wie geplant um zehn Uhr fünfzehn.“ – Nur das Gate ändert sich, nicht die Zeit.',
          'Boarding starts as planned; only the gate changes, not the time.',
        ),
      },
      {
        script: [
          n('Sie hören einen Tipp im Radio.'),
          b('Sie möchten am Wochenende einen Ausflug machen, aber nicht viel Geld ausgeben? Dann haben wir einen Tipp für Sie:'),
          b('Mit dem Wochenendticket der Regionalbahn können bis zu fünf Personen einen ganzen Tag lang fahren, so oft sie wollen.'),
          b('Das Ticket kostet zweiunddreißig Euro und gilt in allen Regionalzügen und Bussen des Landes. Kaufen können Sie es am Automaten oder in der App.'),
        ],
        item: rf(
          'Mit dem Ticket können mehrere Personen zusammen reisen.',
          true,
          '„können bis zu fünf Personen einen ganzen Tag lang fahren“',
          'Up to five people can travel together for a whole day on one ticket.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Guten Tag, Frau Berger, hier spricht Herr Wolff vom Hotel Seeblick. Sie haben bei uns ein Doppelzimmer für drei Nächte reserviert.'),
          a('Leider ist im Moment die Heizung in diesem Teil des Hauses kaputt. Wir können Ihnen aber ohne Aufpreis ein Zimmer mit Blick auf den See geben.'),
          a('Bitte rufen Sie uns kurz zurück, ob das für Sie in Ordnung ist.'),
        ],
        item: rf(
          'Frau Berger muss für das andere Zimmer mehr bezahlen.',
          false,
          '„Wir können Ihnen aber ohne Aufpreis ein Zimmer mit Blick auf den See geben.“ – „ohne Aufpreis“ heißt: Es kostet nicht mehr.',
          '"ohne Aufpreis" means at no extra charge – she does not pay more.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-03',
    topic: 'einkaufen',
    items: [
      {
        script: [
          n('In unserer Sendung „Geld und Alltag“ geht es heute ums Einkaufen. Wir wollten wissen: Kaufen Sie lieber im Internet oder im Geschäft ein?'),
          b('Kleidung kaufe ich nie im Internet. Ich muss die Sachen anfassen und anprobieren, sonst passt am Ende nichts. Und ständig Pakete zurückschicken, das nervt mich.'),
          b('Aber Bücher und Elektrogeräte bestelle ich schon online, weil es da oft billiger ist.'),
        ],
        item: rf(
          'Der Mann bestellt manche Produkte im Internet.',
          true,
          '„Aber Bücher und Elektrogeräte bestelle ich schon online“ – nur Kleidung kauft er im Geschäft.',
          'He orders books and electrical goods online; only clothes he buys in shops.',
        ),
      },
      {
        script: [
          a('Ich wohne in einem kleinen Dorf. Der nächste Supermarkt ist zehn Kilometer entfernt, und ein Auto habe ich nicht.'),
          a('Für mich ist der Online-Einkauf deshalb eine große Hilfe. Sogar Lebensmittel lasse ich mir einmal pro Woche liefern.'),
        ],
        item: rf(
          'Die Frau fährt jede Woche mit dem Auto zum Supermarkt.',
          false,
          '„ein Auto habe ich nicht“ – Sie lässt sich die Lebensmittel liefern.',
          'She has no car; she has her groceries delivered once a week.',
        ),
      },
      {
        script: [
          b('Ich arbeite selbst in einer kleinen Buchhandlung. Deshalb versuche ich, so viel wie möglich in den Läden in meiner Stadt zu kaufen.'),
          b('Wenn alle nur noch online bestellen, gibt es bald keine Geschäfte mehr in der Innenstadt. Das fände ich wirklich traurig.'),
        ],
        item: rf(
          'Der Mann möchte die Geschäfte in seiner Stadt unterstützen.',
          true,
          '„versuche ich, so viel wie möglich in den Läden in meiner Stadt zu kaufen“',
          'He tries to buy as much as possible in local shops so they do not disappear.',
        ),
      },
      {
        script: [
          a('Online einkaufen ist praktisch, das stimmt. Aber ich hatte schon ein paarmal Ärger.'),
          a('Einmal habe ich eine Jacke bestellt, die nie angekommen ist. Das Geld habe ich erst nach zwei Monaten zurückbekommen.'),
          a('Seitdem bin ich vorsichtig und bestelle nur noch bei Firmen, die ich kenne.'),
        ],
        item: rf(
          'Die Frau hat ihr Geld für die Jacke nie zurückbekommen.',
          false,
          '„Das Geld habe ich erst nach zwei Monaten zurückbekommen.“ – Sie hat es also bekommen, nur spät.',
          'She did get her money back – only after two months.',
        ),
      },
      {
        script: [
          b('Ehrlich gesagt mag ich keine vollen Geschäfte. Am Samstag in der Stadt, überall Menschen, lange Schlangen an der Kasse – das ist nichts für mich.'),
          b('Ich bestelle lieber abends ganz entspannt auf dem Sofa. Und wenn etwas nicht passt, bringe ich es einfach zur Post.'),
        ],
        item: rf(
          'Der Mann geht am Wochenende gern in der Stadt einkaufen.',
          false,
          '„Am Samstag in der Stadt, überall Menschen, lange Schlangen an der Kasse – das ist nichts für mich.“',
          'He dislikes crowded shops on Saturdays and prefers ordering from home.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-04',
    topic: 'dienstleistungen',
    items: [
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Guten Tag, Herr Demir, hier ist das Bürgerbüro Lindenfeld. Sie hatten für morgen einen Termin, um Ihren neuen Reisepass abzuholen.'),
          a('Leider ist der Pass noch nicht da. Wir rufen Sie an, sobald er angekommen ist. Ihren Termin morgen brauchen Sie also nicht wahrzunehmen.'),
        ],
        item: rf(
          'Herr Demir soll morgen nicht ins Bürgerbüro kommen.',
          true,
          '„Ihren Termin morgen brauchen Sie also nicht wahrzunehmen.“ – Der Pass ist noch nicht da.',
          'The passport has not arrived yet, so he does not need to come to his appointment tomorrow.',
        ),
      },
      {
        script: [
          n('Sie rufen bei Ihrer Bank an und hören folgende Ansage.'),
          b('Willkommen bei der Sparkasse Lindenfeld. Unsere Filialen sind am Montag wegen eines Feiertags geschlossen.'),
          b('Bargeld bekommen Sie aber wie immer an unseren Geldautomaten.'),
          b('Wenn Sie Ihre Karte verloren haben, drücken Sie bitte die Eins. Für alle anderen Fragen drücken Sie bitte die Zwei.'),
        ],
        item: rf(
          'Am Montag kann man kein Geld abheben.',
          false,
          '„Bargeld bekommen Sie aber wie immer an unseren Geldautomaten.“ – Nur die Filialen sind geschlossen.',
          'Only the branches are closed; cash machines work as usual.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Hallo, hier ist der Paketdienst Blitz. Leider konnten wir Ihr Paket heute nicht zustellen, weil niemand zu Hause war.'),
          a('Sie können es ab morgen um zehn Uhr in der Postfiliale am Marktplatz abholen. Bitte bringen Sie dafür Ihren Ausweis mit.'),
        ],
        item: rf(
          'Man braucht einen Ausweis, um das Paket abzuholen.',
          true,
          '„Bitte bringen Sie dafür Ihren Ausweis mit.“',
          'You are asked to bring your ID card to collect the parcel.',
        ),
      },
      {
        script: [
          n('Sie hören eine Information im Radio.'),
          b('Eine Information der Stadtverwaltung: Ab nächstem Monat können Bürgerinnen und Bürger viele Formulare auch online ausfüllen, zum Beispiel für die Anmeldung einer neuen Wohnung.'),
          b('Wer lieber persönlich ins Rathaus kommt, kann das natürlich weiterhin tun. Termine gibt es telefonisch oder auf der Internetseite der Stadt.'),
        ],
        item: rf(
          'Man kann die Wohnung bald nur noch im Internet anmelden.',
          false,
          '„Wer lieber persönlich ins Rathaus kommt, kann das natürlich weiterhin tun.“ – Online ist nur eine zusätzliche Möglichkeit.',
          'Going to the town hall in person is still possible; online is just an extra option.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Guten Morgen, Frau Kowalski, hier ist die Praxis Doktor Hartmann. Ihre Blutwerte sind da, und alles ist in Ordnung.'),
          a('Sie müssen also nicht noch einmal zu uns kommen. Wenn Sie trotzdem Fragen haben, rufen Sie uns gern an, am besten vormittags.'),
        ],
        item: rf(
          'Die Untersuchung hat keine Probleme gezeigt.',
          true,
          '„Ihre Blutwerte sind da, und alles ist in Ordnung.“',
          'Her blood test results are fine – everything is in order.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-05',
    topic: 'essen',
    items: [
      {
        script: [
          n('Wir haben Menschen auf dem Wochenmarkt gefragt: Achten Sie darauf, was Sie essen?'),
          a('Ja, sehr. Seit ich ein Baby habe, koche ich fast jeden Tag frisch. Ich kaufe das Gemüse hier auf dem Markt, weil es aus der Region kommt.'),
          a('Fertiggerichte gibt es bei uns eigentlich nie. Das dauert zwar länger, aber es schmeckt auch einfach besser.'),
        ],
        item: rf(
          'Die Frau kocht meistens mit frischen Zutaten.',
          true,
          '„koche ich fast jeden Tag frisch“ – und „Fertiggerichte gibt es bei uns eigentlich nie.“',
          'She cooks fresh food almost every day and never uses ready meals.',
        ),
      },
      {
        script: [
          b('Ich bin Student und habe wenig Geld. Gesund essen ist teuer, finde ich.'),
          b('Meistens esse ich in der Mensa, das ist günstig und eigentlich gar nicht schlecht.'),
          b('Am Wochenende koche ich manchmal mit meinen Mitbewohnern, dann gibt es meistens Nudeln.'),
        ],
        item: rf(
          'Der Mann findet das Essen in der Mensa schlecht.',
          false,
          '„das ist günstig und eigentlich gar nicht schlecht“',
          'He says the canteen food is cheap and actually not bad at all.',
        ),
      },
      {
        script: [
          a('Mein Arzt hat mir letztes Jahr gesagt, dass ich zu viel Zucker esse. Das war ein Schock für mich.'),
          a('Seitdem trinke ich keine Limonade mehr, nur noch Wasser und Tee.'),
          a('Auf Schokolade kann ich aber nicht ganz verzichten – ein kleines Stück am Abend muss sein.'),
        ],
        item: rf(
          'Die Frau isst überhaupt keine Süßigkeiten mehr.',
          false,
          '„Auf Schokolade kann ich aber nicht ganz verzichten“ – ein kleines Stück isst sie jeden Abend.',
          'She cannot give up chocolate completely – she still has a small piece every evening.',
        ),
      },
      {
        script: [
          b('Ehrlich gesagt denke ich nicht viel darüber nach. Ich esse, was mir schmeckt.'),
          b('Ich treibe viel Sport und fahre jeden Tag mit dem Fahrrad zur Arbeit, deshalb mache ich mir keine Sorgen.'),
          b('Aber Fleisch esse ich inzwischen weniger, vielleicht zweimal pro Woche.'),
        ],
        item: rf(
          'Der Mann isst heute seltener Fleisch als früher.',
          true,
          '„Aber Fleisch esse ich inzwischen weniger“ – „inzwischen“ heißt: im Vergleich zu früher.',
          '"inzwischen weniger" – nowadays he eats less meat than before.',
        ),
      },
      {
        script: [
          a('Bei uns in der Familie kocht mein Mann. Er hat einen Kochkurs gemacht und probiert gern neue Rezepte aus, oft vegetarisch.'),
          a('Die Kinder waren am Anfang nicht begeistert, aber jetzt essen sie sogar Brokkoli.'),
          a('Ich bin für das Frühstück zuständig.'),
        ],
        item: rf(
          'Die Kinder mochten das vegetarische Essen sofort.',
          false,
          '„Die Kinder waren am Anfang nicht begeistert“ – erst später haben sie es gern gegessen.',
          'At first the children were not keen; only later did they start to like it.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-06',
    topic: 'gesellschaft',
    items: [
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          a('Lindenfeld. Am Samstag findet auf dem Marktplatz wieder das große Stadtfest statt. Von elf Uhr bis Mitternacht gibt es Musik, Essen aus vielen Ländern und ein Programm für Kinder.'),
          a('Weil viele Besucher erwartet werden, bittet die Stadt, mit Bus und Bahn zu kommen. Die Busse fahren an diesem Tag bis zwei Uhr nachts.'),
        ],
        item: rf(
          'Die Stadt empfiehlt, mit öffentlichen Verkehrsmitteln zum Fest zu fahren.',
          true,
          '„bittet die Stadt, mit Bus und Bahn zu kommen“',
          'The town asks visitors to come by bus and train (public transport).',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          b('Hallo Frau Lehmann, hier ist Tobias Krämer aus dem dritten Stock. Ich habe ein Problem: Ich fahre morgen für zwei Wochen in Urlaub, und mein Nachbar, der sonst meine Blumen gießt, ist krank.'),
          b('Könnten Sie das vielleicht übernehmen? Den Schlüssel würde ich Ihnen heute Abend vorbeibringen. Vielen Dank schon mal!'),
        ],
        item: rf(
          'Herr Krämer bittet Frau Lehmann, seine Post zu holen.',
          false,
          '„der sonst meine Blumen gießt“ – „Könnten Sie das vielleicht übernehmen?“ Es geht um die Blumen, nicht um die Post.',
          'He asks her to water his plants, not to collect his post.',
        ),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          a('Der Verein „Lesepaten Lindenfeld“ sucht neue Mitglieder. Die Ehrenamtlichen lesen einmal pro Woche in Grundschulen mit Kindern, die beim Lesen Hilfe brauchen.'),
          a('Besondere Kenntnisse sind nicht nötig, nur Zeit und Geduld.'),
          a('Wer Interesse hat, kann am Mittwoch um achtzehn Uhr zu einem Infoabend in die Stadtbibliothek kommen.'),
        ],
        item: rf(
          'Für die Arbeit als Lesepate braucht man eine pädagogische Ausbildung.',
          false,
          '„Besondere Kenntnisse sind nicht nötig, nur Zeit und Geduld.“',
          'No special knowledge is needed – just time and patience.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          b('Liebe Eltern, hier eine Information des Kindergartens Sonnenblume. Wegen einer Fortbildung für das Team bleibt der Kindergarten am Freitag geschlossen.'),
          b('Wenn Sie an diesem Tag keine Betreuung für Ihr Kind finden, melden Sie sich bitte bis Mittwoch bei uns. Wir haben eine Notgruppe im Kindergarten am Park organisiert.'),
        ],
        item: rf(
          'Für einige Kinder gibt es am Freitag trotzdem eine Betreuung.',
          true,
          '„Wir haben eine Notgruppe im Kindergarten am Park organisiert.“',
          'There is an emergency group in another kindergarten for children who need care.',
        ),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          a('Und noch eine gute Nachricht zum Schluss: Der Spielplatz im Rosenpark ist nach drei Monaten Umbau wieder offen. Neu sind ein großes Klettergerüst und ein Wasserspielplatz.'),
          a('Die Kosten von rund hunderttausend Euro hat zum größten Teil ein Unternehmen aus der Stadt bezahlt.'),
        ],
        item: rf(
          'Die Stadt hat den Umbau des Spielplatzes allein finanziert.',
          false,
          '„hat zum größten Teil ein Unternehmen aus der Stadt bezahlt“',
          'Most of the cost was paid by a local company, not by the town alone.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-07',
    topic: 'wohnen',
    items: [
      {
        script: [
          n('Heute fragen wir: Wo wohnen Sie lieber – in der Stadt oder auf dem Land? Hier sind einige Antworten unserer Hörerinnen und Hörer.'),
          b('Ich bin auf einem Bauernhof aufgewachsen und wollte immer in die Stadt. Seit fünf Jahren wohne ich jetzt mitten im Zentrum.'),
          b('Ich gehe abends gern aus, ins Kino oder ins Theater, und alles ist zu Fuß erreichbar. Zurück aufs Land möchte ich auf keinen Fall.'),
        ],
        item: rf(
          'Der Mann möchte wieder auf dem Land leben.',
          false,
          '„Zurück aufs Land möchte ich auf keinen Fall.“',
          'He definitely does not want to go back to the countryside.',
        ),
      },
      {
        script: [
          a('Wir sind letztes Jahr aus der Stadt in ein Dorf gezogen, weil die Mieten so hoch waren. Jetzt haben wir ein Haus mit Garten, und die Kinder können draußen spielen.'),
          a('Der Nachteil: Ich fahre jeden Tag eine Stunde zur Arbeit. Aber das ist es mir wert.'),
        ],
        item: rf(
          'Die Frau ist mit dem Umzug zufrieden, obwohl ihr Arbeitsweg länger ist.',
          true,
          '„Ich fahre jeden Tag eine Stunde zur Arbeit. Aber das ist es mir wert.“',
          'She commutes an hour a day but says it is worth it – she is happy with the move.',
        ),
      },
      {
        script: [
          b('Ich bin Rentner und lebe allein. Auf dem Land wäre ich ohne Auto ziemlich verloren.'),
          b('In der Stadt habe ich den Arzt, die Apotheke und den Supermarkt direkt vor der Tür.'),
          b('Außerdem gibt es hier im Stadtteil einen Seniorentreff, da gehe ich zweimal pro Woche hin.'),
        ],
        item: rf(
          'Der Mann schätzt die kurzen Wege in der Stadt.',
          true,
          '„In der Stadt habe ich den Arzt, die Apotheke und den Supermarkt direkt vor der Tür.“',
          'Doctor, pharmacy and supermarket are right on his doorstep – he values that.',
        ),
      },
      {
        script: [
          a('Ich wohne in einer kleinen Stadt, ungefähr zwanzigtausend Einwohner.'),
          a('Für mich ist das die perfekte Mischung: nicht so laut und hektisch wie eine Großstadt, aber trotzdem gibt es Geschäfte, ein Schwimmbad und einen Bahnhof.'),
          a('In einer Stunde bin ich mit dem Zug in der Großstadt, wenn ich mal ins Konzert will.'),
        ],
        item: rf(
          'Die Frau wohnt in einer Großstadt.',
          false,
          '„Ich wohne in einer kleinen Stadt, ungefähr zwanzigtausend Einwohner.“',
          'She lives in a small town of about 20,000 people.',
        ),
      },
      {
        script: [
          b('Ich arbeite als Grafiker von zu Hause aus. Deshalb konnte ich mir den Wohnort frei aussuchen, und ich habe mich für ein Dorf an der Küste entschieden.'),
          b('Das Einzige, was mir manchmal fehlt, ist schnelles Internet. Das ist hier leider immer noch ein Problem.'),
        ],
        item: rf(
          'Der Mann ist mit der Internetverbindung im Dorf zufrieden.',
          false,
          '„Das Einzige, was mir manchmal fehlt, ist schnelles Internet.“',
          'Fast internet is the one thing he misses – it is still a problem in the village.',
        ),
      },
    ],
  },
  {
    id: 'hoeren1-08',
    topic: 'arbeit',
    items: [
      {
        script: [
          n('Sie hören einen Tipp im Radio.'),
          a('Und hier ein Tipp für alle, die eine Ausbildung suchen: Am Samstag findet in der Stadthalle die Ausbildungsmesse statt. Über sechzig Firmen aus der Region stellen sich vor.'),
          a('Bringen Sie am besten Ihren Lebenslauf mit, denn einige Firmen führen direkt vor Ort kurze Gespräche. Der Eintritt ist frei.'),
        ],
        item: rf(
          'Man muss für den Besuch der Messe bezahlen.',
          false,
          '„Der Eintritt ist frei.“',
          'Entry is free.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          b('Guten Tag, Frau Nowak, hier ist Peter Schulz von der Firma Brandt Logistik. Vielen Dank für Ihre Bewerbung.'),
          b('Wir möchten Sie gern zu einem Vorstellungsgespräch einladen, und zwar am Donnerstag um vierzehn Uhr. Bitte sagen Sie uns kurz Bescheid, ob der Termin passt.'),
        ],
        item: rf(
          'Frau Nowak soll den Termin bestätigen.',
          true,
          '„Bitte sagen Sie uns kurz Bescheid, ob der Termin passt.“',
          'She is asked to let them know whether the appointment suits her – i.e. confirm it.',
        ),
      },
      {
        script: [
          n('Sie hören eine Durchsage in einer Firma.'),
          a('Liebe Kolleginnen und Kollegen, eine kurze Information: Die Kantine bleibt wegen Renovierung ab Montag zwei Wochen lang geschlossen.'),
          a('In dieser Zeit können Sie mittags im Café im Erdgeschoss essen. Dort gibt es jeden Tag zwei warme Gerichte zum gleichen Preis wie in der Kantine.'),
        ],
        item: rf(
          'Das Essen im Café ist teurer als in der Kantine.',
          false,
          '„zum gleichen Preis wie in der Kantine“',
          'The meals in the café cost the same as in the canteen.',
        ),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Hallo Lukas, hier ist Sandra. Ich bin heute leider krank und komme nicht ins Büro.'),
          a('Kannst du bitte um zehn das Meeting mit den Kunden aus Hamburg übernehmen? Die Unterlagen liegen auf meinem Schreibtisch, in der blauen Mappe.'),
          a('Danke dir, du hast was gut bei mir!'),
        ],
        item: rf(
          'Lukas soll das Treffen mit den Kunden leiten.',
          true,
          '„Kannst du bitte um zehn das Meeting mit den Kunden aus Hamburg übernehmen?“',
          'Sandra asks Lukas to take over (run) the meeting with the clients.',
        ),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          b('Immer mehr Menschen in Deutschland arbeiten in Teilzeit. Das zeigt eine neue Studie. Vor allem Eltern mit kleinen Kindern wünschen sich weniger Stunden.'),
          b('Aber auch viele junge Leute ohne Kinder wollen mehr Freizeit haben, selbst wenn sie dann weniger verdienen.'),
        ],
        item: rf(
          'Laut der Studie wollen nur Eltern weniger arbeiten.',
          false,
          '„Aber auch viele junge Leute ohne Kinder wollen mehr Freizeit haben“',
          'Many young people without children also want to work less – not only parents.',
        ),
      },
    ],
  },
];
