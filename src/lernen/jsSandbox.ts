/**
 * Baut das HTML-Dokument, in dem JavaScript-Übungen laufen.
 *
 * Der Code läuft in einem <iframe sandbox="allow-scripts"> - also in einem
 * eigenen, fremden Ursprung ohne Zugriff auf diese Seite, ihren localStorage
 * oder ihre Cookies. Bei jedem Ausführen entsteht ein frisches iframe, damit
 * alte Timer und Variablen verschwinden.
 *
 * Kommunikation nach außen nur per postMessage:
 *   console.log/warn/error  -> { typ: 'log' | 'warn' | 'error', text }
 *   unbehandelter Fehler    -> { typ: 'fehler', text, zeile }
 *   Testergebnisse          -> { typ: 'tests', ergebnisse }
 *   synchroner Teil fertig  -> { typ: 'fertig' }
 */

export type Test = {
  /** Was geprüft wird - wird dem Lernenden angezeigt, deshalb zweisprachig möglich. */
  name: string | { de: string; en: string }
  /** JavaScript-Ausdruck, der im Scope des Lernenden-Codes ausgewertet wird. */
  ausdruck: string
  /** Erwartetes Ergebnis (tiefer Vergleich). Fehlt es, muss `ausdruck` true ergeben. */
  erwartet?: unknown
}

/**
 * Ein Codebeispiel für <TryIt>, gemeinsam für beide Sprachfassungen (siehe kurs/<teil>/Name.code.ts).
 * Der Code ist immer Englisch - nur der Text drumherum wird übersetzt.
 */
export type CodeBeispiel = {
  code: string
  loesung?: string
  vorbereitung?: string
  tests?: Test[] | ReactTest[]
  tipps?: { de: string[]; en: string[] }
}

/**
 * Test für eine React-Übung (siehe reactTests.ts). `pruefung` ist Testcode, der die
 * Komponente App rendert und bedient: `await render()`, `await click(button('+'))`, `expect(text())…`
 */
export type ReactTest = {
  name: string | { de: string; en: string }
  pruefung: string
}

export type TestErgebnis = { name: string; ok: boolean; meldung: string }

export type SandboxNachricht =
  | { tryit: true; lauf: number; typ: 'log' | 'info' | 'warn' | 'error'; text: string }
  | { tryit: true; lauf: number; typ: 'fehler'; text: string; zeile: number | null }
  | { tryit: true; lauf: number; typ: 'tests'; ergebnisse: TestErgebnis[] }
  | { tryit: true; lauf: number; typ: 'fertig' | 'clear' }

// Läuft als klassisches Skript VOR dem Code. Alle Namen beginnen mit __,
// damit sie nicht mit Variablen der Lernenden kollidieren.
const BRUECKE = `
const __senden = (typ, text, extra) =>
  parent.postMessage({ tryit: true, lauf: __LAUF, typ, text, ...extra }, '*');

const __fmt = (wert, tiefe = 0) => {
  if (typeof wert === 'string') return tiefe === 0 ? wert : JSON.stringify(wert);
  if (typeof wert === 'function') return 'ƒ ' + (wert.name || 'anonym') + '()';
  if (typeof wert === 'bigint') return wert + 'n';
  if (wert === null || typeof wert !== 'object') return String(wert);
  if (wert instanceof Error) return wert.name + ': ' + wert.message;
  if (wert instanceof Promise) return 'Promise { … }';
  if (wert instanceof Date) return 'Date(' + wert.toISOString() + ')';
  if (wert instanceof Node) return '<' + wert.nodeName.toLowerCase() + '>';
  if (tiefe > 3) return Array.isArray(wert) ? '[…]' : '{…}';
  if (Array.isArray(wert)) return '[' + wert.map((v) => __fmt(v, tiefe + 1)).join(', ') + ']';
  if (wert instanceof Map)
    return 'Map(' + wert.size + ') { ' + [...wert].map(([k, v]) => __fmt(k, 1) + ' => ' + __fmt(v, tiefe + 1)).join(', ') + ' }';
  if (wert instanceof Set)
    return 'Set(' + wert.size + ') { ' + [...wert].map((v) => __fmt(v, tiefe + 1)).join(', ') + ' }';
  const name = wert.constructor && wert.constructor !== Object ? wert.constructor.name + ' ' : '';
  const felder = Object.entries(wert).map(([k, v]) => k + ': ' + __fmt(v, tiefe + 1));
  return name + (felder.length ? '{ ' + felder.join(', ') + ' }' : '{}');
};

const __gleich = (a, b) => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => __gleich(a[k], b[k]));
};

for (const typ of ['log', 'info', 'warn', 'error', 'debug']) {
  const original = console[typ].bind(console);
  console[typ] = (...werte) => {
    original(...werte);
    __senden(typ === 'debug' ? 'log' : typ, werte.map((w) => __fmt(w)).join(' '));
  };
}
console.table = (daten) => console.log(daten);
const __zeiten = new Map();
console.time = (label = 'default') => __zeiten.set(label, performance.now());
console.timeEnd = (label = 'default') => {
  if (!__zeiten.has(label)) return;
  console.log(label + ': ' + (performance.now() - __zeiten.get(label)).toFixed(1) + ' ms');
  __zeiten.delete(label);
};
console.clear = () => __senden('clear');

window.addEventListener('error', (e) => {
  const text = (e.message || String(e.error)).replace(/^Uncaught /, '');
  __senden('fehler', text, { zeile: e.lineno ? e.lineno - __OFFSET : null });
});
// Formulare ohne eigenen Handler würden das iframe sonst neu laden.
window.addEventListener('submit', (e) => e.preventDefault());
window.addEventListener('unhandledrejection', (e) => {
  __senden('fehler', __T.promiseFehler + __fmt(e.reason), { zeile: null });
});
`

