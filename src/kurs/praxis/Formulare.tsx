import { Abschnitt, Code, Hinweis, Liste, Merke, P } from '../../components/Ui'
import { Verweis } from '../../components/Verweis'
import { Quiz } from '../../lernen/Quiz'
import { TryIt } from '../../lernen/TryIt'
import { beispiele } from './Formulare.code'
import { Kontaktformular } from '../demos/Kontaktformular'

/**
 * KAPITEL 4.1 - Formulare
 */
export function Formulare() {
  return (
    <>
      <Abschnitt titel="Auf einen Blick">
        <P>Ein kontrolliertes Eingabefeld: Der Wert steht im State, das Absenden läuft über <Code>onSubmit</Code>.</P>
        <TryIt
          id="praxis-formulare-einstieg"
          {...beispiele['praxis-formulare-einstieg']}
          modus="react"
        />
      </Abschnitt>

      <Abschnitt titel="Controlled vs. uncontrolled">
        <P>Es gibt zwei Arten, Formularfelder in React zu verwalten:</P>
        <Liste>
          <li>
            <strong>Controlled</strong>: Der Wert liegt im State, das Feld zeigt ihn an (
            <Code>value</Code>) und meldet Änderungen (<Code>onChange</Code>). Du hast jederzeit
            Zugriff - ideal für Live-Validierung, abhängige Felder, Formatierung beim Tippen.
          </li>
          <li>
            <strong>Uncontrolled</strong>: Das DOM hält den Wert. Du liest ihn erst beim Absenden,
            z. B. über <Code>FormData</Code> oder eine Ref. Weniger Code, gut für einfache Formulare -
            und die Grundlage der Form-Actions aus <Verweis nr="3.9" />.
          </li>
        </Liste>
        <TryIt
          id="praxis-formulare-arten"
          {...beispiele['praxis-formulare-arten']}
          modus="react"
        />
        <Hinweis variante="warnung">
          Ein Feld sollte sein Leben lang entweder controlled <em>oder</em> uncontrolled sein. Wechselt{' '}
          <Code>value</Code> von <Code>undefined</Code> zu einem String, warnt React. Deshalb Startwerte
          wie <Code>''</Code> statt <Code>undefined</Code>.
        </Hinweis>
      </Abschnitt>

      <Abschnitt titel="Viele Felder, ein Handler">
        <P>
          Statt für jedes Feld eigenen State und Handler anzulegen, hältst du ein Objekt und nutzt das{' '}
          <Code>name</Code>-Attribut als Schlüssel. Checkboxen liefern <Code>checked</Code> statt{' '}
          <Code>value</Code>. Die Validierung wird bei jedem Render aus den Werten{' '}
          <strong>berechnet</strong> - kein zusätzlicher Fehler-State, der veralten könnte.
        </P>
        <Kontaktformular />
        <Liste>
          <li>
            <Code>useId()</Code> erzeugt eindeutige IDs für <Code>htmlFor</Code>/<Code>id</Code> - auch
            wenn das Formular mehrfach auf der Seite steht. Nie <Code>Math.random()</Code>.
          </li>
          <li>
            <Code>onSubmit</Code> am <Code>{'<form>'}</Code> statt <Code>onClick</Code> am Knopf - so
            funktioniert auch die Enter-Taste.
          </li>
          <li>Fehler erst zeigen, wenn das Feld verlassen wurde („touched“) - sonst meckert das Formular sofort.</li>
          <li>
            <Code>aria-invalid</Code> und echte <Code>{'<label>'}</Code> machen das Formular barrierefrei.
          </li>
        </Liste>
      </Abschnitt>

      <Abschnitt titel="Übung">
        <TryIt
          id="praxis-formulare-uebung"
          {...beispiele['praxis-formulare-uebung']}
          modus="react"
          aufgabe={
            <>
              <p>Baue ein Registrierungsformular (controlled, ein State-Objekt, ein Handler):</p>
              <ul className="mt-1 list-disc pl-5">
                <li>Felder mit den <Code>name</Code>-Attributen <Code>username</Code>, <Code>password</Code>, <Code>repeat</Code> und die Checkbox <Code>terms</Code> („Accept terms“).</li>
                <li>
                  Regeln: Benutzername ≥ 3 Zeichen, Passwort ≥ 8 Zeichen <em>und</em> mindestens eine
                  Ziffer, Passwörter gleich, AGB angehakt.
                </li>
                <li>Unter jedem Feld die Fehlermeldung - erst nachdem das Feld verlassen wurde.</li>
                <li>Der Knopf „Sign up“ ist nur aktiv, wenn alles gültig ist. Danach „Welcome, <em>username</em>!“ anzeigen.</li>
                <li>
                  Labels mit <Code>useId</Code> verknüpfen.
                </li>
              </ul>
            </>
          }
        />
        <Hinweis variante="tipp">
          Für große Formulare nimmt man meist eine Bibliothek wie <strong>React Hook Form</strong> mit{' '}
          <strong>Zod</strong> für die Validierung. Das Prinzip ist dasselbe - sie spart nur das
          Verdrahten von <Code>value</Code>, <Code>onChange</Code> und Fehlern.
        </Hinweis>
      </Abschnitt>

      <Quiz
        fragen={[
          {
            frage: 'Was macht ein Feld zu einem „controlled“ Feld?',
            antworten: ['Ein name-Attribut', 'value aus dem State plus onChange', 'Ein <form> drumherum'],
            richtig: 1,
            erklaerung: 'React bestimmt dann den angezeigten Wert.',
          },
          {
            frage: 'Wo sollten Validierungsfehler herkommen?',
            antworten: [
              'Aus einem eigenen useState, der in onChange gesetzt wird',
              'Beim Rendern aus den aktuellen Werten berechnet',
            ],
            richtig: 1,
            erklaerung: 'Abgeleitet statt gespeichert - eine Quelle der Wahrheit.',
          },
          {
            frage: 'Wofür ist useId gedacht?',
            antworten: ['Für keys in Listen', 'Für eindeutige id-Attribute, z. B. Label ↔ Input', 'Für Datenbank-IDs'],
            richtig: 1,
            erklaerung: 'Für Listen-keys nimmt man die IDs der Daten, nicht useId.',
          },
        ]}
      />

      <Merke
        punkte={[
          <>
            Controlled: <Code>value</Code> + <Code>onChange</Code>. Uncontrolled:{' '}
            <Code>defaultValue</Code> + <Code>FormData</Code> beim Absenden.
          </>,
          <>
            Ein State-Objekt, ein Handler mit <Code>[e.target.name]</Code>.
          </>,
          'Validierung als reine Funktion, beim Rendern berechnet.',
          <>
            <Code>onSubmit</Code> + <Code>preventDefault</Code>, Labels per <Code>useId</Code>.
          </>,
        ]}
      />
    </>
  )
}
