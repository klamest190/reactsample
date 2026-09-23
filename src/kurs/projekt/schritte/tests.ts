import { js } from '../../../lernen/quelltext'
import { t } from './typen'
import type { ReactTest } from '../../../lernen/jsSandbox'

/** Tests that several steps share - the app's conventions do not change from step to step. */

export const TEST_HINZUFUEGEN: ReactTest = {
  name: t('Neues Todo über das Formular hinzufügen', 'Add a new todo via the form'),
  pruefung: js`
    await render()
    const before = findAll('li').length
    await type(field('What needs to be done?'), '  Walk the dog  ')
    await click(button('Add'))
    expect(findAll('li')).toHaveLength(before + 1)
    expect(text()).toContain('Walk the dog')
    expect(field('What needs to be done?').value).toBe('')
  `,
}

export const TEST_LEER: ReactTest = {
  name: t('Leere Eingaben werden ignoriert', 'Empty input is ignored'),
  pruefung: js`
    await render()
    const before = findAll('li').length
    await type(field('What needs to be done?'), '   ')
    await click(button('Add'))
    expect(findAll('li')).toHaveLength(before)
  `,
}

export const TEST_UMSCHALTEN: ReactTest = {
  name: t('Checkbox schaltet „done“ um und aktualisiert die Anzahl', 'Checkbox toggles “done” and updates the count'),
  pruefung: js`
    await render()
    await click(findAll('li input[type="checkbox"]')[1])
    expect(findAll('li.done')).toHaveLength(2)
    expect(text()).toContain('1 open')
  `,
}

export const TEST_LOESCHEN: ReactTest = {
  name: t('✕ löscht das Todo', '✕ deletes the todo'),
  pruefung: js`
    await render()
    await click(within(findAll('li')[0]).button(/✕|delete|remove/i))
    expect(findAll('li')).toHaveLength(2)
    expect(text()).not.toContain('Learn JavaScript')
  `,
}

export const TEST_FILTER: ReactTest = {
  name: t('Filter All / Open / Done zeigen die passenden Todos', 'Filters All / Open / Done show the matching todos'),
  pruefung: js`
    await render()
    await click(button('Open'))
    expect(findAll('li')).toHaveLength(2)
    await click(button('Done'))
    expect(findAll('li')).toHaveLength(1)
    await click(button('All'))
    expect(findAll('li')).toHaveLength(3)
  `,
}

export const TEST_ARIA_PRESSED: ReactTest = {
  name: t('Der aktive Filter hat aria-pressed="true"', 'The active filter has aria-pressed="true"'),
  pruefung: js`
    await render()
    expect(button('All').getAttribute('aria-pressed')).toBe('true')
    await click(button('Done'))
    expect(button('Done').getAttribute('aria-pressed')).toBe('true')
    expect(button('All').getAttribute('aria-pressed')).toBe('false')
  `,
}

export const TEST_CLEAR_DONE: ReactTest = {
  name: t('„Clear done“ entfernt erledigte Todos', '“Clear done” removes completed todos'),
  pruefung: js`
    await render()
    await click(button('Clear done'))
    expect(findAll('li')).toHaveLength(2)
    expect(text()).not.toContain('Learn JavaScript')
  `,
}

export const TEST_SPEICHERN: ReactTest = {
  name: t('Todos überleben ein Neuladen (localStorage "todos")', 'Todos survive a reload (localStorage "todos")'),
  pruefung: js`
    await render()
    await type(field('What needs to be done?'), 'Still here')
    await click(button('Add'))
    await waitFor(() => expect(localStorage.getItem('todos') ?? '').toContain('Still here'))
    await remount()
    expect(text()).toContain('Still here')
  `,
}

/** Grundfunktionen einmal komplett durchspielen - für Schritte, die umbauen statt erweitern. */
export const TEST_ALLES_GEHT_NOCH: ReactTest = {
  name: t('Hinzufügen, Umschalten, Löschen und Filtern funktionieren weiter', 'Adding, toggling, deleting and filtering still work'),
  pruefung: js`
    await render()
    await type(field('What needs to be done?'), 'Refactor')
    await click(button('Add'))
    expect(findAll('li')).toHaveLength(4)
    await click(findAll('li input[type="checkbox"]')[1])
    expect(text()).toContain('2 open')
    await click(within(findAll('li')[0]).button(/✕|delete|remove/i))
    expect(findAll('li')).toHaveLength(3)
    await click(button('Done'))
    expect(findAll('li')).toHaveLength(1)
  `,
}
