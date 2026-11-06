import type { Lang } from '../types.ts';

/** What every section screen receives from the app shell. */
export interface SectionProps {
  lang: Lang;
  /** Route segments after the section id: "#/lesen/teil2/lesen2-03" gives ["teil2", "lesen2-03"]. */
  path: string[];
  /** Navigate to a route without the "#/", e.g. go("lesen/teil1"). */
  go: (route: string) => void;
}
