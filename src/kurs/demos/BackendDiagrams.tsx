import type { ReactNode } from 'react'
import { useSprache } from '../../i18n/SpracheContext'

/**
 * Small diagrams for part 8 - plain HTML boxes and arrows, readable in light and
 * dark mode and on a phone. Texts in both languages, like every demo.
 */

function Box({ title, children, tone = 'slate' }: { title: ReactNode; children?: ReactNode; tone?: 'slate' | 'green' | 'sky' | 'cyan' | 'amber' | 'violet' }) {
  const tones = {
    slate: 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900',
    green: 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/40',
    sky: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40',
    cyan: 'border-cyan-300 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950/40',
    amber: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
    violet: 'border-violet-300 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40',
  }
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${tones[tone]}`}>
      <div className="font-semibold">{title}</div>
      {children && <div className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{children}</div>}
    </div>
  )
}

/** An arrow with a label - horizontal on wide screens, vertical on phones. */
function Arrow({ label, back }: { label: ReactNode; back?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-1 py-1 text-center font-mono text-2xs text-slate-500 dark:text-slate-400">
      <span>{label}</span>
      <span aria-hidden="true" className="text-lg leading-none">
        <span className="hidden sm:inline">⟶</span>
        <span className="sm:hidden">↓</span>
      </span>
      {back && (
        <>
          <span aria-hidden="true" className="text-lg leading-none">
            <span className="hidden sm:inline">⟵</span>
            <span className="sm:hidden">↑</span>
          </span>
          <span>{back}</span>
        </>
      )}
    </div>
  )
}

function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure role="img" aria-label={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      {children}
    </figure>
  )
}

const TEXTS = {
  de: {
    flowLabel: 'Ablauf einer Anfrage: Browser, HTTP, Spring Boot, Datenbank',
    browser: 'Browser',
    browserText: 'Die React-App ruft fetch("/api/todos") auf.',
    spring: 'Spring Boot',
    springText: 'Tomcat nimmt die Anfrage an, Spring ruft die passende Controller-Methode auf.',
    db: 'Datenbank',
    dbText: 'Speichert die Daten dauerhaft (Kapitel 8.5).',
    request: 'GET /api/todos',
    response: '200 OK + JSON',
    sql: 'SQL',
    rows: 'Zeilen',
    layersLabel: 'Die drei Schichten einer Spring-Anwendung',
    controller: 'Controller',
    controllerText: 'HTTP rein, HTTP raus: Pfade, Parameter, Status-Codes. Keine Geschäftslogik.',
    service: 'Service',
    serviceText: 'Die Regeln der Anwendung: „Ein ToDo braucht einen Titel“, „Erledigte zuletzt“.',
    repository: 'Repository',
    repositoryText: 'Speichern und Laden. Mit Spring Data nur ein Interface.',
    vmLabel: 'Virtuelle Maschinen und Container im Vergleich',
    vms: 'Virtuelle Maschinen',
    containers: 'Container',
    app: 'App',
    libs: 'Bibliotheken',
    guestOs: 'eigenes Betriebssystem',
    hypervisor: 'Hypervisor',
    engine: 'Docker Engine',
    hostOs: 'Betriebssystem des Rechners (Kernel)',
    hardware: 'Hardware',
    portLabel: 'Port-Mapping: Port 8080 des Rechners zeigt auf Port 80 im Container',
    host: 'Dein Rechner',
    container: 'Container „web“',
    publish: '-p 8080:80',
    hostText: 'Der Browser öffnet http://localhost:8080',
    containerText: 'nginx lauscht auf Port 80 - aber nur im Container.',
    corsLabel: 'Zwei Ursprünge: localhost:5173 und localhost:8080',
    dev: 'Vite-Dev-Server',
    devText: 'liefert die React-App aus',
    api: 'Spring Boot',
    apiText: 'liefert JSON',
    blocked: 'fetch("http://localhost:8080/api/…") → ❌ CORS-Fehler (anderer Ursprung)',
    proxy: 'fetch("/api/…") → Vite-Proxy leitet weiter → ✅ gleicher Ursprung',
    composeLabel: 'Drei Container in einem gemeinsamen Netzwerk',
    network: 'Netzwerk todo_default',
    web: 'web (nginx)',
    webText: 'React-App · Port 3000 → 80',
    apiBox: 'api (Spring Boot)',
    apiBoxText: 'Port 8080 → 8080 · spricht mit db:5432',
    dbBox: 'db (postgres)',
    dbBoxText: 'kein Port nach außen nötig · Volume db-data',
    yourPc: 'Dein Rechner / Browser',
  },
  en: {
    flowLabel: 'Flow of a request: browser, HTTP, Spring Boot, database',
    browser: 'Browser',
    browserText: 'The React app calls fetch("/api/todos").',
    spring: 'Spring Boot',
    springText: 'Tomcat accepts the request, Spring calls the matching controller method.',
    db: 'Database',
    dbText: 'Stores the data permanently (chapter 8.5).',
    request: 'GET /api/todos',
    response: '200 OK + JSON',
    sql: 'SQL',
    rows: 'rows',
    layersLabel: 'The three layers of a Spring application',
    controller: 'Controller',
    controllerText: 'HTTP in, HTTP out: paths, parameters, status codes. No business logic.',
    service: 'Service',
    serviceText: 'The rules of the application: “a todo needs a title”, “done ones last”.',
    repository: 'Repository',
    repositoryText: 'Saving and loading. With Spring Data just an interface.',
    vmLabel: 'Virtual machines and containers compared',
    vms: 'Virtual machines',
    containers: 'Containers',
    app: 'App',
    libs: 'Libraries',
    guestOs: 'its own operating system',
    hypervisor: 'Hypervisor',
    engine: 'Docker Engine',
    hostOs: 'Host operating system (kernel)',
    hardware: 'Hardware',
    portLabel: 'Port mapping: port 8080 of the machine points to port 80 in the container',
    host: 'Your machine',
    container: 'Container “web”',
    publish: '-p 8080:80',
    hostText: 'The browser opens http://localhost:8080',
    containerText: 'nginx listens on port 80 - but only inside the container.',
    corsLabel: 'Two origins: localhost:5173 and localhost:8080',
    dev: 'Vite dev server',
    devText: 'serves the React app',
    api: 'Spring Boot',
    apiText: 'serves JSON',
    blocked: 'fetch("http://localhost:8080/api/…") → ❌ CORS error (different origin)',
    proxy: 'fetch("/api/…") → the Vite proxy forwards → ✅ same origin',
    composeLabel: 'Three containers in one shared network',
    network: 'network todo_default',
    web: 'web (nginx)',
    webText: 'React app · port 3000 → 80',
    apiBox: 'api (Spring Boot)',
    apiBoxText: 'port 8080 → 8080 · talks to db:5432',
    dbBox: 'db (postgres)',
    dbBoxText: 'no outside port needed · volume db-data',
    yourPc: 'Your machine / browser',
  },
}

const useTexts = () => TEXTS[useSprache().sprache]

export function RequestFlow() {
  const t = useTexts()
  return (
    <Figure label={t.flowLabel}>
      <div className="grid items-center gap-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <Box title={`🌐 ${t.browser}`} tone="sky">
          {t.browserText}
        </Box>
        <Arrow label={t.request} back={t.response} />
        <Box title={`🍃 ${t.spring}`} tone="green">
          {t.springText}
        </Box>
        <Arrow label={t.sql} back={t.rows} />
        <Box title={`🗄️ ${t.db}`} tone="amber">
          {t.dbText}
        </Box>
      </div>
    </Figure>
  )
}

export function SpringLayers() {
  const t = useTexts()
  return (
    <Figure label={t.layersLabel}>
      <div className="mx-auto grid max-w-xl gap-1">
        <Box title={`🌐 @RestController · ${t.controller}`} tone="sky">
          {t.controllerText}
        </Box>
        <div className="text-center text-slate-400" aria-hidden="true">
          ↓
        </div>
        <Box title={`⚙️ @Service · ${t.service}`} tone="green">
          {t.serviceText}
        </Box>
        <div className="text-center text-slate-400" aria-hidden="true">
          ↓
        </div>
        <Box title={`🗄️ JpaRepository · ${t.repository}`} tone="amber">
          {t.repositoryText}
        </Box>
      </div>
    </Figure>
  )
}

function Layer({ children, tone }: { children: ReactNode; tone: string }) {
  return <div className={`rounded px-2 py-1 text-center text-xs ${tone}`}>{children}</div>
}

export function ContainersVsVms() {
  const t = useTexts()
  const app = 'bg-green-100 dark:bg-green-900/50'
  const lib = 'bg-green-50 dark:bg-green-950/40'
  const os = 'bg-rose-100 dark:bg-rose-900/40'
  const base = 'bg-slate-200 dark:bg-slate-800'
  return (
    <Figure label={t.vmLabel}>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: t.vms, middle: t.hypervisor, guest: true },
          { title: t.containers, middle: t.engine, guest: false },
        ].map((side) => (
          <div key={side.title} className="space-y-1">
            <div className="text-center text-sm font-semibold">{side.title}</div>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-1">
                  <Layer tone={app}>
                    {t.app} {n}
                  </Layer>
                  <Layer tone={lib}>{t.libs}</Layer>
                  {side.guest && <Layer tone={os}>{t.guestOs}</Layer>}
                </div>
              ))}
            </div>
            <Layer tone="bg-cyan-100 dark:bg-cyan-900/40">{side.middle}</Layer>
            <Layer tone={base}>{t.hostOs}</Layer>
            <Layer tone={base}>{t.hardware}</Layer>
          </div>
        ))}
      </div>
    </Figure>
  )
}

export function PortMapping() {
  const t = useTexts()
  return (
    <Figure label={t.portLabel}>
      <div className="grid items-center gap-1 sm:grid-cols-[1fr_auto_1fr]">
        <Box title={`💻 ${t.host} · :8080`} tone="sky">
          {t.hostText}
        </Box>
        <Arrow label={t.publish} />
        <Box title={`📦 ${t.container} · :80`} tone="cyan">
          {t.containerText}
        </Box>
      </div>
    </Figure>
  )
}

export function CorsPicture() {
  const t = useTexts()
  return (
    <Figure label={t.corsLabel}>
      <div className="grid gap-2 sm:grid-cols-2">
        <Box title={`⚡ ${t.dev} · http://localhost:5173`} tone="violet">
          {t.devText}
        </Box>
        <Box title={`🍃 ${t.api} · http://localhost:8080`} tone="green">
          {t.apiText}
        </Box>
      </div>
      <ul className="mt-3 space-y-1 font-mono text-xs">
        <li>{t.blocked}</li>
        <li>{t.proxy}</li>
      </ul>
    </Figure>
  )
}

export function ComposeNetwork() {
  const t = useTexts()
  return (
    <Figure label={t.composeLabel}>
      <div className="mb-2 text-center text-sm font-semibold">💻 {t.yourPc}</div>
      <div className="mb-2 text-center font-mono text-xs text-slate-500" aria-hidden="true">
        localhost:3000 ↓ &nbsp;&nbsp;&nbsp; localhost:8080 ↓
      </div>
      <div className="rounded-lg border-2 border-dashed border-cyan-300 p-3 dark:border-cyan-800">
        <div className="mb-2 font-mono text-xs text-cyan-700 dark:text-cyan-400">🔗 {t.network}</div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Box title={`⚛️ ${t.web}`} tone="sky">
            {t.webText}
          </Box>
          <Box title={`🍃 ${t.apiBox}`} tone="green">
            {t.apiBoxText}
          </Box>
          <Box title={`🐘 ${t.dbBox}`} tone="amber">
            {t.dbBoxText}
          </Box>
        </div>
      </div>
    </Figure>
  )
}
