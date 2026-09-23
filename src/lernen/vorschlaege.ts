import type { Sprache, Zweisprachig } from '../i18n/SpracheContext'
import { COMPOSE, DOCKERFILE, SPRING } from './backendSuggestions'
import type { EditorSprache } from './modi'
import { SQL } from './sqlSuggestions'

/**
 * Die Vorschläge für die Autovervollständigung im Editor.
 *
 * - `label`     wird angezeigt und mit dem getippten Wort verglichen
 * - `einfuegen` ersetzt das getippte Wort; `$0` markiert, wo danach der Cursor steht
 * - `info`      kurze Erklärung - der Editor ist schließlich zum Lernen da
 *
 * Label und Einfügetext sind Code und deshalb - wie alle Codebeispiele im Kurs -
 * immer Englisch. Nur die Erklärung `info` gibt es in beiden Sprachen.
 *
 * Einträge, deren Label mit "." beginnt, sind Methoden/Eigenschaften und
 * erscheinen nach einem Punkt hinter beliebigen Werten (z. B. list.ma → map).
 * Die Reihenfolge in den Listen ist die Rangfolge bei gleich guten Treffern.
 */

export type VorschlagArt = 'funktion' | 'hook' | 'snippet' | 'keyword' | 'methode' | 'jsx' | 'variable' | 'tailwind'

/** Ein Vorschlag, aufgelöst für eine Sprache. */
export type Vorschlag = {
  label: string
  einfuegen?: string
  art: VorschlagArt
  info: string
  /** Tailwind: das CSS, das die Klasse erzeugt (siehe tailwindMotor.ts). */
  css?: string
  /** Tailwind: Farbe für das Farbfeld in der Liste, z. B. oklch(…). */
  farbe?: string
}

export type Eintrag = {
  label: string
  einfuegen?: string
  art: VorschlagArt
  info: Zweisprachig
}

