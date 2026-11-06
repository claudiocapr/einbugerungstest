import type { Line } from '../../content/types.ts';
import type { Lang } from '../../types.ts';

const WHO: Record<Line['voice'], { de: string; en: string }> = {
  a: { de: 'A', en: 'A' },
  b: { de: 'B', en: 'B' },
  n: { de: 'Ansage', en: 'Narrator' },
};

/**
 * A script as text. `highlight` marks the lines an explanation quotes;
 * `marks` puts statement numbers next to lines (Teil 2); `onPlay` adds a
 * replay button per line.
 */
export function Transcript({
  lines,
  lang,
  highlight,
  marks,
  onPlay,
}: {
  lines: Line[];
  lang: Lang;
  highlight?: Set<number>;
  marks?: Map<number, number[]>;
  onPlay?: (line: Line) => void;
}) {
  return (
    <ol className="transcript">
      {lines.map((line, i) => (
        <li key={i} className={`${highlight?.has(i) ? 'hl' : ''} voice-${line.voice}`}>
          <span className="who">{WHO[line.voice][lang]}</span>
          <span className="text">
            {line.text}
            {marks?.get(i)?.map((m) => (
              <span key={m} className="mark">
                {m}
              </span>
            ))}
          </span>
          {onPlay && (
            <button
              type="button"
              className="btn small ghost play"
              aria-label={lang === 'de' ? 'Diese Zeile anhören' : 'Play this line'}
              onClick={() => onPlay(line)}
            >
              ▶
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}
