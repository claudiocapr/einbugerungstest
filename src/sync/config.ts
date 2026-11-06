/**
 * Supabase project of this app. Both values are public by design: they are
 * shipped to every browser, and the data is protected by row-level security
 * (see supabase/migrations). The service-role key is never used in app code.
 */
export const SUPABASE_URL = 'https://armhdiedsojtpcqknpjt.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Y4mxMTzg9zLHN7I_jZdJ7A_vR_S0Pv-';

/** Where supabase-js keeps the session in localStorage. */
export const AUTH_STORAGE_KEY = 'telc-b1.auth';

/** Private bucket with telc's own material (allow-listed accounts only). */
export const TELC_BUCKET = 'telc';

/**
 * App version sent with analytics. A build can set VITE_APP_VERSION (e.g. to the
 * commit hash); otherwise the constant below is used. Guarded so the module also
 * loads under plain Node in the tests, where import.meta.env does not exist.
 */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
export const APP_VERSION: string = (env?.VITE_APP_VERSION || '1.0.0').slice(0, 32);
