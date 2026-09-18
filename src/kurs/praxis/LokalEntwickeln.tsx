import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { CodeBlock } from '../../lernen/CodeBlock'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { LokalCheckliste } from '../demos/LokalCheckliste'
import { beispiele, codeBloecke } from './LokalEntwickeln.code'

/**
 * KAPITEL 4.10 - Lokal entwickeln: die Brücke vom Browser-Editor zum eigenen Projekt
 */
export function LokalEntwickeln() {
  return (
    <>
      <Abschnitt titel="Warum raus aus dem Browser-Editor?">
        <P>
          Die Editoren hier sind zum Lernen gebaut: Hooks sind schon importiert, alles steht in einer Datei, und
          Tests sagen dir, ob es stimmt. Echte Projekte sehen anders aus - viele Dateien, Imports, TypeScript,
          ein Build-Schritt. Genau diesen Schritt machst du in diesem Kapitel, und zwar mit der ToDo-App aus{' '}
          <Verweis id="projekt-11-laden">dem Projekt</Verweis>.
        </P>
        <Liste>
          <li>
            <strong>Node.js</strong> (LTS-Version) - bringt <Code>npm</Code> mit, das Pakete installiert und Skripte
            startet
          </li>
          <li>
            <strong>VS Code</strong> als Editor - mit TypeScript-Unterstützung ohne Extra-Einstellungen
          </li>
          <li>
            <strong>React DevTools</strong> als Browser-Erweiterung für Chrome, Edge oder Firefox
          </li>
        </Liste>
        <CodeBlock titel="Terminal" code={codeBloecke.pruefen} />
      </Abschnitt>

      <Abschnitt titel="Ein Projekt mit Vite anlegen">
        <P>
          <strong>Vite</strong> legt ein fertiges React-Projekt an und startet einen Entwicklungsserver. Änderungen
          an Dateien erscheinen sofort im Browser, ohne dass der State verloren geht (Hot Module Replacement).
        </P>
        <CodeBlock titel="Terminal" code={codeBloecke.anlegen} />
        <P>
          Danach läuft die App unter <Code>http://localhost:5173</Code>. Die Struktur ist überschaubar:
        </P>
        <CodeBlock code={codeBloecke.struktur} />
        <Hinweis variante="tipp">
          Diese Lern-App ist genauso aufgebaut: React, TypeScript, Vite und Tailwind. Im Ordner{' '}
          <Code>reactsample/src</Code> kannst du dir ansehen, wie ein größeres Projekt organisiert ist.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Was im echten Projekt anders ist">
        <Liste>
          <li>
            <strong>Imports:</strong> Hooks kommen nicht automatisch - <Code>{"import { useState } from 'react'"}</Code>{' '}
            (<Verweis id="js-dom" />).
          </li>
          <li>
            <strong>Exporte:</strong> <Code>App</Code> wird mit <Code>export default</Code> für <Code>main.tsx</Code>{' '}
            bereitgestellt.
          </li>
          <li>
            <strong>Eine Komponente pro Datei</strong>, meist unter <Code>src/components/</Code>.
          </li>
          <li>
            <strong>TypeScript:</strong> Props und State bekommen Typen. Fehler zeigt VS Code schon beim Tippen (<Verweis id="praxis-typescript" />).
          </li>
          <li>
            <strong>StrictMode:</strong> In der Entwicklung laufen Effekte absichtlich zweimal, damit fehlende
            Cleanups auffallen (<Verweis id="hooks-useeffect" />).
          </li>
        </Liste>
        <CodeBlock titel="src/App.tsx" code={codeBloecke.importe} />
        <CodeBlock code={codeBloecke.aufteilen} />
      </Abschnitt>

      <Abschnitt titel="Fehler finden: Konsole, Debugger, React DevTools">
        <P>
          Wenn etwas nicht stimmt, rate nicht - sieh nach. Drei Werkzeuge reichen für fast alles:
        </P>
        <Liste>
          <li>
            <Code>console.log(wert)</Code> - der schnellste Blick auf einen Wert. Tipp:{' '}
            <Code>{'console.log({ todos, filter })'}</Code> zeigt gleich die Namen mit an.
          </li>
          <li>
            <strong>Breakpoints</strong> - im Browser unter <em>Sources</em> auf eine Zeilennummer klicken oder{' '}
            <Code>debugger</Code> in den Code schreiben. Die Ausführung hält an, und du siehst alle Variablen.
          </li>
          <li>
            <strong>React DevTools</strong> - Tab <em>Components</em> zeigt den Komponentenbaum mit Props, State
            und Hooks; Tab <em>Profiler</em> zeigt, was wie oft rendert (<Verweis id="hooks-usememo" />).
          </li>
        </Liste>
        <CodeBlock code={codeBloecke.debugger} />
        <TryIt
          id="praxis-lokal-debugging"
          titel="🐞 Fehlersuche"
          {...beispiele['praxis-lokal-debugging']}
          aufgabe={
            <p>
              <Code>averageLength</Code> liefert falsche Werte. Finde mit <Code>console.log</Code> heraus, warum, und
              korrigiere die Funktion - auch für eine leere Liste.
            </p>
          }
        />
      </Abschnitt>

      <Abschnitt titel="Die ToDo-App lokal nachbauen">
        <P>
          Nimm die Lösung aus <Verweis id="projekt-11-laden" /> (oder deine eigene aus der Challenge) und bring sie
          Schritt für Schritt in dein Projekt: erst alles in <Code>App.tsx</Code> mit den nötigen Imports, dann
          Komponenten auf eigene Dateien verteilen, dann Typen ergänzen. Tausche <Code>API_URL</Code> gegen eine
          echte Adresse oder eine JSON-Datei in <Code>public/</Code>.
        </P>
        <LokalCheckliste />
        <P>Zum Veröffentlichen baust du eine optimierte Version:</P>
        <CodeBlock titel="Terminal" code={codeBloecke.bauen} />
        <P>
          Der Ordner <Code>dist/</Code> enthält nur noch statische Dateien. Die kannst du bei Diensten wie Netlify,
          Vercel oder GitHub Pages hochladen.
        </P>
      </Abschnitt>

      <Merke
        punkte={[
          <>
            <Code>npm create vite@latest</Code> legt ein Projekt an, <Code>npm run dev</Code> startet es,{' '}
            <Code>npm run build</Code> baut es.
          </>,
          <>Im echten Projekt importierst du Hooks selbst und verteilst Komponenten auf Dateien.</>,
          <>
            Fehler findest du mit <Code>console.log</Code>, Breakpoints und den React DevTools - statt zu raten.
          </>,
          <>StrictMode ruft Effekte in der Entwicklung doppelt auf, um fehlende Cleanups aufzudecken.</>,
        ]}
      />

      <Quiz
        fragen={[
          {
            frage: 'Welcher Befehl startet den Entwicklungsserver eines Vite-Projekts?',
            antworten: [<Code key="a">npm run build</Code>, <Code key="b">npm run dev</Code>, <Code key="c">npm install</Code>],
            richtig: 1,
            erklaerung: 'npm run dev startet den Server mit Hot Reload; build erzeugt die fertige Version in dist/.',
          },
          {
            frage: 'Dein Effekt läuft in der Entwicklung zweimal. Was ist der Grund?',
            antworten: ['Ein Fehler in Vite', 'StrictMode prüft absichtlich, ob das Cleanup stimmt', 'Die Abhängigkeiten fehlen'],
            richtig: 1,
            erklaerung: 'StrictMode mountet Komponenten in der Entwicklung doppelt. Im Build passiert das nicht.',
          },
          {
            frage: 'Wo siehst du den aktuellen State einer bestimmten Komponente am bequemsten?',
            antworten: ['Im Netzwerk-Tab', 'In den React DevTools unter Components', 'In der package.json'],
            richtig: 1,
            erklaerung: 'Der Components-Tab zeigt Props, State und Hooks jeder Komponente - und du kannst Werte sogar ändern.',
          },
        ]}
      />
    </>
  )
}
