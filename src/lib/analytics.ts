/**
 * Usage analytics and error logging. Sections call `track` and `logError`
 * freely; the backend agent implements delivery (anonymous, first-party, into
 * the owner's Supabase, with an opt-out). Until then these are no-ops, and
 * they must never throw or block the UI.
 *
 * Event names: "<section>.<action>", e.g. "lesen.set_finished".
 * Props: small flat values only. Never put free text the user typed, names,
 * emails or anything identifying into props.
 */
export type EventProps = Record<string, string | number | boolean | null | undefined>;

type Sink = { track: (name: string, props?: EventProps) => void; error: (err: unknown, context?: string) => void };

let sink: Sink | null = null;

/** Installed once by the analytics implementation at startup. */
export function setAnalyticsSink(next: Sink | null) {
  sink = next;
}

export function track(name: string, props?: EventProps) {
  try {
    sink?.track(name, props);
  } catch {
    /* analytics must never break the app */
  }
}

export function logError(err: unknown, context?: string) {
  try {
    sink?.error(err, context);
  } catch {
    /* logging must never break the app */
  }
}
