import type { TypeTest } from './tsRunner'
import type { BuildResult } from '../docker/build'
import type { ComposeResult } from '../docker/compose'
import type { ProjectId } from '../docker/projects'
import type { SqlTest } from '../sql/check'

/**
 * Builds the HTML document JavaScript exercises run in.
 *
 * The code runs in an <iframe sandbox="allow-scripts"> - an origin of its own without access to
 * this page, its localStorage or its cookies. Every run gets a fresh iframe, so old timers and
 * variables are gone.
 *
 * The only way out is postMessage (see SandboxMessage):
 *   console.log/warn/error   -> { type: 'log' | 'warn' | 'error', text }
 *   uncaught exception       -> { type: 'exception', text, line }
 *   test results             -> { type: 'tests', results }
 *   synchronous part done    -> { type: 'done', content }  (content: is there something in the document yet?)
 *   content showing up later -> { type: 'content' }        (e.g. from a timer or fetch)
 */

export type Test = {
  /** What is checked - shown to learners, so it may be bilingual. */
  name: string | { de: string; en: string }
  /** A JavaScript expression evaluated in the scope of the learner's code. */
  expression: string
  /** Expected result (deep comparison). Without it, `expression` must evaluate to true. */
  expected?: unknown
}

/**
 * A code example for <TryIt>, shared by both language versions (see course/<part>/Name.code.ts).
 * The code is always English - only the text around it is translated.
 */
export type CodeExample = {
  code: string
  solution?: string
  setup?: string
  tests?: Test[] | ReactTest[] | SpringTestSpec[] | DockerTest[] | SqlTest[]
  /** TypeScript only (mode="ts"): code that has to compile together with the learner's code. */
  typeTests?: TypeTest[]
  hints?: { de: string[]; en: string[] }
  /** Spring (part 8): application.properties and requests sent after every start. */
  properties?: string
  requests?: string
  /** Dockerfile (part 8): the course project that is built, and its .dockerignore. */
  project?: ProjectId
  ignore?: string
}

/**
 * Test for a Spring exercise (part 8): requests in `.http` notation with expected answers
 * (`→ 201 {"title": "Milk"}`) and/or a Java expression evaluated afterwards, where
 * `context` (the ApplicationContext) and `output` are available. Every test gets a fresh application.
 */
export type SpringTestSpec = {
  name: string | { de: string; en: string }
  http?: string
  expression?: string
  expected?: unknown
}

/**
 * Test for a Dockerfile or compose exercise (part 8): a function that looks at the simulated
 * result - the built image or the started containers.
 */
export type DockerTest = {
  name: string | { de: string; en: string }
  dockerfile?: (result: BuildResult) => boolean
  compose?: (result: ComposeResult) => boolean
}

/**
 * Test for a React exercise (see reactTestKit.ts). `script` is test code that renders and uses the
 * component App: `await render()`, `await click(button('+'))`, `expect(text())…`
 */
export type ReactTest = {
  name: string | { de: string; en: string }
  script: string
}

export type TestResult = { name: string; ok: boolean; message: string }

export type SandboxMessage =
  | { tryit: true; runId: number; type: 'log' | 'info' | 'warn' | 'error'; text: string }
  | { tryit: true; runId: number; type: 'exception'; text: string; line: number | null }
  | { tryit: true; runId: number; type: 'tests'; results: TestResult[] }
  | { tryit: true; runId: number; type: 'done'; content: boolean }
  | { tryit: true; runId: number; type: 'clear' | 'content' }

// Runs as a classic script BEFORE the code. Every name starts with __ so it cannot clash with
// the learner's variables. The messages it posts are the SandboxMessage type above.
const BRIDGE = `
const __send = (type, text, extra) =>
  parent.postMessage({ tryit: true, runId: __RUN_ID, type, text, ...extra }, '*');

const __fmt = (value, depth = 0) => {
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
  if (typeof value === 'function') return 'ƒ ' + (value.name || 'anonymous') + '()';
  if (typeof value === 'bigint') return value + 'n';
  if (value === null || typeof value !== 'object') return String(value);
  if (value instanceof Error) return value.name + ': ' + value.message;
  if (value instanceof Promise) return 'Promise { … }';
  if (value instanceof Date) return 'Date(' + value.toISOString() + ')';
  if (value instanceof Node) return '<' + value.nodeName.toLowerCase() + '>';
  if (depth > 3) return Array.isArray(value) ? '[…]' : '{…}';
  if (Array.isArray(value)) return '[' + value.map((v) => __fmt(v, depth + 1)).join(', ') + ']';
  if (value instanceof Map)
    return 'Map(' + value.size + ') { ' + [...value].map(([k, v]) => __fmt(k, 1) + ' => ' + __fmt(v, depth + 1)).join(', ') + ' }';
  if (value instanceof Set)
    return 'Set(' + value.size + ') { ' + [...value].map((v) => __fmt(v, depth + 1)).join(', ') + ' }';
  const name = value.constructor && value.constructor !== Object ? value.constructor.name + ' ' : '';
  const fields = Object.entries(value).map(([k, v]) => k + ': ' + __fmt(v, depth + 1));
  return name + (fields.length ? '{ ' + fields.join(', ') + ' }' : '{}');
};

const __equal = (a, b) => {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => __equal(a[k], b[k]));
};

for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
  const original = console[level].bind(console);
  console[level] = (...values) => {
    original(...values);
    __send(level === 'debug' ? 'log' : level, values.map((v) => __fmt(v)).join(' '));
  };
}
console.table = (data) => console.log(data);
const __timers = new Map();
console.time = (label = 'default') => __timers.set(label, performance.now());
console.timeEnd = (label = 'default') => {
  if (!__timers.has(label)) return;
  console.log(label + ': ' + (performance.now() - __timers.get(label)).toFixed(1) + ' ms');
  __timers.delete(label);
};
console.clear = () => __send('clear');

window.addEventListener('error', (e) => {
  const text = (e.message || String(e.error)).replace(/^Uncaught /, '');
  __send('exception', text, { line: e.lineno ? e.lineno - __OFFSET : null });
});
// Forms without a handler of their own would reload the iframe.
window.addEventListener('submit', (e) => e.preventDefault());
window.addEventListener('unhandledrejection', (e) => {
  __send('exception', __T.promiseError + __fmt(e.reason), { line: null });
});

// Did the code put something visible into the document? Then the page shows the preview, otherwise
// only the console. Counts elements and text - except scripts, whitespace and the empty <div id="app">.
const __hasContent = () => {
  for (const k of document.body.childNodes) {
    if (k.nodeType === 3 ? !k.textContent.trim() : k.nodeType !== 1) continue; // whitespace, comments
    if (k.tagName === 'SCRIPT') continue;
    if (k.id === 'app' && !k.hasChildNodes()) continue;
    return true;
  }
  return false;
};
// Content that only shows up after the first pass (timer, fetch, click) is reported by the observer.
const __observer = new MutationObserver(() => {
  if (!__hasContent()) return;
  __observer.disconnect();
  __send('content');
});
__observer.observe(document.body, { childList: true, subtree: true, characterData: true });
`

