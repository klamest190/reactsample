/**
 * The course is data - these tests keep it consistent: unique ids (they are keys in the URL and in
 * localStorage), links that resolve, and every chapter in both languages.
 */
import { describe, expect, it } from 'vitest'

import { alleKapitel } from './course'
import { glossar } from './glossary'
import type { UebungsSammlung } from './exercises/types'

const chapterSourcesDe = import.meta.glob<string>(['./**/*.tsx', '!./**/*.en.tsx', '!./demos/**', '!./practice/businessApp/**', '!./project/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})
const chapterSourcesEn = import.meta.glob<string>('./**/*.en.tsx', { query: '?raw', import: 'default', eager: true })
const exerciseModules = import.meta.glob<{ uebungen: UebungsSammlung }>('./exercises/{js,ts,react,hooks,practice,java,backend,sql}.ts', { eager: true })

const chapterIds = new Set(alleKapitel.map((k) => k.id))
const duplicates = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i)
const matches = (text: string, pattern: RegExp) => [...text.matchAll(pattern)].map((m) => m[1])

const exercises = Object.values(exerciseModules).flatMap((m) => Object.values(m.uebungen).flat())
const tryItIdsDe = Object.values(chapterSourcesDe).flatMap((source) => matches(source, /<TryIt[^>]*?\bid="([^"]+)"/g))

describe('chapters', () => {
  it('have unique ids', () => {
    expect(chapterIds.size).toBeGreaterThan(50)
    expect(duplicates(alleKapitel.map((k) => k.id))).toEqual([])
  })

  it('only build on chapters that exist', () => {
    const missing = alleKapitel.flatMap((k) => k.grundlagen.filter((id) => !chapterIds.has(id)).map((id) => `${k.id} → ${id}`))
    expect(missing).toEqual([])
  })

  it('have a title, summary and learning goals in both languages', () => {
    for (const k of alleKapitel) {
      for (const language of ['de', 'en'] as const) {
        expect(k.titel[language], `${k.id} title ${language}`).toBeTruthy()
        expect(k.kurz[language], `${k.id} summary ${language}`).toBeTruthy()
        expect(k.lernziele[language].length, `${k.id} goals ${language}`).toBeGreaterThan(0)
        expect(k.Komponente[language], `${k.id} component ${language}`).toBeTruthy()
      }
    }
  })

  it('have an English text file for every German one', () => {
    const english = new Set(Object.keys(chapterSourcesEn).map((path) => path.replace('.en.tsx', '.tsx')))
    const missing = Object.keys(chapterSourcesDe).filter((path) => !english.has(path))
    expect(missing).toEqual([])
  })

  it('use the same TryIt ids in German and English', () => {
    const tryItIdsEn = Object.values(chapterSourcesEn).flatMap((source) => matches(source, /<TryIt[^>]*?\bid="([^"]+)"/g))
    expect([...tryItIdsEn].sort()).toEqual([...tryItIdsDe].sort())
  })
})

describe('ids used as storage keys', () => {
  it('TryIt ids are unique across the course', () => {
    expect(tryItIdsDe.length).toBeGreaterThan(100)
    expect(duplicates(tryItIdsDe)).toEqual([])
  })

  it('exercise ids are unique and do not collide with TryIt ids', () => {
    const ids = exercises.map((u) => u.id)
    expect(duplicates(ids)).toEqual([])
    // An extra exercise runs in an editor with the id "uebung-<id>" (learning/Exercises.tsx), so it may
    // share its name with the chapter example it practises - the storage keys stay apart.
    expect(ids.map((id) => 'uebung-' + id).filter((id) => tryItIdsDe.includes(id))).toEqual([])
  })
})

describe('links', () => {
  it('<Verweis id> and [[id]] in chapter texts point to existing chapters', () => {
    const broken = Object.entries({ ...chapterSourcesDe, ...chapterSourcesEn }).flatMap(([path, source]) =>
      [...matches(source, /<Verweis[^>]*?\bid="([^"]+)"/g), ...matches(source, /\[\[([\w-]+)\]\]/g)]
        .filter((id) => !chapterIds.has(id))
        .map((id) => `${path}: ${id}`),
    )
    expect(broken).toEqual([])
  })

  it('[[id]] in exercises and the glossary point to existing chapters', () => {
    const texts = [...exercises.map((u) => JSON.stringify(u)), ...glossar.map((g) => JSON.stringify(g.erklaerung))]
    const broken = texts.flatMap((text) => matches(text, /\[\[([\w-]+)\]\]/g)).filter((id) => !chapterIds.has(id))
    expect(broken).toEqual([])
  })

  it('exercises that repeat a chapter name an existing one', () => {
    const broken = exercises.filter((u) => u.wiederholung && !chapterIds.has(u.wiederholung)).map((u) => u.id)
    expect(broken).toEqual([])
  })
})

describe('glossary', () => {
  it('has unique ids and links to existing chapters', () => {
    expect(duplicates(glossar.map((g) => g.id))).toEqual([])
    const broken = glossar.flatMap((g) => g.kapitel.filter((id) => !chapterIds.has(id)).map((id) => `${g.id} → ${id}`))
    expect(broken).toEqual([])
  })

  it('explains every term in both languages', () => {
    const missing = glossar.filter((g) => !g.erklaerung.de || !g.erklaerung.en).map((g) => g.id)
    expect(missing).toEqual([])
  })
})