// Wird an den Code der Lernenden angehängt - im selben Modul, damit `eval`
// deren Variablen und Funktionen sieht.
const TESTLAEUFER = `
;{
  const __tests = __TESTS;
  const __ergebnisse = [];
  for (const __t of __tests) {
    try {
      let __wert = eval(__t.ausdruck);
      if (__wert instanceof Promise) {
        __wert = await Promise.race([
          __wert,
          new Promise((_, nein) => setTimeout(() => nein(new Error(__T.zeitueberschreitung)), 3000)),
        ]);
      }
      if ('erwartet' in __t) {
        const ok = __gleich(__wert, __t.erwartet);
        __ergebnisse.push({ name: __t.name, ok, meldung: ok ? '' : __T.erwartet + ' ' + __fmt(__t.erwartet, 1) + ', ' + __T.erhalten + ' ' + __fmt(__wert, 1) });
      } else {
        const ok = __wert === true;
        __ergebnisse.push({ name: __t.name, ok, meldung: ok ? '' : __T.bedingung });
      }
    } catch (__f) {
      __ergebnisse.push({ name: __t.name, ok: false, meldung: __f.name + ': ' + __f.message });
    }
  }
  __senden('tests', '', { ergebnisse: __ergebnisse });
}
`

// Meldungen, die im iframe entstehen - dort gibt es keinen React-Context.
const SANDBOX_TEXTE = {
  de: {
    erwartet: 'erwartet',
    erhalten: 'erhalten',
    bedingung: 'Bedingung ist nicht erfüllt',
    zeitueberschreitung: 'Zeitüberschreitung nach 3 s',
    promiseFehler: 'Unbehandelter Promise-Fehler: ',
  },
  en: {
    erwartet: 'expected',
    erhalten: 'received',
    bedingung: 'Condition is not met',
    zeitueberschreitung: 'Timed out after 3 s',
    promiseFehler: 'Unhandled promise rejection: ',
  },
}

export function sandboxDokument(optionen: {
  lauf: number
  code: string
  vorbereitung?: string
  tests?: Test[]
  dunkel: boolean
  sprache: 'de' | 'en'
}): string {
  const { lauf, code, vorbereitung = '', tests, dunkel, sprache } = optionen

  // "</script" im Code würde das umgebende Skript-Tag vorzeitig beenden.
  const sicher = (s: string) => s.replace(/<\/script/gi, '<\\/script')

  const farben = dunkel
    ? 'color:#e2e8f0;background:transparent'
    : 'color:#0f172a;background:transparent'

  const kopf =
    `<!doctype html><html><head><meta charset="utf-8"><style>` +
    `body{margin:12px;font:14px/1.5 system-ui,sans-serif;${farben}}` +
    `button{font:inherit;padding:2px 10px;margin:2px}input{font:inherit}.done{opacity:.55;text-decoration:line-through}</style></head>` +
    `<body><div id="app"></div>\n` +
    `<script>const __LAUF=${lauf};const __OFFSET=__PLATZHALTER;const __T=${JSON.stringify(SANDBOX_TEXTE[sprache])};\n${BRUECKE}\n${sicher(vorbereitung)}\n</script>\n` +
    `<script type="module">\n`

  // Zeilennummern in Fehlermeldungen sollen sich auf den Editor beziehen.
  const offset = kopf.split('\n').length - 1
  const kopfMitOffset = kopf.replace('__PLATZHALTER', String(offset))

  const testCode = tests?.length
    ? // Funktion statt String als Ersatz, sonst würden "$&" o. Ä. in den Tests interpretiert.
      TESTLAEUFER.replace('__TESTS', () => sicher(JSON.stringify(tests)))
    : ''

  return (
    kopfMitOffset +
    sicher(code) +
    '\n' +
    testCode +
    "\n__senden('fertig');\n</script></body></html>"
  )
}
