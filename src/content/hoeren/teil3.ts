/**
 * Hörverstehen Teil 3: five short everyday texts (announcements, recorded
 * messages, radio, short dialogues), each heard twice, one richtig/falsch
 * statement each. Written for this app in the format of telc Deutsch B1; all
 * names, firms and places are fictional.
 */
import type { Hoeren3Set } from '../types.ts';
import { a, b, n, rf } from './build.ts';

export const hoeren3Sets: Hoeren3Set[] = [
  {
    id: 'hoeren3-01',
    topic: 'reisen',
    items: [
      {
        script: [
          n('Sie sind am Bahnhof und hören eine Durchsage.'),
          a('Achtung an Gleis vier: Der Regionalexpress nach Kesselbach, planmäßige Abfahrt sechzehn Uhr zwölf, fährt heute von Gleis sieben.'),
          a('Bitte beachten Sie: Der Zug endet heute bereits in Nordheim. Reisende nach Kesselbach nehmen dort bitte den Bus, der direkt vor dem Bahnhof wartet.'),
        ],
        item: rf('Reisende nach Kesselbach müssen in Nordheim in einen Bus umsteigen.', true,
          '„Reisende nach Kesselbach nehmen dort bitte den Bus“',
          'The train ends in Nordheim; passengers to Kesselbach take the bus from there.'),
      },
      {
        script: [
          n('Sie hören den Wetterbericht.'),
          b('Und nun das Wetter für morgen: Im Norden bleibt es den ganzen Tag bewölkt, immer wieder gibt es Regen.'),
          b('Im Süden scheint am Vormittag noch die Sonne, am Nachmittag kommen aber auch dort Gewitter.'),
          b('Die Temperaturen liegen zwischen fünfzehn Grad an der Küste und dreiundzwanzig Grad im Süden.'),
        ],
        item: rf('Im Süden bleibt es morgen den ganzen Tag sonnig.', false,
          '„am Nachmittag kommen aber auch dort Gewitter“',
          'Sun only in the morning; thunderstorms in the afternoon.'),
      },
      {
        script: [
          n('Sie rufen in einem Reisebüro an und hören folgende Ansage.'),
          a('Guten Tag, Sie sind verbunden mit dem Reisebüro Sonnenschein. Unser Büro ist zurzeit wegen Urlaub geschlossen. Ab Montag, dem vierzehnten, sind wir wieder für Sie da.'),
          a('In dringenden Fällen, zum Beispiel wenn Sie gerade auf Reisen sind und Hilfe brauchen, rufen Sie bitte unsere Notfallnummer an: null eins sieben null, zwei drei vier, fünf sechs sieben.'),
        ],
        item: rf('Das Reisebüro hat für Kunden auf Reisen eine besondere Telefonnummer.', true,
          '„rufen Sie bitte unsere Notfallnummer an“',
          'Customers who are travelling and need help can call an emergency number.'),
      },
      {
        script: [
          n('Sie sitzen im Zug und hören eine Durchsage.'),
          b('Sehr geehrte Fahrgäste, in wenigen Minuten erreichen wir Lindenfeld Hauptbahnhof. Wegen einer Störung haben wir zurzeit zwanzig Minuten Verspätung.'),
          b('Der Anschlusszug nach Weimar kann leider nicht warten. Bitte wenden Sie sich an unser Personal am Bahnsteig, dort erhalten Sie Informationen über andere Verbindungen.'),
        ],
        item: rf('Der Zug nach Weimar wartet auf die Fahrgäste.', false,
          '„Der Anschlusszug nach Weimar kann leider nicht warten.“',
          'The connecting train to Weimar cannot wait.'),
      },
      {
        script: [
          n('Sie hören ein Gespräch an der Hotelrezeption.'),
          a('Guten Abend, ich habe ein Zimmer reserviert, auf den Namen Fischer.'),
          b('Guten Abend, Frau Fischer. Ja, ein Einzelzimmer für zwei Nächte. Frühstück gibt es von sieben bis zehn Uhr im ersten Stock.'),
          a('Gibt es hier auch einen Parkplatz?'),
          b('Ja, hinter dem Haus. Der kostet zehn Euro pro Nacht, das bezahlen Sie dann bei der Abreise.'),
        ],
        item: rf('Frau Fischer muss den Parkplatz sofort bezahlen.', false,
          '„das bezahlen Sie dann bei der Abreise“',
          'She pays for parking when she leaves, not now.'),
      },
    ],
  },
  {
    id: 'hoeren3-02',
    topic: 'einkaufen',
    items: [
      {
        script: [
          n('Sie sind im Kaufhaus und hören eine Durchsage.'),
          a('Liebe Kundinnen und Kunden, nur heute in unserer Sportabteilung im dritten Stock: Alle Laufschuhe sind zwanzig Prozent günstiger.'),
          a('Und in unserer Lebensmittelabteilung im Erdgeschoss können Sie bis vierzehn Uhr kostenlos frischen Kaffee probieren. Wir wünschen Ihnen einen schönen Einkauf.'),
        ],
        item: rf('Die Sportabteilung ist im Erdgeschoss.', false,
          '„in unserer Sportabteilung im dritten Stock“ – im Erdgeschoss sind die Lebensmittel.',
          'The sports department is on the third floor; food is on the ground floor.'),
      },
      {
        script: [
          n('Sie hören Werbung im Radio.'),
          b('Neue Möbel, aber wenig Geld? Dann kommen Sie zu Möbel Krone! Bei uns bezahlen Sie Ihre neue Küche in zwölf Monatsraten – ohne Zinsen.'),
          b('Und ab einem Einkauf von fünfhundert Euro liefern wir kostenlos. Möbel Krone in Nordheim, direkt an der Autobahnausfahrt.'),
        ],
        item: rf('Ab einem bestimmten Betrag muss man für die Lieferung nichts bezahlen.', true,
          '„ab einem Einkauf von fünfhundert Euro liefern wir kostenlos“',
          'Delivery is free if you spend at least 500 euros.'),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Hallo Frau Peters, hier ist das Schuhhaus Weber. Die Stiefel, die Sie bestellt haben, sind heute angekommen, allerdings nur in Braun. Die schwarzen bekommen wir erst in zwei Wochen.'),
          a('Bitte rufen Sie uns an und sagen Sie uns, ob Sie die braunen nehmen oder lieber warten möchten.'),
        ],
        item: rf('Frau Peters kann die schwarzen Stiefel heute abholen.', false,
          '„Die schwarzen bekommen wir erst in zwei Wochen.“',
          'Only the brown boots have arrived; the black ones come in two weeks.'),
      },
      {
        script: [
          n('Sie sind im Supermarkt und hören eine Durchsage.'),
          b('Liebe Kunden, unser Markt schließt in fünfzehn Minuten. Bitte kommen Sie zum Ende Ihres Einkaufs. Die Kassen drei und vier sind noch für Sie geöffnet.'),
          b('Außerdem möchten wir Sie daran erinnern: Ab nächster Woche haben wir samstags länger geöffnet, bis zweiundzwanzig Uhr.'),
        ],
        item: rf('Der Supermarkt hat am Samstag bald länger geöffnet.', true,
          '„Ab nächster Woche haben wir samstags länger geöffnet“',
          'From next week the shop stays open longer on Saturdays (until 10 pm).'),
      },
      {
        script: [
          n('Sie hören ein Gespräch auf dem Wochenmarkt.'),
          a('Guten Tag, ich hätte gern ein Kilo Tomaten und zwei Gurken.'),
          b('Gern. Die Tomaten sind heute im Angebot, das Kilo für zwei Euro fünfzig. Darf es sonst noch etwas sein?'),
          a('Haben Sie auch Erdbeeren?'),
          b('Leider nicht mehr, die waren heute schon um zehn ausverkauft. Kommen Sie am Samstag früh, dann haben wir wieder welche.'),
        ],
        item: rf('Die Kundin kann heute keine Erdbeeren mehr kaufen.', true,
          '„die waren heute schon um zehn ausverkauft“',
          'The strawberries were sold out by ten o’clock.'),
      },
    ],
  },
  {
    id: 'hoeren3-03',
    topic: 'gesundheit',
    items: [
      {
        script: [
          n('Sie rufen bei einer Arztpraxis an und hören folgende Ansage.'),
          a('Guten Tag, hier ist die Praxis Doktor Yilmaz. Unsere Praxis ist vom zweiten bis zum sechzehnten August wegen Urlaub geschlossen.'),
          a('Die Vertretung übernimmt Doktor Braun in der Bahnhofstraße zwölf. Rezepte können Sie bis zum ersten August bei uns bestellen.'),
        ],
        item: rf('Während des Urlaubs kann man zu einem anderen Arzt gehen.', true,
          '„Die Vertretung übernimmt Doktor Braun in der Bahnhofstraße zwölf.“',
          'Dr Braun stands in during the holiday.'),
      },
      {
        script: [
          n('Sie hören eine Information im Radio.'),
          b('Sie brauchen in der Nacht oder am Wochenende dringend ein Medikament? Welche Apotheke in Ihrer Nähe Notdienst hat, erfahren Sie im Internet oder an der Tür jeder Apotheke.'),
          b('Bitte denken Sie daran: Im Notdienst zahlen Sie für jedes Medikament zusätzlich eine Gebühr von zweieinhalb Euro.'),
        ],
        item: rf('Im Notdienst sind Medikamente billiger als sonst.', false,
          '„zahlen Sie für jedes Medikament zusätzlich eine Gebühr“',
          'At night or at weekends you pay an extra fee – it is more expensive, not cheaper.'),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Hallo Herr Schmitt, hier ist das Fitnessstudio Aktiv. Ihr Kurs „Gesunder Rücken“ am Donnerstag fällt leider aus, weil die Trainerin krank ist.'),
          a('Sie können stattdessen am Freitag um achtzehn Uhr kommen, da gibt es noch freie Plätze. Bitte melden Sie sich an der Rezeption an.'),
        ],
        item: rf('Herr Schmitt kann den Kurs an einem anderen Tag besuchen.', true,
          '„Sie können stattdessen am Freitag um achtzehn Uhr kommen“',
          'Instead of Thursday he can come on Friday at 6 pm.'),
      },
      {
        script: [
          n('Sie hören einen Tipp im Radio.'),
          b('Bald beginnt wieder die Erkältungszeit. Was hilft? Waschen Sie sich oft die Hände, trinken Sie viel und gehen Sie jeden Tag an die frische Luft, auch wenn es kalt ist.'),
          b('Und lüften Sie Ihre Wohnung mehrmals am Tag, am besten fünf Minuten mit ganz offenem Fenster.'),
        ],
        item: rf('Bei kaltem Wetter soll man lieber zu Hause bleiben.', false,
          '„gehen Sie jeden Tag an die frische Luft, auch wenn es kalt ist“',
          'You should go outside every day, even when it is cold.'),
      },
      {
        script: [
          n('Sie hören ein Gespräch in einer Arztpraxis.'),
          a('Guten Morgen, ich habe um neun einen Termin bei Doktor Klein. Mein Name ist Rossi.'),
          b('Guten Morgen, Herr Rossi. Haben Sie Ihre Versichertenkarte dabei?'),
          a('Ja, hier, bitte.'),
          b('Danke. Es dauert leider noch etwa eine halbe Stunde, wir hatten heute früh einen Notfall. Nehmen Sie bitte im Wartezimmer Platz.'),
        ],
        item: rf('Herr Rossi kommt sofort dran.', false,
          '„Es dauert leider noch etwa eine halbe Stunde“',
          'He has to wait about half an hour.'),
      },
    ],
  },
  {
    id: 'hoeren3-04',
    topic: 'freizeit',
    items: [
      {
        script: [
          n('Sie rufen beim Kino an und hören folgende Ansage.'),
          a('Herzlich willkommen im Kino Capitol. Unser Programm diese Woche: Die Komödie „Ferien mit Oma“ läuft täglich um siebzehn und um zwanzig Uhr.'),
          a('Der Abenteuerfilm „Das Eis“ läuft nur am Freitag und Samstag um zweiundzwanzig Uhr. Am Mittwoch ist Kinotag: Alle Karten kosten nur sechs Euro.'),
        ],
        item: rf('Der Film „Das Eis“ läuft jeden Abend.', false,
          '„läuft nur am Freitag und Samstag um zweiundzwanzig Uhr“',
          'It is shown only on Friday and Saturday.'),
      },
      {
        script: [
          n('Sie sind im Schwimmbad und hören eine Durchsage.'),
          b('Liebe Badegäste, wegen eines Gewitters müssen wir das Außenbecken jetzt leider schließen. Bitte verlassen Sie sofort das Wasser.'),
          b('Das Hallenbad bleibt aber geöffnet. Ihre Eintrittskarte ist selbstverständlich weiter gültig.'),
        ],
        item: rf('Die Gäste können im Hallenbad weiterschwimmen.', true,
          '„Das Hallenbad bleibt aber geöffnet.“',
          'Only the outdoor pool closes; the indoor pool stays open.'),
      },
      {
        script: [
          n('Sie hören eine Information im Radio.'),
          a('Die Volkshochschule Lindenfeld bietet im Herbst wieder viele neue Kurse an: von Fotografie über Italienisch bis Yoga. Neu ist ein Kochkurs für Männer, jeden Dienstagabend.'),
          a('Anmelden können Sie sich ab sofort im Internet oder persönlich im Büro in der Schulstraße. Achtung: Die Plätze sind begrenzt.'),
        ],
        item: rf('Man kann sich nur im Büro der Volkshochschule anmelden.', false,
          '„Anmelden können Sie sich ab sofort im Internet oder persönlich im Büro“',
          'You can register online or in person.'),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          b('Hi Sarah, hier ist Ben. Ich habe zwei Karten für das Konzert am Samstag im Stadtpark bekommen! Hast du Lust mitzukommen?'),
          b('Es fängt um acht an, aber wir sollten schon um sieben da sein, damit wir gute Plätze bekommen. Ruf mich bis morgen an, sonst frage ich Tom.'),
        ],
        item: rf('Ben möchte sich schon vor Beginn des Konzerts treffen.', true,
          '„aber wir sollten schon um sieben da sein“',
          'The concert starts at eight, but he wants to be there at seven.'),
      },
      {
        script: [
          n('Sie sind im Museum und hören eine Durchsage.'),
          a('Liebe Besucherinnen und Besucher, in fünf Minuten beginnt im Erdgeschoss eine kostenlose Führung durch unsere neue Ausstellung „Leben am Fluss“. Die Führung dauert etwa eine Stunde.'),
          a('Bitte beachten Sie, dass man in der Ausstellung nicht fotografieren darf.'),
        ],
        item: rf('In der Ausstellung ist Fotografieren erlaubt.', false,
          '„dass man in der Ausstellung nicht fotografieren darf“',
          'Taking photos is not allowed in the exhibition.'),
      },
    ],
  },
  {
    id: 'hoeren3-05',
    topic: 'dienstleistungen',
    items: [
      {
        script: [
          n('Sie rufen beim Bürgeramt an und hören folgende Ansage.'),
          a('Willkommen beim Bürgeramt Lindenfeld. Bitte beachten Sie: Wir arbeiten nur mit Termin. Termine können Sie online oder telefonisch vereinbaren.'),
          a('Am Donnerstag haben wir bis neunzehn Uhr geöffnet, an allen anderen Tagen bis vierzehn Uhr. Bitte bleiben Sie in der Leitung.'),
        ],
        item: rf('Ohne Termin wird man im Bürgeramt nicht bedient.', true,
          '„Wir arbeiten nur mit Termin.“',
          'The office only works with appointments.'),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          b('Guten Tag, hier spricht Frau Albers von der Stadtsparkasse. Ihre neue Bankkarte ist da. Sie können sie ab morgen in unserer Filiale am Rathausplatz abholen.'),
          b('Die Geheimzahl schicken wir Ihnen in den nächsten Tagen mit der Post.'),
        ],
        item: rf('Die Bank schickt die neue Karte mit der Post.', false,
          '„Sie können sie ab morgen in unserer Filiale am Rathausplatz abholen.“ – Nur die Geheimzahl kommt mit der Post.',
          'The card must be collected at the branch; only the PIN comes by post.'),
      },
      {
        script: [
          n('Sie rufen bei Ihrem Handyanbieter an und hören folgende Ansage.'),
          a('Herzlich willkommen beim Kundenservice von Mobilfon. Möchten Sie Ihren Vertrag ändern, drücken Sie die Eins. Haben Sie Fragen zu Ihrer Rechnung, drücken Sie die Zwei.'),
          a('Bei technischen Problemen drücken Sie die Drei. Im Moment haben wir viele Anrufe, die Wartezeit beträgt etwa fünfzehn Minuten.'),
        ],
        item: rf('Bei Fragen zur Rechnung muss man die Drei drücken.', false,
          '„Haben Sie Fragen zu Ihrer Rechnung, drücken Sie die Zwei.“',
          'Billing questions are option two; three is for technical problems.'),
      },
      {
        script: [
          n('Sie sind in der Post und hören ein Gespräch.'),
          a('Guten Tag, ich möchte dieses Paket nach Spanien schicken. Wie lange dauert das?'),
          b('Normal ungefähr fünf bis sieben Tage. Mit Express sind es zwei Tage, aber das kostet dann dreißig Euro statt fünfzehn.'),
          a('Oh, das ist teuer. Dann nehme ich die normale Lieferung, es ist ja nicht eilig.'),
        ],
        item: rf('Die Kundin entscheidet sich für die günstigere Variante.', true,
          '„Dann nehme ich die normale Lieferung“',
          'She chooses normal delivery (15 euros) instead of express (30 euros).'),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          b('Achtung, Autofahrer in Lindenfeld: Ab Montag gelten in der Innenstadt neue Parkregeln. Parken kostet dann zwei Euro pro Stunde statt einem Euro fünfzig.'),
          b('Dafür ist das Parken am Sonntag in Zukunft kostenlos. Bezahlen können Sie am Automaten oder mit der Park-App der Stadt.'),
        ],
        item: rf('Ab Montag wird das Parken in der Innenstadt billiger.', false,
          '„Parken kostet dann zwei Euro pro Stunde statt einem Euro fünfzig.“',
          'Parking becomes more expensive (2 euros instead of 1.50); only Sundays become free.'),
      },
    ],
  },
  {
    id: 'hoeren3-06',
    topic: 'ausbildung',
    items: [
      {
        script: [
          n('Sie rufen bei einer Sprachschule an und hören folgende Ansage.'),
          a('Guten Tag, hier ist die Sprachschule Wortwechsel. Leider rufen Sie außerhalb unserer Bürozeiten an. Wir sind montags bis freitags von neun bis dreizehn Uhr erreichbar.'),
          a('Unsere neuen B eins Kurse beginnen am fünften Oktober. Einen Einstufungstest können Sie jederzeit auf unserer Internetseite machen.'),
        ],
        item: rf('Den Einstufungstest kann man online machen.', true,
          '„Einen Einstufungstest können Sie jederzeit auf unserer Internetseite machen.“',
          'The placement test is available on the website at any time.'),
      },
      {
        script: [
          n('Sie sind an der Universität und hören eine Durchsage.'),
          b('Achtung, eine Information für alle Studierenden: Die Vorlesung „Einführung in die Wirtschaft“ findet heute nicht im Hörsaal drei statt, sondern in der Aula im Hauptgebäude.'),
          b('Die Bibliothek schließt heute wegen einer Veranstaltung bereits um sechzehn Uhr.'),
        ],
        item: rf('Die Bibliothek hat heute länger geöffnet.', false,
          '„Die Bibliothek schließt heute wegen einer Veranstaltung bereits um sechzehn Uhr.“',
          'The library closes early today (at 4 pm).'),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Hallo Herr Petrović, hier ist Frau Krüger von der Agentur für Arbeit. Ich habe ein interessantes Stellenangebot für Sie, als Lagerist in einer Firma hier in Lindenfeld.'),
          a('Bitte kommen Sie am Dienstag um neun Uhr zu mir, Zimmer zweihundertvierzehn. Bringen Sie bitte Ihren aktuellen Lebenslauf mit.'),
        ],
        item: rf('Herr Petrović soll Unterlagen zum Termin mitbringen.', true,
          '„Bringen Sie bitte Ihren aktuellen Lebenslauf mit.“',
          'He should bring his current CV.'),
      },
      {
        script: [
          n('Sie hören ein Gespräch zwischen zwei Kollegen.'),
          a('Sag mal, Jan, kommst du heute mit zur Weiterbildung?'),
          b('Welche Weiterbildung? Ich dachte, die ist nächste Woche.'),
          a('Nein, sie wurde verschoben, auf heute um fünfzehn Uhr. Die Chefin hat gestern eine E-Mail geschickt.'),
          b('Oh, die habe ich wohl nicht gelesen. Gut, dass du es sagst. Dann komme ich natürlich mit.'),
        ],
        item: rf('Die Weiterbildung findet wie geplant nächste Woche statt.', false,
          '„Nein, sie wurde verschoben, auf heute um fünfzehn Uhr.“',
          'The training was moved to today at 3 pm.'),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          b('Immer mehr Betriebe in der Region suchen Auszubildende. Besonders im Handwerk, zum Beispiel bei Elektrikern und Bäckern, sind noch viele Plätze frei.'),
          b('Wer sich informieren möchte, kann die kostenlose Hotline der Handwerkskammer anrufen, montags bis freitags von acht bis achtzehn Uhr.'),
        ],
        item: rf('Im Handwerk gibt es noch viele freie Ausbildungsplätze.', true,
          '„Besonders im Handwerk, zum Beispiel bei Elektrikern und Bäckern, sind noch viele Plätze frei.“',
          'Many apprenticeships in trades are still available.'),
      },
    ],
  },
  {
    id: 'hoeren3-07',
    topic: 'wohnen',
    items: [
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Guten Tag, Frau Yıldız, hier ist die Hausverwaltung Meyer. Am Mittwoch zwischen acht und zwölf Uhr kommt ein Techniker, um die Heizkörper in Ihrer Wohnung zu prüfen.'),
          a('Wenn Sie nicht zu Hause sein können, geben Sie bitte einem Nachbarn den Schlüssel oder rufen Sie uns an, damit wir einen neuen Termin finden.'),
        ],
        item: rf('Frau Yıldız muss am Mittwoch auf jeden Fall zu Hause sein.', false,
          '„geben Sie bitte einem Nachbarn den Schlüssel oder rufen Sie uns an“',
          'She can leave the key with a neighbour or arrange a new date.'),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          b('Eine Information der Stadtreinigung: Wegen des Feiertags am Donnerstag wird der Müll in dieser Woche jeweils einen Tag später abgeholt.'),
          b('Die Abholung vom Donnerstag findet also am Freitag statt, die vom Freitag am Samstag.'),
        ],
        item: rf('In dieser Woche wird der Müll später abgeholt als sonst.', true,
          '„wird der Müll in dieser Woche jeweils einen Tag später abgeholt“',
          'Because of the holiday, collection is one day later this week.'),
      },
      {
        script: [
          n('Sie hören eine Nachricht auf dem Anrufbeantworter.'),
          a('Hallo, hier ist die Firma Umzüge Schnell. Wir bestätigen Ihren Umzug am Samstag, dem zwölften. Unsere Mitarbeiter kommen um sieben Uhr.'),
          a('Bitte packen Sie bis dahin alle Kartons, und denken Sie daran, vor dem Haus einen Parkplatz für unseren Lastwagen zu reservieren.'),
        ],
        item: rf('Die Umzugsfirma packt die Kartons für den Kunden.', false,
          '„Bitte packen Sie bis dahin alle Kartons“',
          'The customer has to pack the boxes before the movers arrive.'),
      },
      {
        script: [
          n('Sie hören ein Gespräch im Treppenhaus.'),
          a('Entschuldigung, wohnen Sie hier im Haus? Ich bin neu, ich heiße Nina Hoffmann und wohne im zweiten Stock.'),
          b('Ach, herzlich willkommen! Ich bin Herr Lang, aus dem ersten Stock. Wenn Sie Fragen haben, klingeln Sie einfach.'),
          a('Danke! Eine Frage hätte ich schon: Wo stellt man hier die Fahrräder ab?'),
          b('Im Keller, die Tür rechts neben der Treppe. Der Schlüssel für Ihre Wohnung passt da auch.'),
        ],
        item: rf('Die Fahrräder stehen im Keller.', true,
          '„Im Keller, die Tür rechts neben der Treppe.“',
          'Bikes are kept in the basement.'),
      },
      {
        script: [
          n('Sie hören Werbung im Radio.'),
          b('Ihre Wohnung ist zu klein? Sie suchen einen Platz für alte Möbel, Winterreifen oder Kisten? Bei Lager Plus mieten Sie einen Lagerraum schon ab neunundzwanzig Euro im Monat.'),
          b('Sie haben rund um die Uhr Zugang, und der erste Monat ist kostenlos.'),
        ],
        item: rf('Man kommt nur zu bestimmten Zeiten an seinen Lagerraum.', false,
          '„Sie haben rund um die Uhr Zugang“',
          'You have access around the clock.'),
      },
    ],
  },
  {
    id: 'hoeren3-08',
    topic: 'umwelt',
    items: [
      {
        script: [
          n('Sie hören den Wetterbericht.'),
          a('Das Wetter am Wochenende: Am Samstag wird es sonnig und für den Herbst sehr warm, bis zu zweiundzwanzig Grad.'),
          a('Am Sonntag kommt von Westen Regen, und die Temperaturen sinken auf zwölf Grad. In den Bergen kann es in der Nacht zum Montag sogar schneien.'),
        ],
        item: rf('Am Sonntag wird es kälter als am Samstag.', true,
          '„die Temperaturen sinken auf zwölf Grad“',
          'Saturday up to 22 °C, Sunday only 12 °C.'),
      },
      {
        script: [
          n('Sie hören eine Meldung im Radio.'),
          b('Machen Sie mit beim großen Frühjahrsputz! Am Samstag sammeln Freiwillige in ganz Lindenfeld Müll in Parks und am Fluss. Treffpunkt ist um zehn Uhr vor dem Rathaus.'),
          b('Handschuhe und Müllsäcke bekommen Sie von der Stadt. Nach der Aktion gibt es für alle Helfer eine kostenlose Suppe.'),
        ],
        item: rf('Die Helfer müssen ihre Handschuhe selbst mitbringen.', false,
          '„Handschuhe und Müllsäcke bekommen Sie von der Stadt.“',
          'The town provides gloves and bin bags.'),
      },
      {
        script: [
          n('Sie rufen beim Wertstoffhof an und hören folgende Ansage.'),
          a('Willkommen beim Wertstoffhof Lindenfeld. Unsere Öffnungszeiten: Dienstag bis Freitag von zehn bis achtzehn Uhr, Samstag von acht bis vierzehn Uhr. Montags ist geschlossen.'),
          a('Elektrogeräte und alte Möbel können Sie bei uns kostenlos abgeben. Für Bauabfälle zahlen Sie eine Gebühr.'),
        ],
        item: rf('Für alte Möbel muss man auf dem Wertstoffhof bezahlen.', false,
          '„Elektrogeräte und alte Möbel können Sie bei uns kostenlos abgeben.“',
          'Old furniture can be dropped off free of charge; only building waste costs a fee.'),
      },
      {
        script: [
          n('Sie sind im Zoo und hören eine Durchsage.'),
          b('Liebe Besucher, um fünfzehn Uhr füttern unsere Tierpfleger die Pinguine. Kommen Sie zum Pinguinbecken neben dem Restaurant und hören Sie interessante Informationen über diese Tiere.'),
          b('Bitte füttern Sie die Tiere im Zoo nicht selbst.'),
        ],
        item: rf('Die Fütterung findet in der Nähe des Restaurants statt.', true,
          '„Kommen Sie zum Pinguinbecken neben dem Restaurant“',
          'The penguin pool is next to the restaurant.'),
      },
      {
        script: [
          n('Sie hören ein Gespräch bei einem Fahrradverleih.'),
          a('Guten Tag, ich möchte für morgen zwei Fahrräder leihen. Was kostet das?'),
          b('Ein Fahrrad kostet zwölf Euro pro Tag, ein E-Bike fünfundzwanzig. Helme sind im Preis inklusive.'),
          a('Dann nehme ich zwei normale Fahrräder. Müssen wir die bis abends zurückbringen?'),
          b('Ja, bis neunzehn Uhr. Sonst müssen Sie einen zweiten Tag bezahlen.'),
        ],
        item: rf('Für die Helme muss man extra bezahlen.', false,
          '„Helme sind im Preis inklusive.“',
          'Helmets are included in the price.'),
      },
    ],
  },
];