const JAVASCRIPT: Eintrag[] = [
  // --- Konsole -------------------------------------------------------------
  { label: 'console.log', einfuegen: 'console.log($0)', art: 'funktion', info: { de: 'Gibt Werte in der Konsole aus.', en: 'Prints values to the console.' } },
  { label: 'console.error', einfuegen: 'console.error($0)', art: 'funktion', info: { de: 'Gibt eine Fehlermeldung (rot) aus.', en: 'Prints an error message (red).' } },
  { label: 'console.warn', einfuegen: 'console.warn($0)', art: 'funktion', info: { de: 'Gibt eine Warnung (gelb) aus.', en: 'Prints a warning (yellow).' } },
  { label: 'console.table', einfuegen: 'console.table($0)', art: 'funktion', info: { de: 'Gibt Arrays/Objekte aus.', en: 'Prints arrays/objects.' } },
  { label: 'console.time', einfuegen: "console.time('$0')", art: 'funktion', info: { de: 'Startet eine Zeitmessung mit Namen.', en: 'Starts a named timer.' } },
  { label: 'console.timeEnd', einfuegen: "console.timeEnd('$0')", art: 'funktion', info: { de: 'Beendet die Zeitmessung und gibt die Dauer aus.', en: 'Stops the timer and prints the duration.' } },

  // --- Schlüsselwörter & Grundgerüste ---------------------------------------
  { label: 'const', einfuegen: 'const $0 = ', art: 'keyword', info: { de: 'Variable, die nicht neu zugewiesen wird (Standard).', en: 'Variable that is never reassigned (the default).' } },
  { label: 'let', einfuegen: 'let $0 = ', art: 'keyword', info: { de: 'Variable, die neu zugewiesen werden darf.', en: 'Variable that may be reassigned.' } },
  { label: 'function', einfuegen: 'function $0() {\n  \n}', art: 'snippet', info: { de: 'Funktionsdeklaration.', en: 'Function declaration.' } },
  { label: 'arrowfunction', einfuegen: '($0) => {\n  \n}', art: 'snippet', info: { de: 'Arrow Function: (parameter) => { … }', en: 'Arrow function: (parameters) => { … }' } },
  { label: 'return', einfuegen: 'return $0', art: 'keyword', info: { de: 'Beendet die Funktion und gibt einen Wert zurück.', en: 'Ends the function and returns a value.' } },
  { label: 'if', einfuegen: 'if ($0) {\n  \n}', art: 'snippet', info: { de: 'Code nur ausführen, wenn die Bedingung truthy ist.', en: 'Run code only if the condition is truthy.' } },
  { label: 'ifelse', einfuegen: 'if ($0) {\n  \n} else {\n  \n}', art: 'snippet', info: { de: 'if mit else-Zweig.', en: 'if with an else branch.' } },
  { label: 'else', einfuegen: 'else {\n  $0\n}', art: 'keyword', info: { de: 'Alternativer Zweig zu if.', en: 'Alternative branch for if.' } },
  { label: 'switch', einfuegen: "switch ($0) {\n  case '':\n    break\n  default:\n}", art: 'snippet', info: { de: 'Einen Wert mit mehreren festen Fällen vergleichen.', en: 'Compare one value against several fixed cases.' } },
  { label: 'forof', einfuegen: 'for (const item of $0) {\n  \n}', art: 'snippet', info: { de: 'Schleife über alle Elemente einer Liste.', en: 'Loop over every element of a list.' } },
  { label: 'for', einfuegen: 'for (let i = 0; i < $0; i++) {\n  \n}', art: 'snippet', info: { de: 'Zählschleife.', en: 'Counting loop.' } },
  { label: 'while', einfuegen: 'while ($0) {\n  \n}', art: 'snippet', info: { de: 'Wiederholen, solange die Bedingung gilt.', en: 'Repeat while the condition holds.' } },
  { label: 'trycatch', einfuegen: 'try {\n  $0\n} catch (error) {\n  console.error(error)\n}', art: 'snippet', info: { de: 'Fehler abfangen.', en: 'Catch errors.' } },
  { label: 'async function', einfuegen: 'async function $0() {\n  \n}', art: 'snippet', info: { de: 'Funktion, in der await erlaubt ist. Gibt ein Promise zurück.', en: 'Function where await is allowed. Returns a promise.' } },
  { label: 'await', einfuegen: 'await $0', art: 'keyword', info: { de: 'Wartet auf das Ergebnis eines Promises.', en: 'Waits for the result of a promise.' } },
  { label: 'typeof', einfuegen: 'typeof $0', art: 'keyword', info: { de: 'Liefert den Typ eines Werts als String.', en: 'Returns the type of a value as a string.' } },
  { label: 'new', einfuegen: 'new $0', art: 'keyword', info: { de: 'Erzeugt ein Objekt aus einer Klasse/Konstruktorfunktion.', en: 'Creates an object from a class/constructor.' } },
  { label: 'export', einfuegen: 'export ', art: 'keyword', info: { de: 'Macht etwas für andere Module verfügbar.', en: 'Makes something available to other modules.' } },
  { label: 'import', einfuegen: "import { $0 } from ''", art: 'keyword', info: { de: 'Holt Exporte aus einem anderen Modul.', en: 'Imports exports from another module.' } },
  { label: 'true', art: 'keyword', info: { de: 'Boolean: wahr.', en: 'Boolean: true.' } },
  { label: 'false', art: 'keyword', info: { de: 'Boolean: falsch.', en: 'Boolean: false.' } },
  { label: 'null', art: 'keyword', info: { de: '„Absichtlich kein Wert“.', en: '“Intentionally no value”.' } },
  { label: 'undefined', art: 'keyword', info: { de: '„Noch kein Wert zugewiesen“.', en: '“No value assigned yet”.' } },

  // --- Eingebaute Funktionen & Objekte --------------------------------------
  { label: 'setTimeout', einfuegen: 'setTimeout(() => {\n  $0\n}, 1000)', art: 'funktion', info: { de: 'Führt eine Funktion einmal nach x Millisekunden aus.', en: 'Runs a function once after x milliseconds.' } },
  { label: 'setInterval', einfuegen: 'setInterval(() => {\n  $0\n}, 1000)', art: 'funktion', info: { de: 'Führt eine Funktion alle x Millisekunden aus. Gibt eine ID zurück.', en: 'Runs a function every x milliseconds. Returns an ID.' } },
  { label: 'clearTimeout', einfuegen: 'clearTimeout($0)', art: 'funktion', info: { de: 'Bricht einen setTimeout über seine ID ab.', en: 'Cancels a setTimeout by its ID.' } },
  { label: 'clearInterval', einfuegen: 'clearInterval($0)', art: 'funktion', info: { de: 'Stoppt ein setInterval über seine ID.', en: 'Stops a setInterval by its ID.' } },
  { label: 'fetch', einfuegen: "fetch('$0')", art: 'funktion', info: { de: 'HTTP-Anfrage. Gibt ein Promise mit der Response zurück.', en: 'HTTP request. Returns a promise with the response.' } },
  { label: 'Promise', einfuegen: 'new Promise((resolve, reject) => {\n  $0\n})', art: 'snippet', info: { de: 'Eigenes Promise erzeugen.', en: 'Create your own promise.' } },
  { label: 'Promise.all', einfuegen: 'Promise.all([$0])', art: 'funktion', info: { de: 'Wartet auf mehrere Promises parallel.', en: 'Waits for several promises in parallel.' } },
  { label: 'JSON.stringify', einfuegen: 'JSON.stringify($0)', art: 'funktion', info: { de: 'Wandelt einen Wert in einen JSON-String um.', en: 'Converts a value into a JSON string.' } },
  { label: 'JSON.parse', einfuegen: 'JSON.parse($0)', art: 'funktion', info: { de: 'Wandelt einen JSON-String in einen Wert um.', en: 'Converts a JSON string into a value.' } },
  { label: 'Object.keys', einfuegen: 'Object.keys($0)', art: 'funktion', info: { de: 'Array aller Schlüssel eines Objekts.', en: 'Array of all keys of an object.' } },
  { label: 'Object.values', einfuegen: 'Object.values($0)', art: 'funktion', info: { de: 'Array aller Werte eines Objekts.', en: 'Array of all values of an object.' } },
  { label: 'Object.entries', einfuegen: 'Object.entries($0)', art: 'funktion', info: { de: 'Array aus [schlüssel, wert]-Paaren.', en: 'Array of [key, value] pairs.' } },
  { label: 'Array.isArray', einfuegen: 'Array.isArray($0)', art: 'funktion', info: { de: 'Prüft, ob ein Wert ein Array ist.', en: 'Checks whether a value is an array.' } },
  { label: 'Array.from', einfuegen: 'Array.from({ length: $0 }, (_, i) => i)', art: 'funktion', info: { de: 'Erzeugt ein Array, z. B. mit n Einträgen.', en: 'Creates an array, e.g. with n entries.' } },
  { label: 'Math.random', einfuegen: 'Math.random()', art: 'funktion', info: { de: 'Zufallszahl zwischen 0 und 1.', en: 'Random number between 0 and 1.' } },
  { label: 'Math.round', einfuegen: 'Math.round($0)', art: 'funktion', info: { de: 'Rundet kaufmännisch.', en: 'Rounds to the nearest integer.' } },
  { label: 'Math.floor', einfuegen: 'Math.floor($0)', art: 'funktion', info: { de: 'Rundet ab.', en: 'Rounds down.' } },
  { label: 'Math.max', einfuegen: 'Math.max($0)', art: 'funktion', info: { de: 'Größte von mehreren Zahlen.', en: 'Largest of several numbers.' } },
  { label: 'Math.min', einfuegen: 'Math.min($0)', art: 'funktion', info: { de: 'Kleinste von mehreren Zahlen.', en: 'Smallest of several numbers.' } },
  { label: 'Number', einfuegen: 'Number($0)', art: 'funktion', info: { de: 'Wandelt einen Wert in eine Zahl um.', en: 'Converts a value into a number.' } },
  { label: 'String', einfuegen: 'String($0)', art: 'funktion', info: { de: 'Wandelt einen Wert in einen String um.', en: 'Converts a value into a string.' } },
  { label: 'Boolean', einfuegen: 'Boolean($0)', art: 'funktion', info: { de: 'Zeigt, ob ein Wert truthy oder falsy ist.', en: 'Shows whether a value is truthy or falsy.' } },
  { label: 'structuredClone', einfuegen: 'structuredClone($0)', art: 'funktion', info: { de: 'Tiefe Kopie eines Werts.', en: 'Deep copy of a value.' } },
  { label: 'document.querySelector', einfuegen: "document.querySelector('$0')", art: 'funktion', info: { de: 'Erstes Element zum CSS-Selektor.', en: 'First element matching a CSS selector.' } },
  { label: 'document.createElement', einfuegen: "document.createElement('$0')", art: 'funktion', info: { de: 'Erzeugt ein neues DOM-Element.', en: 'Creates a new DOM element.' } },

  // --- Methoden & Eigenschaften (nach einem Punkt) ---------------------------
  { label: '.map', einfuegen: 'map((item) => $0)', art: 'methode', info: { de: 'Array: jedes Element umwandeln → neues Array.', en: 'Array: transform every element → new array.' } },
  { label: '.filter', einfuegen: 'filter((item) => $0)', art: 'methode', info: { de: 'Array: nur passende Elemente behalten → neues Array.', en: 'Array: keep only matching elements → new array.' } },
  { label: '.reduce', einfuegen: 'reduce((sum, item) => $0, 0)', art: 'methode', info: { de: 'Array: zu einem Wert zusammenfassen.', en: 'Array: combine into a single value.' } },
  { label: '.find', einfuegen: 'find((item) => $0)', art: 'methode', info: { de: 'Array: erstes passendes Element (oder undefined).', en: 'Array: first matching element (or undefined).' } },
  { label: '.findIndex', einfuegen: 'findIndex((item) => $0)', art: 'methode', info: { de: 'Array: Position des ersten Treffers (oder -1).', en: 'Array: index of the first match (or -1).' } },
  { label: '.some', einfuegen: 'some((item) => $0)', art: 'methode', info: { de: 'Array: passt mindestens ein Element?', en: 'Array: does at least one element match?' } },
  { label: '.every', einfuegen: 'every((item) => $0)', art: 'methode', info: { de: 'Array: passen alle Elemente?', en: 'Array: do all elements match?' } },
  { label: '.forEach', einfuegen: 'forEach((item) => {\n  $0\n})', art: 'methode', info: { de: 'Array: für jedes Element etwas tun (kein Rückgabewert).', en: 'Array: do something for each element (no return value).' } },
  { label: '.includes', einfuegen: 'includes($0)', art: 'methode', info: { de: 'Array/String: enthält den Wert?', en: 'Array/string: contains the value?' } },
  { label: '.length', art: 'methode', info: { de: 'Array/String: Anzahl Elemente bzw. Zeichen.', en: 'Array/string: number of elements or characters.' } },
  { label: '.join', einfuegen: "join('$0')", art: 'methode', info: { de: 'Array: Elemente zu einem String verbinden.', en: 'Array: join elements into a string.' } },
  { label: '.slice', einfuegen: 'slice($0)', art: 'methode', info: { de: 'Array/String: Ausschnitt als Kopie.', en: 'Array/string: a section as a copy.' } },
  { label: '.toSorted', einfuegen: 'toSorted((a, b) => $0)', art: 'methode', info: { de: 'Array: sortierte Kopie (Original bleibt).', en: 'Array: sorted copy (original stays unchanged).' } },
  { label: '.at', einfuegen: 'at($0)', art: 'methode', info: { de: 'Array: Element an Position, at(-1) = letztes.', en: 'Array: element at index, at(-1) = last.' } },
  { label: '.push', einfuegen: 'push($0)', art: 'methode', info: { de: 'Array: hängt an - verändert das Original! In React: [...alt, x].', en: 'Array: appends - mutates the original! In React: [...prev, x].' } },
  { label: '.sort', einfuegen: 'sort((a, b) => $0)', art: 'methode', info: { de: 'Array: sortiert das Original! In React lieber toSorted.', en: 'Array: sorts the original! In React prefer toSorted.' } },
  { label: '.toUpperCase', einfuegen: 'toUpperCase()', art: 'methode', info: { de: 'String: in Großbuchstaben.', en: 'String: to upper case.' } },
  { label: '.toLowerCase', einfuegen: 'toLowerCase()', art: 'methode', info: { de: 'String: in Kleinbuchstaben.', en: 'String: to lower case.' } },
  { label: '.trim', einfuegen: 'trim()', art: 'methode', info: { de: 'String: Leerzeichen am Anfang/Ende entfernen.', en: 'String: remove whitespace at start/end.' } },
  { label: '.split', einfuegen: "split('$0')", art: 'methode', info: { de: 'String: an einem Trennzeichen in ein Array teilen.', en: 'String: split into an array at a separator.' } },
  { label: '.startsWith', einfuegen: "startsWith('$0')", art: 'methode', info: { de: 'String: beginnt mit …?', en: 'String: starts with …?' } },
  { label: '.replace', einfuegen: "replace('$0', '')", art: 'methode', info: { de: 'String: ersten Treffer ersetzen.', en: 'String: replace the first match.' } },
  { label: '.padStart', einfuegen: "padStart($0, '0')", art: 'methode', info: { de: 'String: vorne auffüllen, z. B. 7 → "07".', en: 'String: pad at the start, e.g. 7 → "07".' } },
  { label: '.toFixed', einfuegen: 'toFixed($0)', art: 'methode', info: { de: 'Zahl: als String mit n Nachkommastellen.', en: 'Number: as a string with n decimals.' } },
  { label: '.toLocaleString', einfuegen: "toLocaleString('en-US')", art: 'methode', info: { de: 'Zahl/Datum: landesüblich formatieren.', en: 'Number/date: format for a locale.' } },
  { label: '.then', einfuegen: 'then((result) => $0)', art: 'methode', info: { de: 'Promise: bei Erfolg.', en: 'Promise: on success.' } },
  { label: '.catch', einfuegen: 'catch((error) => $0)', art: 'methode', info: { de: 'Promise: bei Fehler.', en: 'Promise: on error.' } },
  { label: '.finally', einfuegen: 'finally(() => $0)', art: 'methode', info: { de: 'Promise: in jedem Fall am Ende.', en: 'Promise: always, at the end.' } },
  { label: '.json', einfuegen: 'json()', art: 'methode', info: { de: 'Response: Body als JSON lesen (Promise).', en: 'Response: read the body as JSON (promise).' } },
  { label: '.ok', art: 'methode', info: { de: 'Response: true bei Status 200-299.', en: 'Response: true for status 200-299.' } },
  { label: '.addEventListener', einfuegen: "addEventListener('$0', (event) => {\n  \n})", art: 'methode', info: { de: 'DOM: auf ein Event reagieren.', en: 'DOM: react to an event.' } },
  { label: '.textContent', art: 'methode', info: { de: 'DOM: Textinhalt eines Elements.', en: 'DOM: text content of an element.' } },
  { label: '.append', einfuegen: 'append($0)', art: 'methode', info: { de: 'DOM: Kind-Elemente anhängen.', en: 'DOM: append child elements.' } },
  { label: '.value', art: 'methode', info: { de: 'Eingabefeld: aktueller Wert.', en: 'Input field: current value.' } },
  { label: '.target', art: 'methode', info: { de: 'Event: das auslösende Element.', en: 'Event: the element that triggered it.' } },
  { label: '.preventDefault', einfuegen: 'preventDefault()', art: 'methode', info: { de: 'Event: Standardverhalten verhindern (z. B. Seite neu laden).', en: 'Event: prevent the default behavior (e.g. page reload).' } },
  { label: '.current', art: 'methode', info: { de: 'Ref: der gespeicherte Wert bzw. das DOM-Element.', en: 'Ref: the stored value or DOM element.' } },
  { label: '.focus', einfuegen: 'focus()', art: 'methode', info: { de: 'DOM: Element fokussieren.', en: 'DOM: focus the element.' } },
]

