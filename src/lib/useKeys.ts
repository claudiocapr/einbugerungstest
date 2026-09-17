import { useEffect } from 'react';

type Handlers = {
  /** Called with 0-3 when the user presses 1-4 or A-D. */
  onOption?: (index: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
};

const OPTION_KEYS: Record<string, number> = {
  '1': 0, '2': 1, '3': 2, '4': 3,
  a: 0, b: 1, c: 2, d: 3,
};

/** Keyboard shortcuts for answering, ignored while the user is typing. */
export function useKeys({ onOption, onNext, onPrev }: Handlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      const option = OPTION_KEYS[e.key.toLowerCase()];
      if (option !== undefined && onOption) {
        e.preventDefault();
        onOption(option);
        return;
      }
      if ((e.key === 'ArrowRight' || e.key === 'Enter') && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOption, onNext, onPrev]);
}
