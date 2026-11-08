import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { Text2 } from '../types.ts';
import type { SectionProps } from './types.ts';

export interface SectionMeta {
  /** Route segment: "#/<id>/..." */
  id: string;
  title: Text2;
  /** One line under the title on the home screen. */
  blurb: Text2;
  icon: string;
  /** Which exam subtest it trains; drives grouping on the home screen. */
  group: 'basis' | 'schriftlich' | 'muendlich' | 'pruefung' | 'konto';
  /** Shown as a tile on the home screen. */
  tile: boolean;
  /** A test-phase flag: the tile is only shown on the home screen while it is on. */
  flag?: 'neurofeedback';
  component: LazyExoticComponent<ComponentType<SectionProps>>;
}

/**
 * Every screen of the app. Sections are loaded lazily so the content of one
 * section is only downloaded when it is opened.
 */
export const SECTIONS: SectionMeta[] = [
  {
    id: 'wortschatz',
    title: { de: 'Wortschatz', en: 'Vocabulary' },
    blurb: { de: 'B1-Wörter und Wendungen nach Themen', en: 'B1 words and phrases by topic' },
    icon: '🗂️',
    group: 'basis',
    tile: true,
    component: lazy(() => import('./wortschatz/index.tsx')),
  },
  {
    id: 'lesen',
    title: { de: 'Leseverstehen', en: 'Reading' },
    blurb: { de: 'Teil 1–3 im Prüfungsformat', en: 'Parts 1–3 in exam format' },
    icon: '📖',
    group: 'schriftlich',
    tile: true,
    component: lazy(() => import('./lesen/index.tsx')),
  },
  {
    id: 'sprachbausteine',
    title: { de: 'Sprachbausteine', en: 'Grammar & vocabulary gaps' },
    blurb: { de: 'Teil 1 und 2 mit Erklärungen', en: 'Parts 1 and 2 with explanations' },
    icon: '🧩',
    group: 'schriftlich',
    tile: true,
    component: lazy(() => import('./sprachbausteine/index.tsx')),
  },
  {
    id: 'hoeren',
    title: { de: 'Hörverstehen', en: 'Listening' },
    blurb: { de: 'Teil 1–3, einmal oder zweimal hören', en: 'Parts 1–3, heard once or twice' },
    icon: '🎧',
    group: 'schriftlich',
    tile: true,
    component: lazy(() => import('./hoeren/index.tsx')),
  },
  {
    id: 'schreiben',
    title: { de: 'Schriftlicher Ausdruck', en: 'Writing' },
    blurb: { de: 'E-Mail mit 4 Leitpunkten', en: 'E-mail covering 4 points' },
    icon: '✉️',
    group: 'schriftlich',
    tile: true,
    component: lazy(() => import('./schreiben/index.tsx')),
  },
  {
    id: 'sprechen',
    title: { de: 'Mündlicher Ausdruck', en: 'Speaking' },
    blurb: { de: 'Kennenlernen, Thema, gemeinsam planen', en: 'Introductions, topic, planning together' },
    icon: '🗣️',
    group: 'muendlich',
    tile: true,
    component: lazy(() => import('./sprechen/index.tsx')),
  },
  {
    id: 'modelltest',
    title: { de: 'Modelltest', en: 'Mock exam' },
    blurb: { de: 'Die ganze Prüfung unter Zeitdruck', en: 'The full exam, timed' },
    icon: '⏱️',
    group: 'pruefung',
    tile: true,
    component: lazy(() => import('./modelltest/index.tsx')),
  },
  {
    id: 'telc',
    title: { de: 'telc-Material', en: 'telc material' },
    blurb: { de: 'Offizielle Übungstests (privat)', en: 'Official practice tests (private)' },
    icon: '🔒',
    group: 'pruefung',
    tile: true,
    component: lazy(() => import('./telc/index.tsx')),
  },
  {
    id: 'fortschritt',
    title: { de: 'Fortschritt', en: 'Progress' },
    blurb: { de: 'Lernstand, Ergebnisse, Datei sichern', en: 'Progress, results, save to file' },
    icon: '📈',
    group: 'konto',
    tile: true,
    component: lazy(() => import('./fortschritt/index.tsx')),
  },
  {
    id: 'feedback',
    title: { de: 'Neurofeedback', en: 'Neurofeedback' },
    blurb: { de: 'Sicherheit, Tempo, Aussprache, Konzentration', en: 'Confidence, tempo, pronunciation, focus' },
    icon: '🧠',
    group: 'konto',
    tile: true,
    flag: 'neurofeedback',
    component: lazy(() => import('./feedback/index.tsx')),
  },
  {
    id: 'konto',
    title: { de: 'Konto', en: 'Account' },
    blurb: { de: 'Anmelden und synchronisieren', en: 'Sign in and sync' },
    icon: '👤',
    group: 'konto',
    tile: false,
    component: lazy(() => import('./konto/index.tsx')),
  },
  {
    id: 'statistik',
    title: { de: 'Statistik', en: 'Statistics' },
    blurb: { de: 'Nutzung und Fehler (nur Inhaber)', en: 'Usage and errors (owner only)' },
    icon: '📊',
    group: 'konto',
    tile: false,
    component: lazy(() => import('./statistik/index.tsx')),
  },
];

export const sectionById = (id: string) => SECTIONS.find((s) => s.id === id);