// TypeScript (Teil 2) - kommt zusätzlich zu den JavaScript-Vorschlägen.
const TYPESCRIPT: Eintrag[] = [
  { label: 'type', einfuegen: 'type $0 = {\n  \n}', art: 'snippet', info: { de: 'Typ-Alias: einem Typ einen Namen geben.', en: 'Type alias: give a type a name.' } },
  { label: 'interface', einfuegen: 'interface $0 {\n  \n}', art: 'snippet', info: { de: 'Beschreibt die Form eines Objekts, erweiterbar mit extends.', en: 'Describes the shape of an object, extendable with extends.' } },
  { label: 'string', art: 'keyword', info: { de: 'Typ für Texte.', en: 'Type for text.' } },
  { label: 'number', art: 'keyword', info: { de: 'Typ für Zahlen (ganz und mit Komma).', en: 'Type for numbers (integers and decimals).' } },
  { label: 'boolean', art: 'keyword', info: { de: 'Typ für true und false.', en: 'Type for true and false.' } },
  { label: 'unknown', art: 'keyword', info: { de: 'Irgendein Wert - muss vor der Benutzung eingegrenzt werden.', en: 'Any value - must be narrowed before use.' } },
  { label: 'any', art: 'keyword', info: { de: 'Schaltet die Typprüfung ab - möglichst vermeiden.', en: 'Turns type checking off - avoid it.' } },
  { label: 'never', art: 'keyword', info: { de: 'Typ ohne Werte - z. B. für „kann nie passieren“.', en: 'A type with no values - e.g. for “can never happen”.' } },
  { label: 'void', art: 'keyword', info: { de: 'Rückgabetyp einer Funktion, die nichts zurückgibt.', en: 'Return type of a function that returns nothing.' } },
  { label: 'readonly', einfuegen: 'readonly $0', art: 'keyword', info: { de: 'Feld darf nach dem Erzeugen nicht geändert werden.', en: 'The field may not be changed after creation.' } },
  { label: 'keyof', einfuegen: 'keyof $0', art: 'keyword', info: { de: 'Union aller Schlüssel eines Typs.', en: 'Union of all keys of a type.' } },
  { label: 'as const', art: 'keyword', info: { de: 'Wert so eng wie möglich typisieren (Literale, readonly).', en: 'Type a value as narrowly as possible (literals, readonly).' } },
  { label: 'satisfies', einfuegen: 'satisfies $0', art: 'keyword', info: { de: 'Prüft einen Wert gegen einen Typ, ohne ihn zu verbreitern.', en: 'Checks a value against a type without widening it.' } },
  { label: 'generic', einfuegen: 'function $0<T>(value: T): T {\n  return value\n}', art: 'snippet', info: { de: 'Generische Funktion mit Typparameter T.', en: 'Generic function with a type parameter T.' } },
  { label: 'union', einfuegen: "type $0 = 'a' | 'b'", art: 'snippet', info: { de: 'Union aus Literal-Typen: nur diese Werte sind erlaubt.', en: 'Union of literal types: only these values are allowed.' } },
  { label: 'typeguard', einfuegen: "function is$0(value: unknown): value is string {\n  return typeof value === 'string'\n}", art: 'snippet', info: { de: 'Type Guard: eigene Prüfung, die den Typ eingrenzt.', en: 'Type guard: your own check that narrows the type.' } },
  { label: 'Partial', einfuegen: 'Partial<$0>', art: 'funktion', info: { de: 'Alle Felder optional.', en: 'All fields optional.' } },
  { label: 'Required', einfuegen: 'Required<$0>', art: 'funktion', info: { de: 'Alle Felder Pflicht.', en: 'All fields required.' } },
  { label: 'Readonly', einfuegen: 'Readonly<$0>', art: 'funktion', info: { de: 'Alle Felder readonly.', en: 'All fields readonly.' } },
  { label: 'Pick', einfuegen: "Pick<$0, ''>", art: 'funktion', info: { de: 'Nur die genannten Felder übernehmen.', en: 'Keep only the listed fields.' } },
  { label: 'Omit', einfuegen: "Omit<$0, ''>", art: 'funktion', info: { de: 'Die genannten Felder weglassen.', en: 'Leave out the listed fields.' } },
  { label: 'Record', einfuegen: 'Record<string, $0>', art: 'funktion', info: { de: 'Objekt mit Schlüsseltyp und Werttyp.', en: 'Object with a key type and a value type.' } },
  { label: 'ReturnType', einfuegen: 'ReturnType<typeof $0>', art: 'funktion', info: { de: 'Rückgabetyp einer Funktion.', en: 'Return type of a function.' } },
  { label: 'Promise', einfuegen: 'Promise<$0>', art: 'funktion', info: { de: 'Typ eines Promise, das einen Wert liefert.', en: 'Type of a promise that resolves to a value.' } },
]

