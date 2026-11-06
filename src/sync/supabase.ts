import type { SupabaseClient } from '@supabase/supabase-js';
import { AUTH_STORAGE_KEY, SUPABASE_KEY, SUPABASE_URL } from './config.ts';

/**
 * The Supabase client, created on first use. supabase-js is loaded with a
 * dynamic import so it lands in its own chunk: people who never sign in never
 * download it (analytics talks to the REST API with plain fetch instead).
 */
let client: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> {
  if (!client) {
    client = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            // Hash routing owns the URL fragment; we never sign in by link.
            detectSessionInUrl: false,
            storageKey: AUTH_STORAGE_KEY,
          },
        }),
      )
      .catch((err) => {
        // Offline before the chunk was ever cached: allow a later retry.
        client = null;
        throw err;
      });
  }
  return client;
}

/**
 * True when a session from an earlier sign-in is stored on this device. Lets
 * start-up skip loading supabase-js entirely for people without an account.
 */
export function hasStoredSession(): boolean {
  try {
    return !!globalThis.localStorage?.getItem(AUTH_STORAGE_KEY);
  } catch {
    return false;
  }
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return String(err);
}

/** A human-readable reason when Supabase cannot be reached or refuses a request. */
export function describeError(err: unknown, lang: 'de' | 'en' = 'de'): string {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return lang === 'de' ? 'Keine Internetverbindung.' : 'No internet connection.';
  }
  const msg = messageOf(err);
  if (/fetch|network|load failed|timeout|ECONN/i.test(msg)) {
    return lang === 'de'
      ? 'Server nicht erreichbar. Kostenlose Supabase-Projekte pausieren nach etwa einer Woche ohne Nutzung; der Inhaber muss das Projekt dann im Supabase-Dashboard wieder starten.'
      : 'Server unreachable. Free Supabase projects pause after about a week without use; the owner then has to restore the project in the Supabase dashboard.';
  }
  if (/invalid login credentials/i.test(msg)) {
    return lang === 'de' ? 'E-Mail oder Passwort ist falsch.' : 'Wrong e-mail or password.';
  }
  return msg.slice(0, 200);
}