// Appended to the learner's code - in the same module, so `eval` sees its variables and functions.
const TEST_RUNNER = `
;{
  const __tests = __TESTS;
  const __results = [];
  for (const __t of __tests) {
    try {
      let __value = eval(__t.expression);
      if (__value instanceof Promise) {
        __value = await Promise.race([
          __value,
          new Promise((_, reject) => setTimeout(() => reject(new Error(__T.timeout)), 3000)),
        ]);
      }
      if ('expected' in __t) {
        const ok = __equal(__value, __t.expected);
        __results.push({ name: __t.name, ok, message: ok ? '' : __T.expected + ' ' + __fmt(__t.expected, 1) + ', ' + __T.received + ' ' + __fmt(__value, 1) });
      } else {
        const ok = __value === true;
        __results.push({ name: __t.name, ok, message: ok ? '' : __T.condition });
      }
    } catch (__e) {
      __results.push({ name: __t.name, ok: false, message: __e.name + ': ' + __e.message });
    }
  }
  __send('tests', '', { results: __results });
}
`

// Messages created inside the iframe - there is no React context there.
const SANDBOX_MESSAGES = {
  de: {
    expected: 'erwartet',
    received: 'erhalten',
    condition: 'Bedingung ist nicht erfüllt',
    timeout: 'Zeitüberschreitung nach 3 s',
    promiseError: 'Unbehandelter Promise-Fehler: ',
  },
  en: {
    expected: 'expected',
    received: 'received',
    condition: 'Condition is not met',
    timeout: 'Timed out after 3 s',
    promiseError: 'Unhandled promise rejection: ',
  },
}

export function sandboxDocument(options: {
  runId: number
  code: string
  setup?: string
  tests?: Test[]
  dark: boolean
  language: 'de' | 'en'
}): string {
  const { runId, code, setup = '', tests, dark, language } = options

  // "</script" in the code would end the surrounding script tag early.
  const escape = (s: string) => s.replace(/<\/script/gi, '<\\/script')

  const colors = dark
    ? 'color:#e2e8f0;background:transparent'
    : 'color:#0f172a;background:transparent'
  // The same color scheme as the page (ThemeContext sets color-scheme on <html>). If they differ,
  // the browser puts an opaque white layer behind the iframe - light text on white in dark mode.
  const scheme = dark ? 'dark' : 'light'

  const head =
    `<!doctype html><html><head><meta charset="utf-8"><style>` +
    `:root{color-scheme:${scheme}}body{margin:12px;font:14px/1.5 system-ui,sans-serif;${colors}}` +
    `button{font:inherit;padding:2px 10px;margin:2px}input{font:inherit}.done{opacity:.55;text-decoration:line-through}</style></head>` +
    `<body><div id="app"></div>\n` +
    `<script>const __RUN_ID=${runId};const __OFFSET=__LINE_OFFSET;const __T=${JSON.stringify(SANDBOX_MESSAGES[language])};\n${BRIDGE}\n${escape(setup)}\n</script>\n` +
    `<script type="module">\n`

  // Line numbers in error messages should refer to the editor.
  const offset = head.split('\n').length - 1
  const headWithOffset = head.replace('__LINE_OFFSET', String(offset))

  const testCode = tests?.length
    ? // A function as replacement - otherwise "$&" and the like in the tests would be interpreted.
      TEST_RUNNER.replace('__TESTS', () => escape(JSON.stringify(tests)))
    : ''

  return (
    headWithOffset +
    escape(code) +
    '\n' +
    testCode +
    "\n__send('done', undefined, { content: __hasContent() });\n</script></body></html>"
  )
}