const REACT: Eintrag[] = [
  // --- Grundgerüste ----------------------------------------------------------
  { label: 'App', einfuegen: 'function App() {\n  return (\n    <>\n      $0\n    </>\n  )\n}', art: 'snippet', info: { de: 'Die Komponente, die im Editor angezeigt wird.', en: 'The component that is shown in the editor.' } },
  { label: 'component', einfuegen: 'function $0({  }) {\n  return <div></div>\n}', art: 'snippet', info: { de: 'Neue Komponente mit Props (Name großschreiben!).', en: 'New component with props (capitalize the name!).' } },

  // --- Hooks -------------------------------------------------------------------
  { label: 'useState', einfuegen: 'const [value, setValue] = useState($0)', art: 'hook', info: { de: 'Zustand, dessen Änderung neu rendert. → [wert, setter]', en: 'State that re-renders when it changes. → [value, setter]' } },
  { label: 'useEffect', einfuegen: 'useEffect(() => {\n  $0\n  return () => {}\n}, [])', art: 'hook', info: { de: 'Nach dem Rendern mit der Außenwelt synchronisieren, mit Cleanup.', en: 'Synchronize with the outside world after rendering, with cleanup.' } },
  { label: 'useRef', einfuegen: 'const ref = useRef($0)', art: 'hook', info: { de: 'Veränderbarer Wert ohne Re-Render / DOM-Zugriff.', en: 'Mutable value without re-render / DOM access.' } },
  { label: 'useMemo', einfuegen: 'const result = useMemo(() => $0, [])', art: 'hook', info: { de: 'Ergebnis merken, bis sich Dependencies ändern.', en: 'Remember a result until dependencies change.' } },
  { label: 'useCallback', einfuegen: 'const handler = useCallback(() => {\n  $0\n}, [])', art: 'hook', info: { de: 'Funktion merken, bis sich Dependencies ändern.', en: 'Remember a function until dependencies change.' } },
  { label: 'useReducer', einfuegen: 'const [state, dispatch] = useReducer(reducer, $0)', art: 'hook', info: { de: 'State über Actions und eine Reducer-Funktion.', en: 'State via actions and a reducer function.' } },
  { label: 'useContext', einfuegen: 'useContext($0)', art: 'hook', info: { de: 'Wert des nächsten Context-Providers lesen.', en: 'Read the value of the nearest context provider.' } },
  { label: 'createContext', einfuegen: 'const MyContext = createContext($0)', art: 'funktion', info: { de: 'Neuen Context anlegen (mit Default-Wert).', en: 'Create a new context (with a default value).' } },
  { label: 'useId', einfuegen: 'const id = useId()', art: 'hook', info: { de: 'Eindeutige ID, z. B. für Label und Input.', en: 'Unique ID, e.g. for label and input.' } },
  { label: 'useTransition', einfuegen: 'const [isPending, startTransition] = useTransition()', art: 'hook', info: { de: 'Updates als nicht dringend markieren.', en: 'Mark updates as non-urgent.' } },
  { label: 'useDeferredValue', einfuegen: 'const deferred = useDeferredValue($0)', art: 'hook', info: { de: 'Hinterherhinkende Kopie für langsame Teile.', en: 'A lagging copy for slow parts.' } },
  { label: 'useEffectEvent', einfuegen: 'const onEvent = useEffectEvent(() => {\n  $0\n})', art: 'hook', info: { de: 'Funktion für Effekte, die immer aktuelle Werte liest.', en: 'Function for effects that always reads current values.' } },
  { label: 'useActionState', einfuegen: 'const [state, formAction, isPending] = useActionState(async (previous, formData) => {\n  $0\n}, null)', art: 'hook', info: { de: 'State aus dem Ergebnis einer Formular-Action.', en: 'State derived from the result of a form action.' } },
  { label: 'useOptimistic', einfuegen: 'const [optimistic, setOptimistic] = useOptimistic($0, (current, next) => current)', art: 'hook', info: { de: 'Erwartetes Ergebnis sofort anzeigen.', en: 'Show the expected result immediately.' } },
  { label: 'useFormStatus', einfuegen: 'const { pending } = useFormStatus()', art: 'hook', info: { de: 'Wird das umgebende Formular gerade gesendet?', en: 'Is the surrounding form being submitted?' } },
  { label: 'use', einfuegen: 'use($0)', art: 'hook', info: { de: 'Promise (mit Suspense) oder Context lesen.', en: 'Read a promise (with Suspense) or context.' } },
  { label: 'memo', einfuegen: 'memo($0)', art: 'funktion', info: { de: 'Komponente nur bei geänderten Props neu rendern.', en: 'Re-render a component only when its props change.' } },
  { label: 'createPortal', einfuegen: 'createPortal($0, document.body)', art: 'funktion', info: { de: 'An anderer Stelle im DOM rendern.', en: 'Render somewhere else in the DOM.' } },
  { label: 'Suspense', einfuegen: '<Suspense fallback={<p>Loading …</p>}>\n  $0\n</Suspense>', art: 'jsx', info: { de: 'Platzhalter, solange Kinder laden.', en: 'Placeholder while children are loading.' } },
  { label: 'Fragment', einfuegen: '<>\n  $0\n</>', art: 'jsx', info: { de: 'Mehrere Elemente ohne zusätzliches DOM-Element gruppieren.', en: 'Group elements without an extra DOM element.' } },

  // --- JSX -------------------------------------------------------------------
  { label: 'map-list', einfuegen: '{list.map((item) => (\n  <li key={item.id}>{$0}</li>\n))}', art: 'jsx', info: { de: 'Liste rendern - key nicht vergessen!', en: 'Render a list - don’t forget the key!' } },
  { label: 'onClick', einfuegen: 'onClick={() => $0}', art: 'jsx', info: { de: 'Klick-Handler: Funktion übergeben, nicht aufrufen.', en: 'Click handler: pass a function, don’t call it.' } },
  { label: 'onChange', einfuegen: 'onChange={(e) => $0(e.target.value)}', art: 'jsx', info: { de: 'Bei Eingabe - e.target.value ist der neue Wert.', en: 'On input - e.target.value is the new value.' } },
  { label: 'onSubmit', einfuegen: 'onSubmit={(e) => {\n  e.preventDefault()\n  $0\n}}', art: 'jsx', info: { de: 'Formular abgeschickt (auch per Enter).', en: 'Form submitted (also via Enter).' } },
  { label: 'onKeyDown', einfuegen: "onKeyDown={(e) => e.key === 'Enter' && $0}", art: 'jsx', info: { de: 'Tastendruck.', en: 'Key press.' } },
  { label: 'className', einfuegen: 'className="$0"', art: 'jsx', info: { de: 'CSS-Klassen (statt class).', en: 'CSS classes (instead of class).' } },
  { label: 'style', einfuegen: 'style={{ $0 }}', art: 'jsx', info: { de: 'Inline-Styles als Objekt, z. B. {{ color: "red" }}.', en: 'Inline styles as an object, e.g. {{ color: "red" }}.' } },
  { label: 'value', einfuegen: 'value={$0}', art: 'jsx', info: { de: 'Wert eines controlled Eingabefelds.', en: 'Value of a controlled input.' } },
  { label: 'checked', einfuegen: 'checked={$0}', art: 'jsx', info: { de: 'Zustand einer controlled Checkbox.', en: 'State of a controlled checkbox.' } },
  { label: 'disabled', einfuegen: 'disabled={$0}', art: 'jsx', info: { de: 'Element deaktivieren.', en: 'Disable the element.' } },
  { label: 'key', einfuegen: 'key={$0}', art: 'jsx', info: { de: 'Stabile, eindeutige ID für Listen-Einträge.', en: 'Stable, unique ID for list items.' } },
  { label: 'ref', einfuegen: 'ref={$0}', art: 'jsx', info: { de: 'Ref-Objekt mit dem DOM-Element verbinden.', en: 'Connect a ref object to the DOM element.' } },
  { label: 'htmlFor', einfuegen: 'htmlFor={$0}', art: 'jsx', info: { de: 'Label mit Input verknüpfen (statt for).', en: 'Link a label to an input (instead of for).' } },
  { label: 'placeholder', einfuegen: 'placeholder="$0"', art: 'jsx', info: { de: 'Platzhaltertext im Eingabefeld.', en: 'Placeholder text in an input.' } },
]

