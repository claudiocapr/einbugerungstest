// The on/off switch for the neurofeedback test phase, shown on Fortschritt and
// on the Feedback screen while the mode is off.
import type { Lang, Text2 } from '../../types.ts';
import { useFlag } from '../../lib/storage.ts';
import { tr } from '../../lib/i18n.ts';
import { track } from '../../lib/analytics.ts';

const L = {
  title: { de: 'Testphase: Neurofeedback-Modus', en: 'Test phase: neurofeedback mode' },
  what: {
    de: 'Die App gibt Ihnen Rückmeldung zu Ihrem eigenen Lernzustand: Sie schätzen vor der Antwort ein, wie sicher Sie sind, die App misst Ihr Antworttempo, schlägt bei nachlassender Konzentration eine kurze Pause vor und gibt beim Sprechen Rückmeldung zur Aussprache.',
    en: 'The app gives you feedback on your own learning state: you rate how sure you are before answering, the app tracks your response time, suggests a short break when your focus drops, and gives pronunciation feedback when you speak.',
  },
  experiment: {
    de: 'Das ist ein Experiment. Sie können es jederzeit wieder ausschalten – Ihr Fortschritt bleibt erhalten.',
    en: 'This is an experiment. You can turn it off at any time – your progress is kept.',
  },
  on: { de: 'Eingeschaltet', en: 'On' },
  off: { de: 'Ausgeschaltet', en: 'Off' },
  turnOn: { de: 'Einschalten', en: 'Turn on' },
  turnOff: { de: 'Ausschalten', en: 'Turn off' },
  open: { de: 'Feedback ansehen', en: 'View feedback' },
} satisfies Record<string, Text2>;

export function NeuroSwitch({ lang, go, showLink = true }: { lang: Lang; go?: (route: string) => void; showLink?: boolean }) {
  const [on, setOn] = useFlag('neurofeedback');
  const toggle = () => {
    const next = !on;
    setOn(next);
    track('flag.neurofeedback', { on: next });
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <strong>
          <span aria-hidden="true">🧠 </span>
          {tr(L.title, lang)}
        </strong>
        <span className={`small ${on ? 'good' : 'muted'}`} style={{ flex: 'none' }}>
          {tr(on ? L.on : L.off, lang)}
        </span>
      </div>
      <p className="small" style={{ margin: '8px 0 0' }}>{tr(L.what, lang)}</p>
      <p className="small muted" style={{ margin: '6px 0 0' }}>{tr(L.experiment, lang)}</p>
      <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={tr(L.title, lang)}
          className={`btn small${on ? '' : ' primary'}`}
          onClick={toggle}
        >
          {tr(on ? L.turnOff : L.turnOn, lang)}
        </button>
        {on && showLink && go && (
          <button type="button" className="btn small ghost" onClick={() => go('feedback')}>
            {tr(L.open, lang)} →
          </button>
        )}
      </div>
    </div>
  );
}
