/**
 * Redemittel for the oral exam, grouped by what you want to do in the
 * conversation. Standard B1 phrases, each with an English gloss.
 */
import type { PhraseGroup } from '../types.ts';

export const phraseGroups: PhraseGroup[] = [
  {
    id: 'meinung',
    label: { de: 'Meinung äußern', en: 'Giving your opinion' },
    phrases: [
      { de: 'Ich finde, dass …', en: 'I think that …' },
      { de: 'Meiner Meinung nach …', en: 'In my opinion …' },
      { de: 'Ich bin der Meinung, dass …', en: 'I am of the opinion that …' },
      { de: 'Ich glaube, …', en: 'I believe …' },
      { de: 'Für mich ist es wichtig, dass …', en: 'For me it is important that …' },
      { de: 'Ein Vorteil / Nachteil ist, dass …', en: 'One advantage / disadvantage is that …' },
      { de: 'Einerseits …, andererseits …', en: 'On the one hand …, on the other hand …' },
      { de: 'Ich bin mir nicht sicher, aber …', en: 'I am not sure, but …' },
    ],
  },
  {
    id: 'zustimmen',
    label: { de: 'Zustimmen', en: 'Agreeing' },
    phrases: [
      { de: 'Da hast du / haben Sie recht.', en: 'You are right there.' },
      { de: 'Das sehe ich auch so.', en: 'I see it that way too.' },
      { de: 'Genau!', en: 'Exactly!' },
      { de: 'Ich bin ganz deiner / Ihrer Meinung.', en: 'I completely agree with you.' },
      { de: 'Das stimmt.', en: 'That is true.' },
      { de: 'Da stimme ich dir / Ihnen zu.', en: 'I agree with you on that.' },
    ],
  },
  {
    id: 'widersprechen',
    label: { de: 'Widersprechen', en: 'Disagreeing' },
    phrases: [
      { de: 'Das sehe ich anders.', en: 'I see it differently.' },
      { de: 'Da bin ich anderer Meinung.', en: 'I have a different opinion on that.' },
      { de: 'Das stimmt schon, aber …', en: 'That is true, but …' },
      { de: 'Ich bin nicht sicher, ob das stimmt.', en: 'I am not sure that is right.' },
      { de: 'Das finde ich nicht.', en: 'I don’t think so.' },
      { de: 'Ja, aber man muss auch bedenken, dass …', en: 'Yes, but you also have to consider that …' },
    ],
  },
  {
    id: 'nachfragen',
    label: { de: 'Nachfragen', en: 'Asking for clarification' },
    phrases: [
      { de: 'Wie meinst du / meinen Sie das?', en: 'What do you mean by that?' },
      { de: 'Kannst du / Können Sie das bitte wiederholen?', en: 'Could you repeat that, please?' },
      { de: 'Habe ich dich / Sie richtig verstanden, dass …?', en: 'Did I understand you correctly that …?' },
      { de: 'Was bedeutet …?', en: 'What does … mean?' },
      { de: 'Und wie ist das bei dir / Ihnen?', en: 'And what about you?' },
      { de: 'Kannst du ein Beispiel geben?', en: 'Can you give an example?' },
    ],
  },
  {
    id: 'vorschlagen',
    label: { de: 'Vorschläge machen', en: 'Making suggestions' },
    phrases: [
      { de: 'Wie wäre es mit …?', en: 'How about …?' },
      { de: 'Ich schlage vor, dass wir …', en: 'I suggest that we …' },
      { de: 'Wir könnten doch …', en: 'We could …' },
      { de: 'Was hältst du davon, wenn wir …?', en: 'What do you think about us …?' },
      { de: 'Hast du eine Idee, wie / wo / wann …?', en: 'Do you have an idea how / where / when …?' },
      { de: 'Lass uns doch …', en: 'Let’s …' },
    ],
  },
  {
    id: 'annehmen',
    label: { de: 'Vorschläge annehmen', en: 'Accepting suggestions' },
    phrases: [
      { de: 'Gute Idee!', en: 'Good idea!' },
      { de: 'Das klingt gut.', en: 'That sounds good.' },
      { de: 'Einverstanden.', en: 'Agreed.' },
      { de: 'Ja, so machen wir das.', en: 'Yes, let’s do it like that.' },
      { de: 'Das finde ich prima.', en: 'I think that is great.' },
    ],
  },
  {
    id: 'ablehnen',
    label: { de: 'Vorschläge ablehnen', en: 'Turning down suggestions' },
    phrases: [
      { de: 'Das finde ich keine so gute Idee, weil …', en: 'I don’t think that is such a good idea, because …' },
      { de: 'Ich weiß nicht so recht …', en: 'I’m not so sure …' },
      { de: 'Das geht leider nicht, weil …', en: 'Unfortunately that won’t work, because …' },
      { de: 'Lieber nicht. Wie wäre es stattdessen mit …?', en: 'Rather not. How about … instead?' },
      { de: 'Das ist vielleicht zu teuer / zu kompliziert.', en: 'That may be too expensive / too complicated.' },
    ],
  },
  {
    id: 'einigen',
    label: { de: 'Sich einigen', en: 'Reaching agreement' },
    phrases: [
      { de: 'Dann machen wir es so: …', en: 'Then let’s do it like this: …' },
      { de: 'Also, wir haben vereinbart, dass …', en: 'So, we have agreed that …' },
      { de: 'Du kümmerst dich um …, und ich übernehme …', en: 'You take care of …, and I’ll take on …' },
      { de: 'Können wir uns darauf einigen, dass …?', en: 'Can we agree that …?' },
      { de: 'Gut, dann ist alles klar.', en: 'Good, then everything is clear.' },
      { de: 'Fassen wir zusammen: …', en: 'Let’s sum up: …' },
    ],
  },
  {
    id: 'zeit',
    label: { de: 'Zeit gewinnen', en: 'Buying time' },
    phrases: [
      { de: 'Hm, lass mich kurz überlegen …', en: 'Hm, let me think for a moment …' },
      { de: 'Das ist eine gute Frage.', en: 'That is a good question.' },
      { de: 'Wie soll ich sagen …', en: 'How should I put it …' },
      { de: 'Ich weiß das Wort nicht, aber es ist so etwas wie …', en: 'I don’t know the word, but it is something like …' },
      { de: 'Moment, wie heißt das noch mal?', en: 'Hang on, what’s it called again?' },
    ],
  },
  {
    id: 'erfahrung',
    label: { de: 'Über Erfahrungen berichten', en: 'Talking about experiences' },
    phrases: [
      { de: 'Ich habe gute / schlechte Erfahrungen mit … gemacht.', en: 'I have had good / bad experiences with …' },
      { de: 'Bei mir war das so: …', en: 'For me it was like this: …' },
      { de: 'In meinem Heimatland ist das anders: …', en: 'In my home country it is different: …' },
      { de: 'Als ich nach Deutschland gekommen bin, …', en: 'When I came to Germany, …' },
      { de: 'Ich erinnere mich noch gut an …', en: 'I still remember … well.' },
      { de: 'Früher habe ich …, aber heute …', en: 'I used to …, but today …' },
    ],
  },
  {
    id: 'zusammenfassen',
    label: { de: 'Einen Text zusammenfassen', en: 'Summarising a text' },
    phrases: [
      { de: 'In meinem Text geht es um …', en: 'My text is about …' },
      { de: 'Die Person meint / ist der Meinung, dass …', en: 'The person thinks / is of the opinion that …' },
      { de: 'Sie / Er findet es gut / nicht gut, dass …', en: 'She / He thinks it is good / not good that …' },
      { de: 'Als Grund nennt sie / er …', en: 'As a reason she / he gives …' },
      { de: 'Außerdem sagt sie / er, dass …', en: 'She / He also says that …' },
      { de: 'Zum Schluss schreibt sie / er, …', en: 'At the end she / he writes …' },
    ],
  },
];