/**
 * Java hat eine eigene Liste - hier gibt es kein `const` und kein `console.log`,
 * dafür Typen, `System.out.println` und die Sammlungen aus java.util.
 */
const JAVA: Eintrag[] = [
  // --- Ausgabe ---------------------------------------------------------------
  { label: 'System.out.println', einfuegen: 'System.out.println($0);', art: 'funktion', info: { de: 'Gibt eine Zeile aus. Der lange Name: System → out (der Ausgabestrom) → println.', en: 'Prints one line. The long name: System → out (the output stream) → println.' } },
  { label: 'System.out.print', einfuegen: 'System.out.print($0);', art: 'funktion', info: { de: 'Gibt aus - ohne Zeilenumbruch.', en: 'Prints without a line break.' } },
  { label: 'System.out.printf', einfuegen: 'System.out.printf("%s%n", $0);', art: 'funktion', info: { de: 'Formatierte Ausgabe: %s Text, %d Zahl, %.2f Kommazahl, %n Zeilenumbruch.', en: 'Formatted output: %s text, %d integer, %.2f decimal, %n line break.' } },
  { label: 'System.err.println', einfuegen: 'System.err.println($0);', art: 'funktion', info: { de: 'Ausgabe auf dem Fehlerstrom (rot).', en: 'Prints to the error stream (red).' } },

  // --- Grundgerüste ----------------------------------------------------------
  { label: 'main', einfuegen: 'public static void main(String[] args) {\n    $0\n}', art: 'snippet', info: { de: 'Der Startpunkt jedes Java-Programms.', en: 'The entry point of every Java program.' } },
  { label: 'class', einfuegen: 'class $0 {\n    \n}', art: 'snippet', info: { de: 'Eine neue Klasse - der Bauplan für Objekte.', en: 'A new class - the blueprint for objects.' } },
  { label: 'sout', einfuegen: 'System.out.println($0);', art: 'snippet', info: { de: 'Kürzel für System.out.println (wie in IntelliJ).', en: 'Shortcut for System.out.println (as in IntelliJ).' } },
  { label: 'if', einfuegen: 'if ($0) {\n    \n}', art: 'snippet', info: { de: 'Die Bedingung muss ein boolean sein - „truthy“ gibt es in Java nicht.', en: 'The condition must be a boolean - Java has no “truthy”.' } },
  { label: 'ifelse', einfuegen: 'if ($0) {\n    \n} else {\n    \n}', art: 'snippet', info: { de: 'if mit else-Zweig.', en: 'if with an else branch.' } },
  { label: 'for', einfuegen: 'for (int i = 0; i < $0; i++) {\n    \n}', art: 'snippet', info: { de: 'Zählschleife.', en: 'Counting loop.' } },
  { label: 'foreach', einfuegen: 'for (String item : $0) {\n    \n}', art: 'snippet', info: { de: 'Erweiterte for-Schleife über Arrays und Listen.', en: 'Enhanced for loop over arrays and lists.' } },
  { label: 'while', einfuegen: 'while ($0) {\n    \n}', art: 'snippet', info: { de: 'Wiederholen, solange die Bedingung gilt.', en: 'Repeat while the condition holds.' } },
  { label: 'switch', einfuegen: 'switch ($0) {\n    case 1 -> System.out.println("eins");\n    default -> System.out.println("andere");\n}', art: 'snippet', info: { de: 'switch mit Pfeil (ab Java 14) - kein break nötig.', en: 'Arrow switch (Java 14+) - no break needed.' } },
  { label: 'trycatch', einfuegen: 'try {\n    $0\n} catch (Exception e) {\n    System.out.println(e.getMessage());\n}', art: 'snippet', info: { de: 'Fehler abfangen.', en: 'Catch errors.' } },

  // --- Typen -----------------------------------------------------------------
  { label: 'int', einfuegen: 'int $0 = ', art: 'keyword', info: { de: 'Ganze Zahl (-2.147.483.648 bis 2.147.483.647).', en: 'Whole number (-2,147,483,648 to 2,147,483,647).' } },
  { label: 'double', einfuegen: 'double $0 = ', art: 'keyword', info: { de: 'Kommazahl.', en: 'Decimal number.' } },
  { label: 'boolean', einfuegen: 'boolean $0 = ', art: 'keyword', info: { de: 'true oder false - sonst nichts.', en: 'true or false - nothing else.' } },
  { label: 'char', einfuegen: "char $0 = '';", art: 'keyword', info: { de: 'Ein einzelnes Zeichen in einfachen Anführungszeichen.', en: 'A single character in single quotes.' } },
  { label: 'long', einfuegen: 'long $0 = ', art: 'keyword', info: { de: 'Sehr große ganze Zahl.', en: 'Very large whole number.' } },
  { label: 'String', einfuegen: 'String $0 = "";', art: 'keyword', info: { de: 'Text. Groß geschrieben, weil String eine Klasse ist.', en: 'Text. Capitalized, because String is a class.' } },
  { label: 'var', einfuegen: 'var $0 = ', art: 'keyword', info: { de: 'Typ wird aus dem Wert abgeleitet (ab Java 10) - trotzdem fest.', en: 'Type inferred from the value (Java 10+) - still fixed.' } },
  { label: 'final', einfuegen: 'final $0', art: 'keyword', info: { de: 'Wert darf nicht mehr geändert werden (wie const).', en: 'Value cannot be reassigned (like const).' } },
  { label: 'static', einfuegen: 'static $0', art: 'keyword', info: { de: 'Gehört der Klasse, nicht einem Objekt.', en: 'Belongs to the class, not to an object.' } },
  { label: 'new', einfuegen: 'new $0()', art: 'keyword', info: { de: 'Erzeugt ein Objekt aus einer Klasse.', en: 'Creates an object from a class.' } },
  { label: 'return', einfuegen: 'return $0;', art: 'keyword', info: { de: 'Beendet die Methode und gibt einen Wert zurück.', en: 'Ends the method and returns a value.' } },
  { label: 'true', art: 'keyword', info: { de: 'boolean: wahr.', en: 'boolean: true.' } },
  { label: 'false', art: 'keyword', info: { de: 'boolean: falsch.', en: 'boolean: false.' } },
  { label: 'null', art: 'keyword', info: { de: '„Kein Objekt“. Nur bei Klassen möglich, nie bei int oder boolean.', en: '“No object”. Only for classes, never for int or boolean.' } },

  // --- Klassen der Standardbibliothek ---------------------------------------
  { label: 'ArrayList', einfuegen: 'ArrayList<String> $0 = new ArrayList<>();', art: 'funktion', info: { de: 'Liste, die mitwächst - anders als ein Array.', en: 'A list that grows - unlike an array.' } },
  { label: 'HashMap', einfuegen: 'HashMap<String, Integer> $0 = new HashMap<>();', art: 'funktion', info: { de: 'Zuordnung Schlüssel → Wert.', en: 'Mapping from key to value.' } },
  { label: 'StringBuilder', einfuegen: 'StringBuilder $0 = new StringBuilder();', art: 'funktion', info: { de: 'Strings effizient zusammenbauen.', en: 'Build strings efficiently.' } },
  { label: 'Math.max', einfuegen: 'Math.max($0)', art: 'funktion', info: { de: 'Die größere von zwei Zahlen.', en: 'The larger of two numbers.' } },
  { label: 'Math.min', einfuegen: 'Math.min($0)', art: 'funktion', info: { de: 'Die kleinere von zwei Zahlen.', en: 'The smaller of two numbers.' } },
  { label: 'Math.abs', einfuegen: 'Math.abs($0)', art: 'funktion', info: { de: 'Betrag (immer positiv).', en: 'Absolute value (always positive).' } },
  { label: 'Math.round', einfuegen: 'Math.round($0)', art: 'funktion', info: { de: 'Rundet zur nächsten ganzen Zahl.', en: 'Rounds to the nearest whole number.' } },
  { label: 'Math.random', einfuegen: 'Math.random()', art: 'funktion', info: { de: 'Zufallszahl zwischen 0.0 und 1.0.', en: 'Random number between 0.0 and 1.0.' } },
  { label: 'Integer.parseInt', einfuegen: 'Integer.parseInt($0)', art: 'funktion', info: { de: 'Text zu int. Wirft NumberFormatException, wenn es nicht passt.', en: 'Text to int. Throws NumberFormatException if it does not fit.' } },
  { label: 'Double.parseDouble', einfuegen: 'Double.parseDouble($0)', art: 'funktion', info: { de: 'Text zu double.', en: 'Text to double.' } },
  { label: 'String.valueOf', einfuegen: 'String.valueOf($0)', art: 'funktion', info: { de: 'Beliebigen Wert zu Text.', en: 'Any value to text.' } },
  { label: 'String.format', einfuegen: 'String.format("%s", $0)', art: 'funktion', info: { de: 'Formatierten String bauen (statt ausgeben).', en: 'Build a formatted string (instead of printing).' } },
  { label: 'Arrays.toString', einfuegen: 'Arrays.toString($0)', art: 'funktion', info: { de: 'Array lesbar ausgeben - sonst kommt [I@1b6d nur Müll.', en: 'Print an array readably - otherwise you only get [I@1b6d.' } },
  { label: 'Arrays.sort', einfuegen: 'Arrays.sort($0)', art: 'funktion', info: { de: 'Sortiert das Array an Ort und Stelle.', en: 'Sorts the array in place.' } },
  { label: 'List.of', einfuegen: 'List.of($0)', art: 'funktion', info: { de: 'Feste, unveränderliche Liste.', en: 'A fixed, unmodifiable list.' } },
  { label: 'throw', einfuegen: 'throw new IllegalArgumentException("$0");', art: 'snippet', info: { de: 'Fehler auslösen.', en: 'Throw an error.' } },

  // --- Methoden (nach einem Punkt) -------------------------------------------
  { label: '.length', einfuegen: 'length', art: 'methode', info: { de: 'Array: Anzahl Felder. Achtung - ohne Klammern!', en: 'Array: number of slots. Careful - no parentheses!' } },
  { label: '.length()', einfuegen: 'length()', art: 'methode', info: { de: 'String: Anzahl Zeichen - hier MIT Klammern.', en: 'String: number of characters - here WITH parentheses.' } },
  { label: '.size', einfuegen: 'size()', art: 'methode', info: { de: 'Liste/Map: Anzahl Einträge.', en: 'List/map: number of entries.' } },
  { label: '.equals', einfuegen: 'equals($0)', art: 'methode', info: { de: 'Inhalt vergleichen. Bei Objekten immer equals statt ==!', en: 'Compare content. For objects always use equals instead of ==!' } },
  { label: '.charAt', einfuegen: 'charAt($0)', art: 'methode', info: { de: 'String: Zeichen an Position (0-basiert).', en: 'String: character at an index (0-based).' } },
  { label: '.substring', einfuegen: 'substring($0)', art: 'methode', info: { de: 'String: Ausschnitt ab Position (optional bis).', en: 'String: section from an index (optionally to).' } },
  { label: '.toUpperCase', einfuegen: 'toUpperCase()', art: 'methode', info: { de: 'String: in Großbuchstaben (neuer String!).', en: 'String: to upper case (a new string!).' } },
  { label: '.toLowerCase', einfuegen: 'toLowerCase()', art: 'methode', info: { de: 'String: in Kleinbuchstaben.', en: 'String: to lower case.' } },
  { label: '.trim', einfuegen: 'trim()', art: 'methode', info: { de: 'String: Leerzeichen am Rand entfernen.', en: 'String: remove whitespace at the edges.' } },
  { label: '.contains', einfuegen: 'contains($0)', art: 'methode', info: { de: 'String/Liste: enthält …?', en: 'String/list: contains …?' } },
  { label: '.split', einfuegen: 'split("$0")', art: 'methode', info: { de: 'String: in ein String[] zerlegen.', en: 'String: split into a String[].' } },
  { label: '.isEmpty', einfuegen: 'isEmpty()', art: 'methode', info: { de: 'String/Liste: leer?', en: 'String/list: empty?' } },
  { label: '.add', einfuegen: 'add($0)', art: 'methode', info: { de: 'Liste: Element anhängen.', en: 'List: append an element.' } },
  { label: '.get', einfuegen: 'get($0)', art: 'methode', info: { de: 'Liste: Element an Position. Map: Wert zum Schlüssel.', en: 'List: element at an index. Map: value for a key.' } },
  { label: '.put', einfuegen: 'put($0, )', art: 'methode', info: { de: 'Map: Schlüssel → Wert eintragen.', en: 'Map: store key → value.' } },
  { label: '.remove', einfuegen: 'remove($0)', art: 'methode', info: { de: 'Liste/Map: Eintrag entfernen.', en: 'List/map: remove an entry.' } },
  { label: '.containsKey', einfuegen: 'containsKey($0)', art: 'methode', info: { de: 'Map: gibt es den Schlüssel?', en: 'Map: does the key exist?' } },
  { label: '.keySet', einfuegen: 'keySet()', art: 'methode', info: { de: 'Map: alle Schlüssel (zum Durchlaufen).', en: 'Map: all keys (for iterating).' } },
  { label: '.getMessage', einfuegen: 'getMessage()', art: 'methode', info: { de: 'Exception: der Text, der beim Werfen mitgegeben wurde.', en: 'Exception: the text passed when it was thrown.' } },
  { label: '.toString', einfuegen: 'toString()', art: 'methode', info: { de: 'Objekt als Text. Eigene Klassen sollten sie überschreiben.', en: 'Object as text. Your own classes should override it.' } },
  { label: '.append', einfuegen: 'append($0)', art: 'methode', info: { de: 'StringBuilder: anhängen.', en: 'StringBuilder: append.' } },
  { label: '.stream', einfuegen: 'stream()', art: 'methode', info: { de: 'Liste: Strom für filter/map/… - Javas Gegenstück zu Array-Methoden.', en: 'List: a stream for filter/map/… - Java’s counterpart to array methods.' } },
]

