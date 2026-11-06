import type { Text2 } from '../types.ts';
import type { TopicId } from './types.ts';

export const TOPICS: { id: TopicId; label: Text2; icon: string }[] = [
  { id: 'person', label: { de: 'Person & Alltag', en: 'Personal details & daily life' }, icon: '🙂' },
  { id: 'familie', label: { de: 'Familie & Beziehungen', en: 'Family & relationships' }, icon: '👨‍👩‍👧' },
  { id: 'wohnen', label: { de: 'Wohnen', en: 'Housing' }, icon: '🏠' },
  { id: 'arbeit', label: { de: 'Arbeit & Beruf', en: 'Work & jobs' }, icon: '💼' },
  { id: 'ausbildung', label: { de: 'Schule & Weiterbildung', en: 'School & training' }, icon: '🎓' },
  { id: 'gesundheit', label: { de: 'Gesundheit', en: 'Health' }, icon: '🩺' },
  { id: 'essen', label: { de: 'Essen & Trinken', en: 'Food & drink' }, icon: '🍽️' },
  { id: 'einkaufen', label: { de: 'Einkaufen & Konsum', en: 'Shopping' }, icon: '🛒' },
  { id: 'dienstleistungen', label: { de: 'Ämter, Bank & Post', en: 'Authorities, bank & post' }, icon: '🏛️' },
  { id: 'reisen', label: { de: 'Reisen & Verkehr', en: 'Travel & transport' }, icon: '🚆' },
  { id: 'freizeit', label: { de: 'Freizeit & Kultur', en: 'Free time & culture' }, icon: '🎭' },
  { id: 'medien', label: { de: 'Medien & Kommunikation', en: 'Media & communication' }, icon: '📱' },
  { id: 'umwelt', label: { de: 'Umwelt & Natur', en: 'Environment & nature' }, icon: '🌳' },
  { id: 'gesellschaft', label: { de: 'Gesellschaft & Zusammenleben', en: 'Society & community' }, icon: '🤝' },
];

export const topicLabel = (id: TopicId, lang: 'de' | 'en') => TOPICS.find((t) => t.id === id)?.label[lang] ?? id;
