import { Abschnitt, Code, Hinweis, Liste, Merke, P, Tabelle } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Barrierefreiheit.code'

/**
 * KAPITEL 5.9 - Barrierefreiheit (Accessibility, kurz a11y)
 */

const elemente: [string, string, string][] = [
  ['<button>', 'button', 'Fokussierbar, Enter und Leertaste lösen onClick aus'],
  ['<a href>', 'link', 'Führt woandershin - für Aktionen ist es der falsche Baustein'],
  ['<h1> … <h6>', 'heading', 'Gliederung, durch die man springen kann'],
  ['<nav>, <main>, <header>', 'navigation, main, banner', 'Bereiche, direkt anspringbar'],
  ['<ul>/<ol> + <li>', 'list, listitem', '„Liste mit 5 Einträgen“'],
  ['<label> + <input>', 'textbox mit Namen', 'Klick aufs Label fokussiert das Feld'],
  ['<img alt="…">', 'img', 'alt ist der Text für alle, die das Bild nicht sehen'],
]

export function Barrierefreiheit() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>
          Zwei Knöpfe, die gleich aussehen könnten. Klicke in die Vorschau und versuche es nur mit der Tastatur: Den{' '}
          <Code>{'<div>'}</Code> erreichst du mit Tab gar nicht.
        </P>
        <TryIt id="praxis-a11y-einstieg" {...beispiele['praxis-a11y-einstieg']} modus="react" />
      </Abschnitt>

      <Abschnitt titel="Für wen?">
        <P>
          Barrierefrei heißt: Alle können die App benutzen. Menschen, die einen <strong>Screenreader</strong> nutzen
          (der die Seite vorliest), die nur mit der <strong>Tastatur</strong> arbeiten, die stark vergrößern oder
          Farben schlecht unterscheiden. Dazu kommen alle mit einer vorübergehenden Einschränkung: ein gebrochener Arm,
          grelles Sonnenlicht, ein Baby auf dem Arm.
        </P>
        <Liste>
          <li>
            <strong>Pflicht:</strong> In der EU gilt der European Accessibility Act, in Deutschland umgesetzt als
            Barrierefreiheitsstärkungsgesetz (seit Juni 2025). Viele Online-Shops, Banking-Apps und andere Dienste für
            Verbraucher müssen danach barrierefrei sein.
          </li>
          <li>
            <strong>Besser für alle:</strong> Klare Überschriften, echte Knöpfe und gute Kontraste helfen jedem.
          </li>
          <li>
            <strong>Leichter zu testen:</strong> Testing Library sucht Elemente genau so, wie ein Screenreader sie
            findet (<Verweis id="praxis-testen" />).
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Semantisches HTML zuerst">
        <P>
          Das Wichtigste kostet nichts: das <strong>passende HTML-Element</strong>. Jedes Element hat eine{' '}
          <strong>Rolle</strong>, die Browser und Screenreader kennen - samt Tastaturbedienung. Ein{' '}
          <Code>{'<div onClick>'}</Code> hat keine Rolle, ist nicht fokussierbar und reagiert nicht auf Enter.
        </P>
        <Tabelle
          dicht
          kopf={['Element', 'Rolle', 'Was man geschenkt bekommt']}
          spalten={['align-top', 'align-top']}
          zeilen={elemente.map(([el, rolle, text]) => [<Code key={el}>{el}</Code>, rolle, text])}
        />
        <TryIt id="praxis-a11y-semantik" {...beispiele['praxis-a11y-semantik']} modus="react" />
        <Liste>
          <li>
            <Code>alt</Code> beschreibt, was das Bild zeigt. Ist es reine Dekoration, schreibst du{' '}
            <Code>alt=""</Code> - dann wird es übersprungen. Fehlt <Code>alt</Code> ganz, liest der Screenreader oft
            den Dateinamen vor.
          </li>
          <li>
            Knöpfe nur mit Symbol brauchen einen Namen: <Code>aria-label</Code>. Dekoratives wie die Sterne
            versteckst du mit <Code>aria-hidden</Code> und gibst stattdessen Text, der nur für Screenreader sichtbar
            ist (die Tailwind-Klasse <Code>sr-only</Code>).
          </li>
        </Liste>
        <Hinweis variante="warnung">
          Die erste Regel von ARIA lautet: <strong>kein ARIA, wenn es ein HTML-Element gibt.</strong>{' '}
          <Code>{'<div role="button">'}</Code> ist nur ein Versprechen - Fokus und Tastatur musst du dann selbst
          nachbauen. <Code>{'<button>'}</Code> kann das schon.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Formulare">
        <P>
          Formulare sind die häufigste Stolperstelle. Drei Dinge reichen für die meisten Fälle: ein sichtbares{' '}
          <strong>Label</strong> pro Feld, <strong>Fehler</strong>, die mit dem Feld verknüpft sind, und Fehler, die{' '}
          <strong>angesagt</strong> werden, sobald sie erscheinen. Grundlagen dazu in <Verweis id="praxis-formulare" />.
        </P>
        <TryIt id="praxis-a11y-formular" {...beispiele['praxis-a11y-formular']} modus="react" />
        <Liste>
          <li>
            Ein Platzhalter (<Code>placeholder</Code>) ist kein Label: Er verschwindet beim Tippen und wird nicht
            überall vorgelesen.
          </li>
          <li>
            <Code>aria-describedby</Code> verweist auf die <Code>id</Code> des Fehlertexts - der Screenreader liest ihn
            zusammen mit dem Feld vor. <Code>useId</Code> liefert eindeutige IDs.
          </li>
          <li>
            <Code>autoComplete</Code> (<Code>email</Code>, <Code>name</Code>, <Code>street-address</Code> …) spart
            allen das Tippen.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Tastatur und Fokus">
        <P>
          Alles, was mit der Maus geht, muss auch mit der Tastatur gehen: Tab zum nächsten Element, Enter oder
          Leertaste zum Auslösen, Escape zum Schließen. Und man muss immer <strong>sehen</strong>, wo der Fokus
          gerade ist.
        </P>
        <TryIt id="praxis-a11y-fokus" {...beispiele['praxis-a11y-fokus']} modus="react" />
        <Liste>
          <li>
            Dialoge sind am schwierigsten: Der Fokus muss hinein, darf nicht dahinter verschwinden und muss danach
            zurück. Das native <Code>{'<dialog>'}</Code> mit <Code>showModal()</Code> macht all das von selbst - der
            Zugriff läuft über eine Ref (<Verweis id="hooks-useref" />).
          </li>
          <li>
            Nie <Code>outline: none</Code> ohne Ersatz. In Tailwind:{' '}
            <Code>focus-visible:ring-2</Code> zeigt den Rahmen nur bei Tastaturbedienung.
          </li>
          <li>
            Die Tab-Reihenfolge folgt dem HTML. <Code>tabIndex</Code> größer als 0 macht sie fast immer schlechter.
          </li>
          <li>
            Wechselt in einer Single Page App die Seite (<Verweis id="praxis-routing" />), sollte der Fokus auf die neue
            Hauptüberschrift springen - sonst bleibt er auf dem Link, den man gerade geklickt hat.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Änderungen ansagen">
        <P>
          Sehende merken, wenn sich auf der Seite etwas ändert. Ein Screenreader liest nur vor, wo der Fokus gerade
          ist. Für Meldungen wie „3 Treffer“ oder „Gespeichert“ gibt es <strong>Live-Regionen</strong>: Ändert sich
          ihr Inhalt, wird er vorgelesen.
        </P>
        <TryIt id="praxis-a11y-live" {...beispiele['praxis-a11y-live']} modus="react" />
        <P>
          <Code>aria-live="polite"</Code> und <Code>role="status"</Code> warten, bis der Screenreader fertig ist.{' '}
          <Code>role="alert"</Code> unterbricht sofort - nur für Fehler. Wichtig: Die Region muss schon im DOM sein,
          bevor sich ihr Text ändert.
        </P>
      </Abschnitt>

      <Abschnitt titel="Prüfen">
        <P>
          Ein guter Test ist gleichzeitig ein Test auf Barrierefreiheit: <Code>getByRole</Code> findet nur, was im{' '}
          <strong>Accessibility-Baum</strong> steht - das, was auch ein Screenreader sieht. Tausche im Beispiel{' '}
          <Code>GoodToolbar</Code> gegen <Code>BadToolbar</Code>:
        </P>
        <TryIt id="praxis-a11y-pruefen" {...beispiele['praxis-a11y-pruefen']} modus="test" />
        <Liste>
          <li>
            <strong>Tastatur-Test:</strong> Maus weglegen und einmal alles durchklicken. Findet in fünf Minuten die
            meisten Probleme.
          </li>
          <li>
            <strong>Automatisch:</strong> Lighthouse (in den Chrome DevTools) und die Erweiterung axe DevTools finden
            fehlende Labels, alt-Texte und schwache Kontraste. Linter-Regeln wie <Code>jsx-a11y</Code> (in ESLint und
            oxlint) melden viele Fehler schon im Editor.
          </li>
          <li>
            <strong>Mit Screenreader:</strong> NVDA unter Windows (kostenlos), VoiceOver auf dem Mac und iPhone
            (eingebaut). Einmal ausprobiert, verändert das den Blick auf die eigene App.
          </li>
        </Liste>
        <Hinweis variante="info">
          Automatische Werkzeuge finden nur etwa ein Drittel der Probleme. Ob ein alt-Text sinnvoll ist oder die
          Reihenfolge logisch, prüft nur ein Mensch.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-a11y-uebung"
          {...beispiele['praxis-a11y-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Die Newsletter-Box sieht gut aus, ist aber ohne Maus und Bildschirm kaum zu benutzen. Repariere sie:</p>
              <ul className="mt-1 list-disc pl-5">
                <li>„Newsletter“ wird eine echte Überschrift.</li>
                <li>
                  Das ✕ wird ein <Code>{'<button>'}</Code> mit dem Namen „Close“, „Subscribe“ ebenso ein{' '}
                  <Code>{'<button>'}</Code>.
                </li>
                <li>Das Bild ist Dekoration.</li>
                <li>Das Feld bekommt ein sichtbares Label „E-mail“.</li>
                <li>
                  Die Fehlermeldung wird mit <Code>aria-invalid</Code> und <Code>aria-describedby</Code> mit dem Feld
                  verknüpft.
                </li>
              </ul>
            </>
          }
        />
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Warum ist <div onClick> als Knopf ein Problem?',
            antworten: [
              'Er sieht anders aus',
              'Er ist nicht per Tab erreichbar, reagiert nicht auf Enter und hat keine Rolle',
              'onClick funktioniert auf div nicht',
            ],
            richtig: 1,
            erklaerung: '<button> bringt Fokus, Tastatur und die Rolle „button“ gratis mit.',
          },
          {
            frage: 'Welchen alt-Text bekommt ein rein dekoratives Bild?',
            antworten: ['Gar keinen alt', 'alt=""', 'alt="Bild"'],
            richtig: 1,
            erklaerung: 'Ein leeres alt heißt „überspringen“. Ohne alt wird oft der Dateiname vorgelesen.',
          },
          {
            frage: 'Wie erfährt ein Screenreader von „Gespeichert“, das neben dem Knopf erscheint?',
            antworten: ['Gar nicht', 'Über eine Live-Region wie role="status"', 'Über einen title-Tooltip'],
            richtig: 1,
            erklaerung: 'Live-Regionen lesen Änderungen vor, auch wenn der Fokus woanders ist.',
          },
          {
            frage: 'Was ist die erste Regel von ARIA?',
            antworten: [
              'Jedes Element braucht eine role',
              'Kein ARIA, wenn es ein passendes HTML-Element gibt',
              'aria-label immer zusätzlich zum Text',
            ],
            richtig: 1,
            erklaerung: 'Natives HTML bringt Verhalten mit - ARIA ändert nur, was angesagt wird.',
          },
        ]}
      />

      <Merke
        punkte={[
          'Das passende HTML-Element ist die halbe Miete: button, a, h1-h6, label, nav, main, ul.',
          <>
            Bilder mit <Code>alt</Code> (dekorativ: <Code>alt=""</Code>), Symbol-Knöpfe mit <Code>aria-label</Code>.
          </>,
          <>
            Formulare: Label pro Feld, Fehler per <Code>aria-describedby</Code> verknüpfen und mit{' '}
            <Code>role="alert"</Code> ansagen.
          </>,
          'Alles per Tastatur bedienbar, Fokus immer sichtbar - Dialoge mit <dialog> und showModal().',
          <>
            Prüfen: Tastatur-Test, <Code>getByRole</Code> in Tests, Lighthouse/axe, einmal mit Screenreader.
          </>,
        ]}
      />
    </>
  )
}
