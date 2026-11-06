// Owned by the Hören + Sprechen agent. Keep the export names: the Modelltest imports them.
// The tasks themselves live in ./sprechen/teil<n>.ts and ./sprechen/phrases.ts.
import type { PhraseGroup, Speaking1Card, Speaking2Task, Speaking3Task } from './types.ts';
import { speaking1Cards } from './sprechen/teil1.ts';
import { speaking2Tasks } from './sprechen/teil2.ts';
import { speaking3Tasks } from './sprechen/teil3.ts';
import { phraseGroups } from './sprechen/phrases.ts';

/** Teil 1 Einander kennenlernen. */
export const sprechen1: Speaking1Card[] = speaking1Cards;
/** Teil 2 Über ein Thema sprechen. */
export const sprechen2: Speaking2Task[] = speaking2Tasks;
/** Teil 3 Gemeinsam etwas planen. */
export const sprechen3: Speaking3Task[] = speaking3Tasks;
/** Redemittel, grouped by purpose. */
export const sprechenPhrases: PhraseGroup[] = phraseGroups;
