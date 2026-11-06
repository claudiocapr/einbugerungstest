import { useEffect, useRef, useState } from 'react';

/**
 * An <audio> element for a signed URL. Render it with `key={path}`. The URL is taken when the track is
 * chosen and kept while it plays (swapping it would restart playback). When a
 * request fails because the URL expired, a fresh one is fetched and playback
 * resumes at the same position.
 */
export function SignedAudio({
  path,
  url,
  renew,
  label,
}: {
  path: string;
  url: string | undefined;
  renew: (path: string) => Promise<string | null>;
  label: string;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState<string | undefined>(url);
  const resume = useRef<{ time: number; play: boolean } | null>(null);
  const lastRenew = useRef(0);

  // Take the first URL that arrives; later renewals are ignored until an error.
  // Render with key={path} so a different track starts fresh.
  useEffect(() => {
    setSrc((current) => current ?? url);
  }, [url]);

  const onError = async () => {
    const el = ref.current;
    if (!el || Date.now() - lastRenew.current < 20_000) return;
    lastRenew.current = Date.now();
    resume.current = { time: el.currentTime || 0, play: !el.paused || el.autoplay };
    const fresh = await renew(path);
    if (fresh) setSrc(fresh);
  };

  const onLoaded = () => {
    const el = ref.current;
    const r = resume.current;
    if (!el || !r) return;
    resume.current = null;
    try {
      el.currentTime = r.time;
      if (r.play) void el.play().catch(() => {});
    } catch {
      /* ignore */
    }
  };

  return (
    <audio
      ref={ref}
      controls
      preload="metadata"
      src={src}
      aria-label={label}
      onError={() => void onError()}
      onLoadedMetadata={onLoaded}
      style={{ width: '100%' }}
    />
  );
}