/** Alle Vorschläge für einen Editor, aufgelöst in der Oberflächensprache. */
export function vorschlaegeFuer(editor: EditorSprache, sprache: Sprache): Vorschlag[] {
  const eintraege =
    editor === 'java' ? JAVA
      : editor === 'spring' ? [...SPRING, ...JAVA]
      : editor === 'docker' ? DOCKERFILE
      : editor === 'yaml' ? COMPOSE
      : editor === 'properties' ? []
      : editor === 'sql' ? SQL
      : editor === 'react' ? [...REACT, ...JAVASCRIPT]
      : editor === 'ts' ? [...TYPESCRIPT, ...JAVASCRIPT]
      : JAVASCRIPT
  return eintraege.map((e) => ({ ...e, info: e.info[sprache] }))
}

const KEINE_VARIABLEN = new Set(
  'const let var function return if else for while do switch case break continue default new class extends import from export async await try catch finally throw typeof instanceof in of this true false null undefined'.split(
    ' ',
  ),
)

/**
 * Sucht passende Vorschläge für das Wort vor dem Cursor.
 * Rückgabe: die Treffer und wie viele Zeichen vor dem Cursor ersetzt werden.
 */
export function suchen(
  alle: Vorschlag[],
  code: string,
  wort: string,
  infoImCode: string,
): { treffer: Vorschlag[]; ersetzeZeichen: number } {
  const klein = wort.toLowerCase()
  const punkt = wort.lastIndexOf('.')

  // Nach einem Punkt: erst bekannte "objekt.methode"-Einträge (console.lo → console.log) …
  if (punkt >= 0) {
    const vollTreffer = alle.filter((v) => !v.label.startsWith('.') && v.label.toLowerCase().startsWith(klein))
    if (vollTreffer.length) return { treffer: vollTreffer, ersetzeZeichen: wort.length }

    // … sonst allgemeine Methoden hinter beliebigen Werten (liste.fi → filter)
    const teil = klein.slice(punkt + 1)
    const methoden = alle.filter((v) => v.label.startsWith('.') && v.label.slice(1).toLowerCase().startsWith(teil))
    return { treffer: methoden, ersetzeZeichen: teil.length }
  }

  // Leeres Wort (Strg+Leertaste) zeigt alles, Zahlen und Sonderzeichen nichts.
  // `@` starts an annotation (Spring: @GetMapping).
  if (wort && !/^[A-Za-z_$@]/.test(wort)) return { treffer: [], ersetzeZeichen: 0 }

  const statisch = alle.filter((v) => !v.label.startsWith('.'))
  const beginnt = statisch.filter((v) => v.label.toLowerCase().startsWith(klein))
  const enthaelt = klein.length >= 3 ? statisch.filter((v) => !beginnt.includes(v) && v.label.toLowerCase().includes(klein)) : []

  // Namen, die schon im Code stehen (Variablen, Funktionen, Komponenten)
  const bekannt = new Set(alle.map((v) => v.label))
  const haeufigkeit = new Map<string, number>()
  for (const [name] of code.matchAll(/[A-Za-z_$][\w$]{2,}/g)) {
    haeufigkeit.set(name, (haeufigkeit.get(name) ?? 0) + 1)
  }
  const ausCode: Vorschlag[] = [...haeufigkeit]
    // Das gerade getippte Wort selbst taucht einmal auf - das ist kein Vorschlag.
    .filter(([name, anzahl]) => !(name === wort && anzahl === 1))
    .filter(([name]) => !bekannt.has(name) && !KEINE_VARIABLEN.has(name) && name.toLowerCase().startsWith(klein))
    .map(([name]) => ({ label: name, art: 'variable', info: infoImCode }))

  const treffer = [...beginnt, ...ausCode, ...enthaelt]
    // Was genau so schon dasteht, braucht keinen Vorschlag.
    .filter((v) => !(v.label === wort && (v.einfuegen ?? v.label) === wort))

  return { treffer, ersetzeZeichen: wort.length }
}
