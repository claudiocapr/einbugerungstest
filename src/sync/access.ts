import { useEffect, useState } from 'react';
import { getSupabase } from './supabase.ts';
import { useSyncStatus } from './sync.ts';

/**
 * What the signed-in account may open: the private telc area (a row in
 * `telc_access`) and the owner statistics (a row in `app_admins`). RLS lets a
 * user read only their own row in each table, so "a row came back" is the
 * whole check; the server enforces the same rule for the data itself.
 */
export interface Access {
  loading: boolean;
  signedIn: boolean;
  telc: boolean;
  admin: boolean;
  /** Set when the check itself failed (offline, server paused). */
  error: unknown;
}

const cache = new Map<string, Promise<{ telc: boolean; admin: boolean }>>();

async function hasRow(table: 'telc_access' | 'app_admins', userId: string): Promise<boolean> {
  const sb = await getSupabase();
  const { data, error } = await sb.from(table).select('user_id').eq('user_id', userId).maybeSingle();
  // A missing table (migration not applied yet) simply means "no access".
  if (error && !/does not exist|schema cache/i.test(error.message)) throw error;
  return !!data;
}

export function loadAccess(userId: string) {
  let entry = cache.get(userId);
  if (!entry) {
    entry = Promise.all([hasRow('telc_access', userId), hasRow('app_admins', userId)]).then(([telc, admin]) => ({
      telc,
      admin,
    }));
    entry.catch(() => cache.delete(userId));
    cache.set(userId, entry);
  }
  return entry;
}

export function useAccess(): Access {
  const status = useSyncStatus();
  const userId = status.userId;
  const [state, setState] = useState<Access>({ loading: true, signedIn: false, telc: false, admin: false, error: null });

  useEffect(() => {
    if (!userId) {
      setState({
        loading: status.state === 'starting',
        signedIn: false,
        telc: false,
        admin: false,
        error: null,
      });
      return;
    }
    let live = true;
    setState((s) => ({ ...s, loading: true, signedIn: true }));
    loadAccess(userId).then(
      (r) => live && setState({ loading: false, signedIn: true, ...r, error: null }),
      (error) => live && setState({ loading: false, signedIn: true, telc: false, admin: false, error }),
    );
    return () => {
      live = false;
    };
  }, [userId, status.state === 'starting']); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
