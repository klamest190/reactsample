import { js } from '../../../lernen/quelltext'
import { P12_START, P12_LOESUNG } from './code'
import { t, type SchrittInhalt } from './typen'

/** Step 15: the challenge - the whole app again, without a template. */
export const schritteChallenge: Record<string, SchrittInhalt> = {
  'projekt-15-challenge': {
    modus: 'react',
    einleitung: {
      de: 'Jetzt ohne Vorlage: Baue die ToDo-App **von null** - so, wie du es für richtig hältst. Die Tests prüfen nur, was ein Mensch sieht und tut, nicht wie dein Code aufgebaut ist.\n\nVersuch es zuerst ganz ohne Tipps und ohne in die früheren Schritte zu schauen. Wenn du hängst: Die Tipps verweisen auf die passenden Kapitel. Und wenn alle Tests grün sind, kannst du die App mit [[praxis-lokal]] auf deinen eigenen Rechner holen.',
      en: 'Now without a template: build the todo app **from scratch** - however you think is right. The tests only check what a person sees and does, not how your code is structured.\n\nTry it first without any hints and without looking at the earlier steps. If you get stuck, the hints point to the relevant chapters. And once all tests are green, [[praxis-lokal]] shows you how to move the app to your own computer.',
    },
    anforderungen: {
      de: [
        'Anfangs leer, Anzeige „0 open“',
        'Eingabefeld (placeholder „What needs to be done?“) und Knopf „Add“: fügt ein Todo hinzu, ignoriert leere Eingaben, leert danach das Feld',
        'Jedes Todo ist ein `<li>` mit Checkbox, Text und ✕-Knopf; erledigte haben die Klasse `done`',
        'Filter „All“, „Open“, „Done“ mit `aria-pressed`',
        '„n open“ und ein Knopf „Clear done“',
        'Die Todos werden im `localStorage` unter `todos` gespeichert und beim Start geladen',
      ],
      en: [
        'Empty at first, showing “0 open”',
        'An input (placeholder “What needs to be done?”) and an “Add” button: adds a todo, ignores empty input, then clears the input',
        'Every todo is an `<li>` with a checkbox, the text and a ✕ button; completed ones have the class `done`',
        'Filters “All”, “Open”, “Done” with `aria-pressed`',
        '“n open” and a “Clear done” button',
        'The todos are saved in `localStorage` under `todos` and loaded on start',
      ],
    },
    start: P12_START,
    loesung: P12_LOESUNG,
    tipps: {
      de: [
        'Fang mit den Daten an: Welcher State ist nötig? (Todos, Eingabetext, Filter) - [[react-datenfluss]]',
        'Erst hinzufügen und anzeigen, dann umschalten und löschen, dann Filter - nach jedem Teil ausführen.',
        'Viele Änderungen an einem Array? Ein Reducer hält das übersichtlich - [[hooks-usereducer]]',
        'Speichern: Lazy Initializer zum Lesen, `useEffect` zum Schreiben - [[hooks-useeffect]]',
      ],
      en: [
        'Start with the data: which state is needed? (todos, input text, filter) - [[react-datenfluss]]',
        'First add and display, then toggle and delete, then filters - run after each part.',
        'Many changes to one array? A reducer keeps it manageable - [[hooks-usereducer]]',
        'Saving: a lazy initializer for reading, `useEffect` for writing - [[hooks-useeffect]]',
      ],
    },
    tests: [
      { name: t('Anfangs leer mit „0 open“', 'Empty at first with “0 open”'), pruefung: js`
        await render()
        expect(findAll('li')).toHaveLength(0)
        expect(text()).toContain('0 open')
      ` },
      { name: t('Hinzufügen: getrimmt, leer ignoriert, Feld geleert', 'Adding: trimmed, empty ignored, input cleared'), pruefung: js`
        await render()
        await type(field('What needs to be done?'), '  First  ')
        await click(button('Add'))
        await type(field('What needs to be done?'), '   ')
        await click(button('Add'))
        await type(field('What needs to be done?'), 'Second')
        await click(button('Add'))
        expect(findAll('li')).toHaveLength(2)
        expect(findAll('li')[0].textContent).toContain('First')
        expect(field('What needs to be done?').value).toBe('')
        expect(text()).toContain('2 open')
      ` },
      { name: t('Umschalten und Löschen', 'Toggling and deleting'), pruefung: js`
        await render()
        for (const todo of ['A', 'B', 'C']) {
          await type(field('What needs to be done?'), todo)
          await click(button('Add'))
        }
        await click(findAll('li input[type="checkbox"]')[0])
        expect(findAll('li.done')).toHaveLength(1)
        expect(text()).toContain('2 open')
        await click(within(findAll('li')[2]).button(/✕|delete|remove/i))
        expect(findAll('li')).toHaveLength(2)
      ` },
      { name: t('Filter mit aria-pressed', 'Filters with aria-pressed'), pruefung: js`
        await render()
        for (const todo of ['A', 'B']) {
          await type(field('What needs to be done?'), todo)
          await click(button('Add'))
        }
        await click(findAll('li input[type="checkbox"]')[0])
        await click(button('Open'))
        expect(findAll('li')).toHaveLength(1)
        expect(button('Open').getAttribute('aria-pressed')).toBe('true')
        await click(button('Done'))
        expect(findAll('li')).toHaveLength(1)
        expect(findAll('li')[0].textContent).toContain('A')
        await click(button('All'))
        expect(findAll('li')).toHaveLength(2)
      ` },
      { name: t('„Clear done“ entfernt erledigte', '“Clear done” removes completed ones'), pruefung: js`
        await render()
        for (const todo of ['A', 'B']) {
          await type(field('What needs to be done?'), todo)
          await click(button('Add'))
        }
        await click(findAll('li input[type="checkbox"]')[1])
        await click(button('Clear done'))
        expect(findAll('li')).toHaveLength(1)
        expect(findAll('li')[0].textContent).toContain('A')
      ` },
      {
        name: t('Speichern im localStorage', 'Saving in localStorage'),
        pruefung: js`
          await render()
          await type(field('What needs to be done?'), 'Still here')
          await click(button('Add'))
          await waitFor(() => expect(localStorage.getItem('todos') ?? '').toContain('Still here'))
          await remount()
          expect(text()).toContain('Still here')
        `,
      },
    ],
  },
}
