import { useMemo, useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { localized } from '../i18n/localized'
import { useSprache } from '../i18n/SpracheContext'
import { simulateBuild, type BuildResult, type BuildRun, type Change } from '../docker/build'
import { composeUp, type ComposeResult } from '../docker/compose'
import { formatSize } from '../docker/images'
import { PROJECTS } from '../docker/projects'
import { CodeEditor } from './CodeEditor'
import { lineMarkers } from './editorChecks'
import { Rahmen, Testergebnisse } from './Rahmen'
import type { DockerProps } from './TryIt'
import { useSavedCode } from './useSavedCode'
import type { TestErgebnis } from './jsSandbox'

/**
 * The editors for part 8's Docker chapters:
 *
 *   modus="dockerfile"  a simulated `docker build` of one of the course projects - build steps
 *                       with CACHED markers, a second build after a change, the image's layers,
 *                       review hints and what `docker run` would print
 *   modus="compose"     a simulated `docker compose up` - start order, logs, `docker compose ps`
 *
 * The simulators live in src/docker/ and know nothing about React.
 */

const TEXTS = {
  de: {
    build: 'docker build',
    up: 'docker compose up',
    change: 'Danach ändern und neu bauen:',
    changes: { code: 'Quellcode (src/)', dependencies: 'Abhängigkeiten (pom.xml / package.json)', none: 'nichts' } satisfies Record<Change, string>,
    firstBuild: 'Erster Build',
    secondBuild: (what: string) => `Neuer Build nach Änderung: ${what}`,
    seconds: (s: number) => `${s.toLocaleString('de-DE')} s`,
    cached: 'CACHED',
    image: 'Image',
    size: 'Größe',
    base: 'Basis',
    layers: 'Schichten des fertigen Images',
    user: 'Benutzer',
    command: 'Startbefehl',
    context: (mb: string) => `Build-Kontext: ${mb} an Docker geschickt`,
    hints: 'Hinweise',
    run: 'docker run -p 8080:… (Vorschau)',
    failed: 'Build fehlgeschlagen',
    ignore: '.dockerignore',
    ignoreEditor: 'Editor für .dockerignore',
    project: (name: string) => `Projekt: ${name}`,
    containers: 'docker compose ps',
    browser: 'Im Browser bzw. mit curl',
    log: 'Ausgabe',
    exerciseStart: 'Starte mit ▶ - dann laufen die Tests.',
    severities: { error: 'Fehler', warning: 'Warnung', info: 'Tipp' },
    line: (n: number) => `Zeile ${n}`,
  },
  en: {
    build: 'docker build',
    up: 'docker compose up',
    change: 'Then change and rebuild:',
    changes: { code: 'source code (src/)', dependencies: 'dependencies (pom.xml / package.json)', none: 'nothing' } satisfies Record<Change, string>,
    firstBuild: 'First build',
    secondBuild: (what: string) => `New build after changing: ${what}`,
    seconds: (s: number) => `${s} s`,
    cached: 'CACHED',
    image: 'Image',
    size: 'Size',
    base: 'Base',
    layers: 'Layers of the final image',
    user: 'User',
    command: 'Start command',
    context: (mb: string) => `Build context: ${mb} sent to Docker`,
    hints: 'Hints',
    run: 'docker run -p 8080:… (preview)',
    failed: 'Build failed',
    ignore: '.dockerignore',
    ignoreEditor: 'Editor for .dockerignore',
    project: (name: string) => `Project: ${name}`,
    containers: 'docker compose ps',
    browser: 'In the browser or with curl',
    log: 'Output',
    exerciseStart: 'Start with ▶ - then the tests run.',
    severities: { error: 'Error', warning: 'Warning', info: 'Tip' },
    line: (n: number) => `line ${n}`,
  },
}

export function TryItDocker(props: DockerProps) {
  return props.modus === 'compose' ? <ComposeEditor {...props} /> : <DockerfileEditor {...props} />
}

function testResults(tests: DockerProps['tests'], language: 'de' | 'en', check: (test: NonNullable<DockerProps['tests']>[number]) => boolean): TestErgebnis[] | null {
  if (!tests?.length) return null
  return tests.map((test) => {
    let ok = false
    try {
      ok = check(test)
    } catch {
      ok = false
    }
    return { name: localized(test.name, language), ok, meldung: '' }
  })
}

// ---------------------------------------------------------------------------
// Dockerfile
// ---------------------------------------------------------------------------

function DockerfileEditor({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, project = 'spring', ignore: startIgnore, ...playground }: DockerProps) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const [code, setCode] = useSavedCode(id, startCode)
  const [ignore, setIgnore] = useSavedCode(id + ':ignore', startIgnore ?? '')
  const [change, setChange] = useState<Change>('code')

  function compute(source: string, withTests: boolean, what: Change) {
    const built = simulateBuild(source, { project, ignore, change: what === 'none' ? undefined : what })
    return { build: built, results: withTests ? testResults(tests, sprache, (test) => Boolean(test.dockerfile?.(built))) : null }
  }
  // Examples are built right away (the simulation is synchronous), exercises on the button.
  const [result, setResult] = useState<{ build: BuildResult; results: TestErgebnis[] | null } | null>(() => (tests ? null : compute(code, false, 'code')))

  function build(source: string, withTests: boolean, what: Change = change) {
    setResult(compute(source, withTests, what))
  }

  const markers = useMemo(() => {
    if (!result) return undefined
    const marks = result.build.findings.filter((f) => f.severity !== 'info').map((f) => ({ zeile: f.line, text: f[sprache] }))
    if (result.build.first.error) marks.push({ zeile: result.build.first.error.line, text: result.build.first.error.message })
    return lineMarkers(code, marks)
  }, [result, code, sprache])

  const top = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <span className="flex items-center gap-1.5">
        <Icon name="ordner" className="size-3.5" />
        {t.project(PROJECTS[project].name)}
      </span>
      <details className="min-w-0 flex-1">
        <summary className="cursor-pointer font-mono">
          <Icon name="datei" className="mr-1.5 inline size-3.5 align-[-2px]" />
          {t.ignore}
          {ignore.trim() ? '' : ' (—)'}
        </summary>
        <div className="mt-1 -mx-4">
          <CodeEditor wert={ignore} beiAenderung={setIgnore} beiAusfuehren={() => build(code, true)} label={t.ignoreEditor} sprache="properties" maxZeilen={6} />
        </div>
      </details>
    </div>
  )

  return (
    <Rahmen
      {...playground}
      art="Docker"
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      markierungen={markers}
      startText={t.build}
      oben={top}
      ausfuehren={(c) => build(c ?? code, true)}
    >
      <Testergebnisse id={id} ergebnisse={result?.results ?? null} />
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs dark:border-slate-800">
        <label className="flex items-center gap-2">
          {t.change}
          <select
            value={change}
            onChange={(e) => {
              const next = e.target.value as Change
              setChange(next)
              build(code, Boolean(result?.results), next)
            }}
            className="rounded-md border border-slate-300 bg-white px-1.5 py-1 dark:border-slate-700 dark:bg-slate-900"
          >
            {(['code', 'dependencies', 'none'] as const).map((c) => (
              <option key={c} value={c}>
                {t.changes[c]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {result ? <BuildView result={result.build} change={change} /> : <p className="px-4 py-3 text-sm text-slate-500 italic">{t.exerciseStart}</p>}
    </Rahmen>
  )
}

function BuildView({ result, change }: { result: BuildResult; change: Change }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const image = result.image
  return (
    <div className="space-y-4 px-4 py-3 text-sm">
      {result.first.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 font-mono text-code whitespace-pre-wrap text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <Icon name="kreisKreuz" className="mr-1.5 inline size-3.5 align-[-2px]" />
          {t.failed} ({t.line(result.first.error.line)}):{'\n'}
          {result.first.error.message}
        </div>
      ) : null}

      {result.first.steps.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <StepList title={t.firstBuild} run={result.first} />
          {result.second && <StepList title={t.secondBuild(t.changes[change])} run={result.second} highlight />}
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400">{t.context(formatSize(result.first.contextMb))}</p>

      {image && (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 self-center font-semibold">
              <Icon name="paket" className="size-4 text-cyan-600 dark:text-cyan-400" />
              {t.image}
            </span>
            <span>
              {t.size}: <strong>{formatSize(image.sizeMb)}</strong>
            </span>
            <span>
              {t.base}: <code className="font-mono">{image.base}</code>
            </span>
            <span>
              {t.user}: <code className="font-mono">{image.user}</code>
            </span>
            {image.command && (
              <span className="min-w-0">
                {t.command}: <code className="font-mono break-all">{JSON.stringify(image.command)}</code>
              </span>
            )}
          </div>
          <LayerBar image={image} title={t.layers} />
        </div>
      )}

      {result.findings.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">{t.hints}</h4>
          <ul className="space-y-1.5">
            {result.findings.map((f, i) => (
              <li key={i} className="flex gap-2 text-code">
                <SeverityIcon severity={f.severity} />
                <span>
                  <span className="text-xs text-slate-500">
                    {t.severities[f.severity]} · {t.line(f.line)}
                    {/^DL\d/.test(f.rule) ? ` · ${f.rule}` : ''}:
                  </span>{' '}
                  <InlineCode text={f[sprache]} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.run && (
        <div className="overflow-hidden rounded-lg bg-slate-900 font-mono text-code leading-5 dark:bg-black/40">
          <div className="border-b border-slate-700 px-3 py-1 text-2xs tracking-wider text-slate-400 uppercase">$ {t.run}</div>
          <div className="px-3 py-2">
            {result.run.lines.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap ${result.run!.ok ? 'text-slate-100' : 'text-rose-300'}`}>
                {l}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StepList({ title, run, highlight = false }: { title: string; run: BuildRun; highlight?: boolean }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  return (
    <div className="min-w-0">
      <h4 className="mb-1 flex items-baseline justify-between gap-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
        <span>{title}</span>
        <span className="flex items-center gap-1 font-mono text-slate-700 normal-case dark:text-slate-200">
          <Icon name="uhr" className="size-3" />
          {t.seconds(run.seconds)}
        </span>
      </h4>
      <ol className="overflow-hidden rounded-lg border border-slate-200 font-mono text-xs dark:border-slate-800">
        {run.steps.map((s, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 border-b border-slate-100 px-2 py-1 last:border-0 dark:border-slate-800 ${
              highlight && !s.cached ? 'bg-amber-50 dark:bg-amber-950/30' : ''
            }`}
            title={s.note}
          >
            <span className="min-w-0 flex-1 break-all">{s.label}</span>
            {s.cached ? (
              <span className="shrink-0 rounded bg-emerald-100 px-1 text-3xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{t.cached}</span>
            ) : (
              <span className="shrink-0 text-slate-500">{s.seconds.toFixed(1)}s</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function LayerBar({ image, title }: { image: NonNullable<BuildResult['image']>; title: string }) {
  const parts = [{ label: image.base, sizeMb: image.baseMb, base: true }, ...image.layers.map((l) => ({ label: l.label, sizeMb: l.sizeMb, base: false }))]
  const total = parts.reduce((sum, p) => sum + p.sizeMb, 0) || 1
  return (
    <div className="mt-3">
      <div className="mb-1 text-xs text-slate-500">{title}</div>
      <div className="flex h-5 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700" role="img" aria-label={title}>
        {parts.map((p, i) => (
          <div
            key={i}
            title={`${p.label}: ${formatSize(p.sizeMb)}`}
            style={{ width: `${Math.max(1, (p.sizeMb / total) * 100)}%` }}
            className={`${p.base ? 'bg-slate-300 dark:bg-slate-600' : i % 2 ? 'bg-cyan-400 dark:bg-cyan-600' : 'bg-cyan-300 dark:bg-cyan-700'} border-r border-white last:border-0 dark:border-slate-900`}
          />
        ))}
      </div>
      <ul className="mt-1 grid gap-x-4 text-2xs text-slate-500 sm:grid-cols-2 dark:text-slate-400">
        {parts.map((p, i) => (
          <li key={i} className="truncate font-mono">
            <span className={`mr-1 inline-block size-2 rounded-sm ${p.base ? 'bg-slate-300 dark:bg-slate-600' : 'bg-cyan-400 dark:bg-cyan-600'}`} />
            {formatSize(p.sizeMb)} · {p.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

const SEVERITY_ICONS = {
  error: { icon: 'kreisKreuz', color: 'text-rose-600 dark:text-rose-400' },
  warning: { icon: 'warnung', color: 'text-amber-600 dark:text-amber-400' },
  info: { icon: 'gluehbirne', color: 'text-sky-600 dark:text-sky-400' },
} as const satisfies Record<string, { icon: IconName; color: string }>

/** Error, warning or tip in front of a hint. */
function SeverityIcon({ severity }: { severity: keyof typeof SEVERITY_ICONS }) {
  const { icon, color } = SEVERITY_ICONS[severity]
  return <Icon name={icon} className={`mt-0.5 size-3.5 ${color}`} />
}

/** `text` with `code` parts - the hints use backticks. */
function InlineCode({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith('`') ? (
      <code key={i} className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-slate-800">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  )
}

// ---------------------------------------------------------------------------
// Compose
// ---------------------------------------------------------------------------

function ComposeEditor({ id, titel, aufgabe, code: startCode, loesung, tipps, tests, ...playground }: DockerProps) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const [code, setCode] = useSavedCode(id, startCode)
  function compute(source: string, withTests: boolean) {
    const started = composeUp(source)
    return { up: started, results: withTests ? testResults(tests, sprache, (test) => Boolean(test.compose?.(started))) : null }
  }
  const [result, setResult] = useState<{ up: ComposeResult; results: TestErgebnis[] | null } | null>(() => (tests ? null : compute(code, false)))

  function up(source: string, withTests: boolean) {
    setResult(compute(source, withTests))
  }

  const markers = useMemo(() => {
    if (!result) return undefined
    const errors = result.up.findings.filter((f) => f.severity === 'error')
    return lineMarkers(code, errors.map((f) => ({ zeile: f.line, text: f[sprache] })))
  }, [result, code, sprache])

  return (
    <Rahmen
      {...playground}
      art="Compose"
      titel={titel}
      aufgabe={aufgabe}
      code={code}
      setCode={setCode}
      startCode={startCode}
      loesung={loesung}
      tipps={tipps}
      markierungen={markers}
      startText={t.up}
      ausfuehren={(c) => up(c ?? code, true)}
    >
      <Testergebnisse id={id} ergebnisse={result?.results ?? null} />
      {result ? <ComposeView result={result.up} /> : <p className="px-4 py-3 text-sm text-slate-500 italic">{t.exerciseStart}</p>}
    </Rahmen>
  )
}

const SERVICE_ICONS: Record<string, IconName> = { spring: 'blatt', react: 'atom', postgres: 'datenbank', redis: 'datenbank', nginx: 'globus', other: 'paket' }

/** One line of a service card: ports, start order or volumes. */
function ServiceLine({ icon, className, children }: { icon: IconName; className: string; children: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Icon name={icon} className="size-3" />
      <span className="min-w-0 break-all">{children}</span>
    </div>
  )
}

function ComposeView({ result }: { result: ComposeResult }) {
  const { sprache } = useSprache()
  const t = TEXTS[sprache]
  const colors = ['text-sky-300', 'text-emerald-300', 'text-violet-300', 'text-amber-300', 'text-pink-300']
  const serviceColor = (name: string | null) => {
    const index = result.model?.services.findIndex((s) => s.name === name) ?? -1
    return index >= 0 ? colors[index % colors.length] : 'text-slate-300'
  }
  return (
    <div className="space-y-4 px-4 py-3 text-sm">
      {result.model && (
        <div className="flex flex-wrap items-stretch gap-2" aria-label="Services">
          {result.model.services.map((s) => {
            const container = result.containers.find((c) => c.service === s.name)
            const running = container?.running
            return (
              <div
                key={s.name}
                className={`min-w-36 flex-1 rounded-lg border p-2 text-xs ${
                  running ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30' : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <Icon name={SERVICE_ICONS[s.kind]} className="size-3.5" />
                  <span className="font-mono">{s.name}</span>
                  <span className={`ml-auto size-2 rounded-full ${running ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-label={container?.status} />
                </div>
                <div className="mt-1 font-mono text-slate-500 dark:text-slate-400">{s.image ?? `build: ${s.build}`}</div>
                {s.ports.length > 0 && (
                  <ServiceLine icon="stecker" className="font-mono">
                    {s.ports.map((p) => (p.host ? `${p.host}→${p.container}` : p.container)).join(', ')}
                  </ServiceLine>
                )}
                {s.dependsOn.length > 0 && (
                  <ServiceLine icon="uhr" className="text-slate-500 dark:text-slate-400">
                    {s.dependsOn.map((d) => d.service + (d.condition === 'service_healthy' ? ' (healthy)' : '')).join(', ')}
                  </ServiceLine>
                )}
                {s.volumes.length > 0 && (
                  <ServiceLine icon="festplatte" className="font-mono text-slate-500 dark:text-slate-400">
                    {s.volumes.map((v) => v.source).join(', ')}
                  </ServiceLine>
                )}
                <div className="mt-1 font-medium">{container?.status}</div>
              </div>
            )
          })}
        </div>
      )}

      {result.findings.length > 0 && (
        <ul className="space-y-1.5">
          {result.findings.map((f, i) => (
            <li key={i} className="flex gap-2 text-code">
              <SeverityIcon severity={f.severity} />
              <span>
                <span className="text-xs text-slate-500">{t.line(f.line)}:</span> <InlineCode text={f[sprache]} />
              </span>
            </li>
          ))}
        </ul>
      )}

      {result.log.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-slate-900 font-mono text-xs leading-5 dark:bg-black/40">
          <div className="border-b border-slate-700 px-3 py-1 text-2xs tracking-wider text-slate-400 uppercase">$ docker compose up</div>
          <div className="max-h-96 overflow-auto px-3 py-2">
            {result.log.map((l, i) => (
              <div key={i} className={`whitespace-pre-wrap ${l.kind === 'error' ? 'text-rose-300' : l.kind === 'warn' ? 'text-amber-300' : l.kind === 'ok' && !l.service ? 'text-emerald-300' : 'text-slate-200'}`}>
                {l.service && <span className={serviceColor(l.service)}>{(l.service + '-1').padEnd(8)}| </span>}
                {l.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.containers.length > 0 && (
        <div className="overflow-x-auto">
          <h4 className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">$ {t.containers}</h4>
          <table className="w-full min-w-md text-left font-mono text-xs">
            <thead className="text-slate-500">
              <tr>
                <th className="pr-3 font-normal">NAME</th>
                <th className="pr-3 font-normal">SERVICE</th>
                <th className="pr-3 font-normal">STATUS</th>
                <th className="font-normal">PORTS</th>
              </tr>
            </thead>
            <tbody>
              {result.containers.map((c) => (
                <tr key={c.name} className={c.running ? '' : 'text-rose-600 dark:text-rose-400'}>
                  <td className="pr-3">{c.name}</td>
                  <td className="pr-3">{c.service}</td>
                  <td className="pr-3">{c.status}</td>
                  <td>{c.ports}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.urls.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase">{t.browser}</h4>
          <ul className="space-y-0.5 font-mono text-xs">
            {result.urls.map((u) => (
              <li key={u.url} className={`flex gap-1.5 ${u.ok ? '' : 'text-rose-600 dark:text-rose-400'}`}>
                <Icon name={u.ok ? 'kreisHaken' : 'kreisKreuz'} className={`mt-0.5 size-3.5 ${u.ok ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                <span className="min-w-0">
                  {u.url} → {u.answer}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
