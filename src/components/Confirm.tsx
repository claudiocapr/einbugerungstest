import { useEffect } from 'react';
import type { Lang } from '../types.ts';
import { t } from '../lib/i18n.ts';

/**
 * An in-app replacement for `window.confirm`.
 *
 * The app is published as an embedded page (a Claude Artifact, or any other
 * sandboxed iframe) as well as run standalone. A sandboxed iframe without
 * `allow-modals` silently blocks `window.confirm`/`alert`/`prompt` — the call
 * does not throw, it just never shows anything and the `if` around it reads
 * false, so the action it guarded (submitting the exam, resetting progress,
 * importing a file) appears to do nothing at all. Rendering our own dialog
 * sidesteps that entirely, and reads the same in every host.
 */
export function Confirm({
  message,
  lang,
  onConfirm,
  onCancel,
}: {
  message: string;
  lang: Lang;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="overlay" role="presentation" onClick={onCancel}>
      <div
        className="overlay-card"
        role="alertdialog"
        aria-modal="true"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-message">{message}</p>
        <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
          <button type="button" className="btn small ghost" onClick={onCancel}>
            {t('cancel', lang)}
          </button>
          <button type="button" className="btn small primary" onClick={onConfirm} autoFocus>
            {t('confirmOk', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
