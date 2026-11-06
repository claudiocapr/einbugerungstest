// Owned by the Hören + Sprechen agent. Keep the export names: the Modelltest imports them.
// The sets themselves live in ./hoeren/teil<n>.ts.
import type { Hoeren1Set, Hoeren2Set, Hoeren3Set } from './types.ts';
import { hoeren1Sets } from './hoeren/teil1.ts';
import { hoeren2Sets } from './hoeren/teil2.ts';
import { hoeren3Sets } from './hoeren/teil3.ts';

/** Teil 1: 5 short texts, heard once. */
export const hoeren1: Hoeren1Set[] = hoeren1Sets;
/** Teil 2: one conversation, heard twice, 10 statements. */
export const hoeren2: Hoeren2Set[] = hoeren2Sets;
/** Teil 3: 5 short texts, each heard twice. */
export const hoeren3: Hoeren3Set[] = hoeren3Sets;
