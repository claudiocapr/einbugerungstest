// Owned by the Lesen + Sprachbausteine agent. Keep the export names: the Modelltest imports them.
// The sets live in ./sprachbausteine/teil1a.ts … teil2b.ts (all texts written for this app).
import type { Sb1Set, Sb2Set } from './types.ts';
import { sb1a } from './sprachbausteine/teil1a.ts';
import { sb1b } from './sprachbausteine/teil1b.ts';
import { sb2a } from './sprachbausteine/teil2a.ts';
import { sb2b } from './sprachbausteine/teil2b.ts';

export const sb1: Sb1Set[] = [...sb1a, ...sb1b];
export const sb2: Sb2Set[] = [...sb2a, ...sb2b];
