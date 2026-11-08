import { useEffect, useRef } from 'react';
import type { Confidence, Lang, Text2 } from '../types.ts';
import { tr } from '../lib/i18n.ts';

/**
 * Neurofeedback mode: "how sure are you?" before an answer is checked.
 * Three buttons, also reachable with the keys 7, 8 and 9 (1–4 and A–D stay
 * free for the answer options).
 */

const CHOICES: { conf: Confidence; key: string; icon: string; label: Text2; hint: Text2 }[] = [
  {
    conf: 'sure',
    key: '7',
    icon: '😎',
    label: { de: 'Sicher', en: 'Sure' },
    hint: { de: 'Ich weiß es', en: 'I know it' },
  },
  {
    conf: 'unsure',
    key: '8',
    icon: '🤔',
    label: { de: 'Unsicher', en: 'Unsure' },
    hint: { de: 'Ich glaube schon', en: 'I think so' },
  },
  {
    conf: 'guess',
    key: '9',
    icon: '🎲',
    label: { de: 'Geraten', en: 'Guess' },
    hint: { de: 'Ich rate', en: "I'm guessing" },
  },
];

const L = {
  question: { de: 'Wie sicher sind Sie?', en: 'How sure are you?' },
  key: { de: 'Taste', en: 'key' },
} satisfies Record<string, Text2>;

export function ConfidencePicker({
  lang,
  onPick,
  compact = false,
}: {
  lang: Lang;
  onPick: (conf: Confidence) => void;
  compact?: boolean;
}) {
  // Keep the latest callback without re-binding the key listener on every render.
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const choice = CHOICES.find((c) => c.key === e.key);
      if (!choice) return;
      e.preventDefault();
      pick.current(choice.conf);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div role="group" aria-label={tr(L.question, lang)} style={{ marginTop: compact ? 8 : 12 }}>
      {!compact && <div className="small muted" style={{ marginBottom: 6 }}>{tr(L.question, lang)}</div>}
      <div className="row" style={{ gap: 8 }}>
        {CHOICES.map((c) => (
          <button
            key={c.conf}
            type="button"
            className={`btn${compact ? ' small' : ''}`}
            style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.25 }}
            aria-label={`${tr(c.label, lang)} – ${tr(c.hint, lang)} (${tr(L.key, lang)} ${c.key})`}
            aria-keyshortcuts={c.key}
            title={`${tr(c.hint, lang)} · ${tr(L.key, lang)} ${c.key}`}
            onClick={() => onPick(c.conf)}
          >
            <span aria-hidden="true">
              {c.icon} {tr(c.label, lang)}
            </span>
            {!compact && (
              <span className="small muted" aria-hidden="true">
                {c.key}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
