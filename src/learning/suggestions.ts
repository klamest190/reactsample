import type { Sprache, Zweisprachig } from '../i18n/LanguageContext'
import { COMPOSE, DOCKERFILE, SPRING } from './backendSuggestions'
import type { EditorLanguage } from './modes'
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

export type SuggestionKind = 'function' | 'hook' | 'snippet' | 'keyword' | 'method' | 'jsx' | 'variable' | 'tailwind'

/** Ein Vorschlag, aufgelöst für eine Sprache. */
export type Suggestion = {
  label: string
  insert?: string
  kind: SuggestionKind
  info: string
  /** Tailwind: das CSS, das die Klasse erzeugt (siehe tailwindMotor.ts). */
  css?: string
  /** Tailwind: Farbe für das Farbfeld in der Liste, z. B. oklch(…). */
  color?: string
}

export type Entry = {
  label: string
  insert?: string
  kind: SuggestionKind
  info: Zweisprachig
}

const JAVASCRIPT: Entry[] = [
  // --- Konsole -------------------------------------------------------------
  { label: 'console.log', insert: 'console.log($0)', kind: 'function', info: { de: 'Gibt Werte in der Konsole aus.', en: 'Prints values to the console.' } },
  { label: 'console.error', insert: 'console.error($0)', kind: 'function', info: { de: 'Gibt eine Fehlermeldung (rot) aus.', en: 'Prints an error message (red).' } },
  { label: 'console.warn', insert: 'console.warn($0)', kind: 'function', info: { de: 'Gibt eine Warnung (gelb) aus.', en: 'Prints a warning (yellow).' } },
  { label: 'console.table', insert: 'console.table($0)', kind: 'function', info: { de: 'Gibt Arrays/Objekte aus.', en: 'Prints arrays/objects.' } },
  { label: 'console.time', insert: "console.time('$0')", kind: 'function', info: { de: 'Startet eine Zeitmessung mit Namen.', en: 'Starts a named timer.' } },
  { label: 'console.timeEnd', insert: "console.timeEnd('$0')", kind: 'function', info: { de: 'Beendet die Zeitmessung und gibt die Dauer aus.', en: 'Stops the timer and prints the duration.' } },

  // --- Schlüsselwörter & Grundgerüste ---------------------------------------
  { label: 'const', insert: 'const $0 = ', kind: 'keyword', info: { de: 'Variable, die nicht neu zugewiesen wird (Standard).', en: 'Variable that is never reassigned (the default).' } },
  { label: 'let', insert: 'let $0 = ', kind: 'keyword', info: { de: 'Variable, die neu zugewiesen werden darf.', en: 'Variable that may be reassigned.' } },
  { label: 'function', insert: 'function $0() {\n  \n}', kind: 'snippet', info: { de: 'Funktionsdeklaration.', en: 'Function declaration.' } },
  { label: 'arrowfunction', insert: '($0) => {\n  \n}', kind: 'snippet', info: { de: 'Arrow Function: (parameter) => { … }', en: 'Arrow function: (parameters) => { … }' } },
  { label: 'return', insert: 'return $0', kind: 'keyword', info: { de: 'Beendet die Funktion und gibt einen Wert zurück.', en: 'Ends the function and returns a value.' } },
  { label: 'if', insert: 'if ($0) {\n  \n}', kind: 'snippet', info: { de: 'Code nur ausführen, wenn die Bedingung truthy ist.', en: 'Run code only if the condition is truthy.' } },
  { label: 'ifelse', insert: 'if ($0) {\n  \n} else {\n  \n}', kind: 'snippet', info: { de: 'if mit else-Zweig.', en: 'if with an else branch.' } },
  { label: 'else', insert: 'else {\n  $0\n}', kind: 'keyword', info: { de: 'Alternativer Zweig zu if.', en: 'Alternative branch for if.' } },
  { label: 'switch', insert: "switch ($0) {\n  case '':\n    break\n  default:\n}", kind: 'snippet', info: { de: 'Einen Wert mit mehreren festen Fällen vergleichen.', en: 'Compare one value against several fixed cases.' } },
  { label: 'forof', insert: 'for (const item of $0) {\n  \n}', kind: 'snippet', info: { de: 'Schleife über alle Elemente einer Liste.', en: 'Loop over every element of a list.' } },
  { label: 'for', insert: 'for (let i = 0; i < $0; i++) {\n  \n}', kind: 'snippet', info: { de: 'Zählschleife.', en: 'Counting loop.' } },
  { label: 'while', insert: 'while ($0) {\n  \n}', kind: 'snippet', info: { de: 'Wiederholen, solange die Bedingung gilt.', en: 'Repeat while the condition holds.' } },
  { label: 'trycatch', insert: 'try {\n  $0\n} catch (error) {\n  console.error(error)\n}', kind: 'snippet', info: { de: 'Fehler abfangen.', en: 'Catch errors.' } },
  { label: 'async function', insert: 'async function $0() {\n  \n}', kind: 'snippet', info: { de: 'Funktion, in der await erlaubt ist. Gibt ein Promise zurück.', en: 'Function where await is allowed. Returns a promise.' } },
  { label: 'await', insert: 'await $0', kind: 'keyword', info: { de: 'Wartet auf das Ergebnis eines Promises.', en: 'Waits for the result of a promise.' } },
  { label: 'typeof', insert: 'typeof $0', kind: 'keyword', info: { de: 'Liefert den Typ eines Werts als String.', en: 'Returns the type of a value as a string.' } },
  { label: 'new', insert: 'new $0', kind: 'keyword', info: { de: 'Erzeugt ein Objekt aus einer Klasse/Konstruktorfunktion.', en: 'Creates an object from a class/constructor.' } },
  { label: 'export', insert: 'export ', kind: 'keyword', info: { de: 'Macht etwas für andere Module verfügbar.', en: 'Makes something available to other modules.' } },
  { label: 'import', insert: "import { $0 } from ''", kind: 'keyword', info: { de: 'Holt Exporte aus einem anderen Modul.', en: 'Imports exports from another module.' } },
  { label: 'true', kind: 'keyword', info: { de: 'Boolean: wahr.', en: 'Boolean: true.' } },
  { label: 'false', kind: 'keyword', info: { de: 'Boolean: falsch.', en: 'Boolean: false.' } },
  { label: 'null', kind: 'keyword', info: { de: '„Absichtlich kein Wert“.', en: '“Intentionally no value”.' } },
  { label: 'undefined', kind: 'keyword', info: { de: '„Noch kein Wert zugewiesen“.', en: '“No value assigned yet”.' } },

  // --- Eingebaute Funktionen & Objekte --------------------------------------
  { label: 'setTimeout', insert: 'setTimeout(() => {\n  $0\n}, 1000)', kind: 'function', info: { de: 'Führt eine Funktion einmal nach x Millisekunden aus.', en: 'Runs a function once after x milliseconds.' } },
  { label: 'setInterval', insert: 'setInterval(() => {\n  $0\n}, 1000)', kind: 'function', info: { de: 'Führt eine Funktion alle x Millisekunden aus. Gibt eine ID zurück.', en: 'Runs a function every x milliseconds. Returns an ID.' } },
  { label: 'clearTimeout', insert: 'clearTimeout($0)', kind: 'function', info: { de: 'Bricht einen setTimeout über seine ID ab.', en: 'Cancels a setTimeout by its ID.' } },
  { label: 'clearInterval', insert: 'clearInterval($0)', kind: 'function', info: { de: 'Stoppt ein setInterval über seine ID.', en: 'Stops a setInterval by its ID.' } },
  { label: 'fetch', insert: "fetch('$0')", kind: 'function', info: { de: 'HTTP-Anfrage. Gibt ein Promise mit der Response zurück.', en: 'HTTP request. Returns a promise with the response.' } },
  { label: 'Promise', insert: 'new Promise((resolve, reject) => {\n  $0\n})', kind: 'snippet', info: { de: 'Eigenes Promise erzeugen.', en: 'Create your own promise.' } },
  { label: 'Promise.all', insert: 'Promise.all([$0])', kind: 'function', info: { de: 'Wartet auf mehrere Promises parallel.', en: 'Waits for several promises in parallel.' } },
  { label: 'JSON.stringify', insert: 'JSON.stringify($0)', kind: 'function', info: { de: 'Wandelt einen Wert in einen JSON-String um.', en: 'Converts a value into a JSON string.' } },
  { label: 'JSON.parse', insert: 'JSON.parse($0)', kind: 'function', info: { de: 'Wandelt einen JSON-String in einen Wert um.', en: 'Converts a JSON string into a value.' } },
  { label: 'Object.keys', insert: 'Object.keys($0)', kind: 'function', info: { de: 'Array aller Schlüssel eines Objekts.', en: 'Array of all keys of an object.' } },
  { label: 'Object.values', insert: 'Object.values($0)', kind: 'function', info: { de: 'Array aller Werte eines Objekts.', en: 'Array of all values of an object.' } },
  { label: 'Object.entries', insert: 'Object.entries($0)', kind: 'function', info: { de: 'Array aus [schlüssel, wert]-Paaren.', en: 'Array of [key, value] pairs.' } },
  { label: 'Array.isArray', insert: 'Array.isArray($0)', kind: 'function', info: { de: 'Prüft, ob ein Wert ein Array ist.', en: 'Checks whether a value is an array.' } },
  { label: 'Array.from', insert: 'Array.from({ length: $0 }, (_, i) => i)', kind: 'function', info: { de: 'Erzeugt ein Array, z. B. mit n Einträgen.', en: 'Creates an array, e.g. with n entries.' } },
  { label: 'Math.random', insert: 'Math.random()', kind: 'function', info: { de: 'Zufallszahl zwischen 0 und 1.', en: 'Random number between 0 and 1.' } },
  { label: 'Math.round', insert: 'Math.round($0)', kind: 'function', info: { de: 'Rundet kaufmännisch.', en: 'Rounds to the nearest integer.' } },
  { label: 'Math.floor', insert: 'Math.floor($0)', kind: 'function', info: { de: 'Rundet ab.', en: 'Rounds down.' } },
  { label: 'Math.max', insert: 'Math.max($0)', kind: 'function', info: { de: 'Größte von mehreren Zahlen.', en: 'Largest of several numbers.' } },
  { label: 'Math.min', insert: 'Math.min($0)', kind: 'function', info: { de: 'Kleinste von mehreren Zahlen.', en: 'Smallest of several numbers.' } },
  { label: 'Number', insert: 'Number($0)', kind: 'function', info: { de: 'Wandelt einen Wert in eine Zahl um.', en: 'Converts a value into a number.' } },
  { label: 'String', insert: 'String($0)', kind: 'function', info: { de: 'Wandelt einen Wert in einen String um.', en: 'Converts a value into a string.' } },
  { label: 'Boolean', insert: 'Boolean($0)', kind: 'function', info: { de: 'Zeigt, ob ein Wert truthy oder falsy ist.', en: 'Shows whether a value is truthy or falsy.' } },
  { label: 'structuredClone', insert: 'structuredClone($0)', kind: 'function', info: { de: 'Tiefe Kopie eines Werts.', en: 'Deep copy of a value.' } },
  { label: 'document.querySelector', insert: "document.querySelector('$0')", kind: 'function', info: { de: 'Erstes Element zum CSS-Selektor.', en: 'First element matching a CSS selector.' } },
  { label: 'document.createElement', insert: "document.createElement('$0')", kind: 'function', info: { de: 'Erzeugt ein neues DOM-Element.', en: 'Creates a new DOM element.' } },

  // --- Methoden & Eigenschaften (nach einem Punkt) ---------------------------
  { label: '.map', insert: 'map((item) => $0)', kind: 'method', info: { de: 'Array: jedes Element umwandeln → neues Array.', en: 'Array: transform every element → new array.' } },
  { label: '.filter', insert: 'filter((item) => $0)', kind: 'method', info: { de: 'Array: nur passende Elemente behalten → neues Array.', en: 'Array: keep only matching elements → new array.' } },
  { label: '.reduce', insert: 'reduce((sum, item) => $0, 0)', kind: 'method', info: { de: 'Array: zu einem Wert zusammenfassen.', en: 'Array: combine into a single value.' } },
  { label: '.find', insert: 'find((item) => $0)', kind: 'method', info: { de: 'Array: erstes passendes Element (oder undefined).', en: 'Array: first matching element (or undefined).' } },
  { label: '.findIndex', insert: 'findIndex((item) => $0)', kind: 'method', info: { de: 'Array: Position des ersten Treffers (oder -1).', en: 'Array: index of the first match (or -1).' } },
  { label: '.some', insert: 'some((item) => $0)', kind: 'method', info: { de: 'Array: passt mindestens ein Element?', en: 'Array: does at least one element match?' } },
  { label: '.every', insert: 'every((item) => $0)', kind: 'method', info: { de: 'Array: passen alle Elemente?', en: 'Array: do all elements match?' } },
  { label: '.forEach', insert: 'forEach((item) => {\n  $0\n})', kind: 'method', info: { de: 'Array: für jedes Element etwas tun (kein Rückgabewert).', en: 'Array: do something for each element (no return value).' } },
  { label: '.includes', insert: 'includes($0)', kind: 'method', info: { de: 'Array/String: enthält den Wert?', en: 'Array/string: contains the value?' } },
  { label: '.length', kind: 'method', info: { de: 'Array/String: Anzahl Elemente bzw. Zeichen.', en: 'Array/string: number of elements or characters.' } },
  { label: '.join', insert: "join('$0')", kind: 'method', info: { de: 'Array: Elemente zu einem String verbinden.', en: 'Array: join elements into a string.' } },
  { label: '.slice', insert: 'slice($0)', kind: 'method', info: { de: 'Array/String: Ausschnitt als Kopie.', en: 'Array/string: a section as a copy.' } },
  { label: '.toSorted', insert: 'toSorted((a, b) => $0)', kind: 'method', info: { de: 'Array: sortierte Kopie (Original bleibt).', en: 'Array: sorted copy (original stays unchanged).' } },
  { label: '.at', insert: 'at($0)', kind: 'method', info: { de: 'Array: Element an Position, at(-1) = letztes.', en: 'Array: element at index, at(-1) = last.' } },
  { label: '.push', insert: 'push($0)', kind: 'method', info: { de: 'Array: hängt an - verändert das Original! In React: [...alt, x].', en: 'Array: appends - mutates the original! In React: [...prev, x].' } },
  { label: '.sort', insert: 'sort((a, b) => $0)', kind: 'method', info: { de: 'Array: sortiert das Original! In React lieber toSorted.', en: 'Array: sorts the original! In React prefer toSorted.' } },
  { label: '.toUpperCase', insert: 'toUpperCase()', kind: 'method', info: { de: 'String: in Großbuchstaben.', en: 'String: to upper case.' } },
  { label: '.toLowerCase', insert: 'toLowerCase()', kind: 'method', info: { de: 'String: in Kleinbuchstaben.', en: 'String: to lower case.' } },
  { label: '.trim', insert: 'trim()', kind: 'method', info: { de: 'String: Leerzeichen am Anfang/Ende entfernen.', en: 'String: remove whitespace at start/end.' } },
  { label: '.split', insert: "split('$0')", kind: 'method', info: { de: 'String: an einem Trennzeichen in ein Array teilen.', en: 'String: split into an array at a separator.' } },
  { label: '.startsWith', insert: "startsWith('$0')", kind: 'method', info: { de: 'String: beginnt mit …?', en: 'String: starts with …?' } },
  { label: '.replace', insert: "replace('$0', '')", kind: 'method', info: { de: 'String: ersten Treffer ersetzen.', en: 'String: replace the first match.' } },
  { label: '.padStart', insert: "padStart($0, '0')", kind: 'method', info: { de: 'String: vorne auffüllen, z. B. 7 → "07".', en: 'String: pad at the start, e.g. 7 → "07".' } },
  { label: '.toFixed', insert: 'toFixed($0)', kind: 'method', info: { de: 'Zahl: als String mit n Nachkommastellen.', en: 'Number: as a string with n decimals.' } },
  { label: '.toLocaleString', insert: "toLocaleString('en-US')", kind: 'method', info: { de: 'Zahl/Datum: landesüblich formatieren.', en: 'Number/date: format for a locale.' } },
  { label: '.then', insert: 'then((result) => $0)', kind: 'method', info: { de: 'Promise: bei Erfolg.', en: 'Promise: on success.' } },
  { label: '.catch', insert: 'catch((error) => $0)', kind: 'method', info: { de: 'Promise: bei Fehler.', en: 'Promise: on error.' } },
  { label: '.finally', insert: 'finally(() => $0)', kind: 'method', info: { de: 'Promise: in jedem Fall am Ende.', en: 'Promise: always, at the end.' } },
  { label: '.json', insert: 'json()', kind: 'method', info: { de: 'Response: Body als JSON lesen (Promise).', en: 'Response: read the body as JSON (promise).' } },
  { label: '.ok', kind: 'method', info: { de: 'Response: true bei Status 200-299.', en: 'Response: true for status 200-299.' } },
  { label: '.addEventListener', insert: "addEventListener('$0', (event) => {\n  \n})", kind: 'method', info: { de: 'DOM: auf ein Event reagieren.', en: 'DOM: react to an event.' } },
  { label: '.textContent', kind: 'method', info: { de: 'DOM: Textinhalt eines Elements.', en: 'DOM: text content of an element.' } },
  { label: '.append', insert: 'append($0)', kind: 'method', info: { de: 'DOM: Kind-Elemente anhängen.', en: 'DOM: append child elements.' } },
  { label: '.value', kind: 'method', info: { de: 'Eingabefeld: aktueller Wert.', en: 'Input field: current value.' } },
  { label: '.target', kind: 'method', info: { de: 'Event: das auslösende Element.', en: 'Event: the element that triggered it.' } },
  { label: '.preventDefault', insert: 'preventDefault()', kind: 'method', info: { de: 'Event: Standardverhalten verhindern (z. B. Seite neu laden).', en: 'Event: prevent the default behavior (e.g. page reload).' } },
  { label: '.current', kind: 'method', info: { de: 'Ref: der gespeicherte Wert bzw. das DOM-Element.', en: 'Ref: the stored value or DOM element.' } },
  { label: '.focus', insert: 'focus()', kind: 'method', info: { de: 'DOM: Element fokussieren.', en: 'DOM: focus the element.' } },
]

// TypeScript (Teil 2) - kommt zusätzlich zu den JavaScript-Vorschlägen.
const TYPESCRIPT: Entry[] = [
  { label: 'type', insert: 'type $0 = {\n  \n}', kind: 'snippet', info: { de: 'Typ-Alias: einem Typ einen Namen geben.', en: 'Type alias: give a type a name.' } },
  { label: 'interface', insert: 'interface $0 {\n  \n}', kind: 'snippet', info: { de: 'Beschreibt die Form eines Objekts, erweiterbar mit extends.', en: 'Describes the shape of an object, extendable with extends.' } },
  { label: 'string', kind: 'keyword', info: { de: 'Typ für Texte.', en: 'Type for text.' } },
  { label: 'number', kind: 'keyword', info: { de: 'Typ für Zahlen (ganz und mit Komma).', en: 'Type for numbers (integers and decimals).' } },
  { label: 'boolean', kind: 'keyword', info: { de: 'Typ für true und false.', en: 'Type for true and false.' } },
  { label: 'unknown', kind: 'keyword', info: { de: 'Irgendein Wert - muss vor der Benutzung eingegrenzt werden.', en: 'Any value - must be narrowed before use.' } },
  { label: 'any', kind: 'keyword', info: { de: 'Schaltet die Typprüfung ab - möglichst vermeiden.', en: 'Turns type checking off - avoid it.' } },
  { label: 'never', kind: 'keyword', info: { de: 'Typ ohne Werte - z. B. für „kann nie passieren“.', en: 'A type with no values - e.g. for “can never happen”.' } },
  { label: 'void', kind: 'keyword', info: { de: 'Rückgabetyp einer Funktion, die nichts zurückgibt.', en: 'Return type of a function that returns nothing.' } },
  { label: 'readonly', insert: 'readonly $0', kind: 'keyword', info: { de: 'Feld darf nach dem Erzeugen nicht geändert werden.', en: 'The field may not be changed after creation.' } },
  { label: 'keyof', insert: 'keyof $0', kind: 'keyword', info: { de: 'Union aller Schlüssel eines Typs.', en: 'Union of all keys of a type.' } },
  { label: 'as const', kind: 'keyword', info: { de: 'Wert so eng wie möglich typisieren (Literale, readonly).', en: 'Type a value as narrowly as possible (literals, readonly).' } },
  { label: 'satisfies', insert: 'satisfies $0', kind: 'keyword', info: { de: 'Prüft einen Wert gegen einen Typ, ohne ihn zu verbreitern.', en: 'Checks a value against a type without widening it.' } },
  { label: 'generic', insert: 'function $0<T>(value: T): T {\n  return value\n}', kind: 'snippet', info: { de: 'Generische Funktion mit Typparameter T.', en: 'Generic function with a type parameter T.' } },
  { label: 'union', insert: "type $0 = 'a' | 'b'", kind: 'snippet', info: { de: 'Union aus Literal-Typen: nur diese Werte sind erlaubt.', en: 'Union of literal types: only these values are allowed.' } },
  { label: 'typeguard', insert: "function is$0(value: unknown): value is string {\n  return typeof value === 'string'\n}", kind: 'snippet', info: { de: 'Type Guard: eigene Prüfung, die den Typ eingrenzt.', en: 'Type guard: your own check that narrows the type.' } },
  { label: 'Partial', insert: 'Partial<$0>', kind: 'function', info: { de: 'Alle Felder optional.', en: 'All fields optional.' } },
  { label: 'Required', insert: 'Required<$0>', kind: 'function', info: { de: 'Alle Felder Pflicht.', en: 'All fields required.' } },
  { label: 'Readonly', insert: 'Readonly<$0>', kind: 'function', info: { de: 'Alle Felder readonly.', en: 'All fields readonly.' } },
  { label: 'Pick', insert: "Pick<$0, ''>", kind: 'function', info: { de: 'Nur die genannten Felder übernehmen.', en: 'Keep only the listed fields.' } },
  { label: 'Omit', insert: "Omit<$0, ''>", kind: 'function', info: { de: 'Die genannten Felder weglassen.', en: 'Leave out the listed fields.' } },
  { label: 'Record', insert: 'Record<string, $0>', kind: 'function', info: { de: 'Objekt mit Schlüsseltyp und Werttyp.', en: 'Object with a key type and a value type.' } },
  { label: 'ReturnType', insert: 'ReturnType<typeof $0>', kind: 'function', info: { de: 'Rückgabetyp einer Funktion.', en: 'Return type of a function.' } },
  { label: 'Promise', insert: 'Promise<$0>', kind: 'function', info: { de: 'Typ eines Promise, das einen Wert liefert.', en: 'Type of a promise that resolves to a value.' } },
]

const REACT: Entry[] = [
  // --- Grundgerüste ----------------------------------------------------------
  { label: 'App', insert: 'function App() {\n  return (\n    <>\n      $0\n    </>\n  )\n}', kind: 'snippet', info: { de: 'Die Komponente, die im Editor angezeigt wird.', en: 'The component that is shown in the editor.' } },
  { label: 'component', insert: 'function $0({  }) {\n  return <div></div>\n}', kind: 'snippet', info: { de: 'Neue Komponente mit Props (Name großschreiben!).', en: 'New component with props (capitalize the name!).' } },

  // --- Hooks -------------------------------------------------------------------
  { label: 'useState', insert: 'const [value, setValue] = useState($0)', kind: 'hook', info: { de: 'Zustand, dessen Änderung neu rendert. → [wert, setter]', en: 'State that re-renders when it changes. → [value, setter]' } },
  { label: 'useEffect', insert: 'useEffect(() => {\n  $0\n  return () => {}\n}, [])', kind: 'hook', info: { de: 'Nach dem Rendern mit der Außenwelt synchronisieren, mit Cleanup.', en: 'Synchronize with the outside world after rendering, with cleanup.' } },
  { label: 'useRef', insert: 'const ref = useRef($0)', kind: 'hook', info: { de: 'Veränderbarer Wert ohne Re-Render / DOM-Zugriff.', en: 'Mutable value without re-render / DOM access.' } },
  { label: 'useMemo', insert: 'const result = useMemo(() => $0, [])', kind: 'hook', info: { de: 'Ergebnis merken, bis sich Dependencies ändern.', en: 'Remember a result until dependencies change.' } },
  { label: 'useCallback', insert: 'const handler = useCallback(() => {\n  $0\n}, [])', kind: 'hook', info: { de: 'Funktion merken, bis sich Dependencies ändern.', en: 'Remember a function until dependencies change.' } },
  { label: 'useReducer', insert: 'const [state, dispatch] = useReducer(reducer, $0)', kind: 'hook', info: { de: 'State über Actions und eine Reducer-Funktion.', en: 'State via actions and a reducer function.' } },
  { label: 'useContext', insert: 'useContext($0)', kind: 'hook', info: { de: 'Wert des nächsten Context-Providers lesen.', en: 'Read the value of the nearest context provider.' } },
  { label: 'createContext', insert: 'const MyContext = createContext($0)', kind: 'function', info: { de: 'Neuen Context anlegen (mit Default-Wert).', en: 'Create a new context (with a default value).' } },
  { label: 'useId', insert: 'const id = useId()', kind: 'hook', info: { de: 'Eindeutige ID, z. B. für Label und Input.', en: 'Unique ID, e.g. for label and input.' } },
  { label: 'useTransition', insert: 'const [isPending, startTransition] = useTransition()', kind: 'hook', info: { de: 'Updates als nicht dringend markieren.', en: 'Mark updates as non-urgent.' } },
  { label: 'useDeferredValue', insert: 'const deferred = useDeferredValue($0)', kind: 'hook', info: { de: 'Hinterherhinkende Kopie für langsame Teile.', en: 'A lagging copy for slow parts.' } },
  { label: 'useEffectEvent', insert: 'const onEvent = useEffectEvent(() => {\n  $0\n})', kind: 'hook', info: { de: 'Funktion für Effekte, die immer aktuelle Werte liest.', en: 'Function for effects that always reads current values.' } },
  { label: 'useActionState', insert: 'const [state, formAction, isPending] = useActionState(async (previous, formData) => {\n  $0\n}, null)', kind: 'hook', info: { de: 'State aus dem Ergebnis einer Formular-Action.', en: 'State derived from the result of a form action.' } },
  { label: 'useOptimistic', insert: 'const [optimistic, setOptimistic] = useOptimistic($0, (current, next) => current)', kind: 'hook', info: { de: 'Erwartetes Ergebnis sofort anzeigen.', en: 'Show the expected result immediately.' } },
  { label: 'useFormStatus', insert: 'const { pending } = useFormStatus()', kind: 'hook', info: { de: 'Wird das umgebende Formular gerade gesendet?', en: 'Is the surrounding form being submitted?' } },
  { label: 'use', insert: 'use($0)', kind: 'hook', info: { de: 'Promise (mit Suspense) oder Context lesen.', en: 'Read a promise (with Suspense) or context.' } },
  { label: 'memo', insert: 'memo($0)', kind: 'function', info: { de: 'Komponente nur bei geänderten Props neu rendern.', en: 'Re-render a component only when its props change.' } },
  { label: 'createPortal', insert: 'createPortal($0, document.body)', kind: 'function', info: { de: 'An anderer Stelle im DOM rendern.', en: 'Render somewhere else in the DOM.' } },
  { label: 'Suspense', insert: '<Suspense fallback={<p>Loading …</p>}>\n  $0\n</Suspense>', kind: 'jsx', info: { de: 'Platzhalter, solange Kinder laden.', en: 'Placeholder while children are loading.' } },
  { label: 'Fragment', insert: '<>\n  $0\n</>', kind: 'jsx', info: { de: 'Mehrere Elemente ohne zusätzliches DOM-Element gruppieren.', en: 'Group elements without an extra DOM element.' } },

  // --- JSX -------------------------------------------------------------------
  { label: 'map-list', insert: '{list.map((item) => (\n  <li key={item.id}>{$0}</li>\n))}', kind: 'jsx', info: { de: 'Liste rendern - key nicht vergessen!', en: 'Render a list - don’t forget the key!' } },
  { label: 'onClick', insert: 'onClick={() => $0}', kind: 'jsx', info: { de: 'Klick-Handler: Funktion übergeben, nicht aufrufen.', en: 'Click handler: pass a function, don’t call it.' } },
  { label: 'onChange', insert: 'onChange={(e) => $0(e.target.value)}', kind: 'jsx', info: { de: 'Bei Eingabe - e.target.value ist der neue Wert.', en: 'On input - e.target.value is the new value.' } },
  { label: 'onSubmit', insert: 'onSubmit={(e) => {\n  e.preventDefault()\n  $0\n}}', kind: 'jsx', info: { de: 'Formular abgeschickt (auch per Enter).', en: 'Form submitted (also via Enter).' } },
  { label: 'onKeyDown', insert: "onKeyDown={(e) => e.key === 'Enter' && $0}", kind: 'jsx', info: { de: 'Tastendruck.', en: 'Key press.' } },
  { label: 'className', insert: 'className="$0"', kind: 'jsx', info: { de: 'CSS-Klassen (statt class).', en: 'CSS classes (instead of class).' } },
  { label: 'style', insert: 'style={{ $0 }}', kind: 'jsx', info: { de: 'Inline-Styles als Objekt, z. B. {{ color: "red" }}.', en: 'Inline styles as an object, e.g. {{ color: "red" }}.' } },
  { label: 'value', insert: 'value={$0}', kind: 'jsx', info: { de: 'Wert eines controlled Eingabefelds.', en: 'Value of a controlled input.' } },
  { label: 'checked', insert: 'checked={$0}', kind: 'jsx', info: { de: 'Zustand einer controlled Checkbox.', en: 'State of a controlled checkbox.' } },
  { label: 'disabled', insert: 'disabled={$0}', kind: 'jsx', info: { de: 'Element deaktivieren.', en: 'Disable the element.' } },
  { label: 'key', insert: 'key={$0}', kind: 'jsx', info: { de: 'Stabile, eindeutige ID für Listen-Einträge.', en: 'Stable, unique ID for list items.' } },
  { label: 'ref', insert: 'ref={$0}', kind: 'jsx', info: { de: 'Ref-Objekt mit dem DOM-Element verbinden.', en: 'Connect a ref object to the DOM element.' } },
  { label: 'htmlFor', insert: 'htmlFor={$0}', kind: 'jsx', info: { de: 'Label mit Input verknüpfen (statt for).', en: 'Link a label to an input (instead of for).' } },
  { label: 'placeholder', insert: 'placeholder="$0"', kind: 'jsx', info: { de: 'Platzhaltertext im Eingabefeld.', en: 'Placeholder text in an input.' } },
]

/**
 * Java hat eine eigene Liste - hier gibt es kein `const` und kein `console.log`,
 * dafür Typen, `System.out.println` und die Sammlungen aus java.util.
 */
const JAVA: Entry[] = [
  // --- Ausgabe ---------------------------------------------------------------
  { label: 'System.out.println', insert: 'System.out.println($0);', kind: 'function', info: { de: 'Gibt eine Zeile aus. Der lange Name: System → out (der Ausgabestrom) → println.', en: 'Prints one line. The long name: System → out (the output stream) → println.' } },
  { label: 'System.out.print', insert: 'System.out.print($0);', kind: 'function', info: { de: 'Gibt aus - ohne Zeilenumbruch.', en: 'Prints without a line break.' } },
  { label: 'System.out.printf', insert: 'System.out.printf("%s%n", $0);', kind: 'function', info: { de: 'Formatierte Ausgabe: %s Text, %d Zahl, %.2f Kommazahl, %n Zeilenumbruch.', en: 'Formatted output: %s text, %d integer, %.2f decimal, %n line break.' } },
  { label: 'System.err.println', insert: 'System.err.println($0);', kind: 'function', info: { de: 'Ausgabe auf dem Fehlerstrom (rot).', en: 'Prints to the error stream (red).' } },

  // --- Grundgerüste ----------------------------------------------------------
  { label: 'main', insert: 'public static void main(String[] args) {\n    $0\n}', kind: 'snippet', info: { de: 'Der Startpunkt jedes Java-Programms.', en: 'The entry point of every Java program.' } },
  { label: 'class', insert: 'class $0 {\n    \n}', kind: 'snippet', info: { de: 'Eine neue Klasse - der Bauplan für Objekte.', en: 'A new class - the blueprint for objects.' } },
  { label: 'sout', insert: 'System.out.println($0);', kind: 'snippet', info: { de: 'Kürzel für System.out.println (wie in IntelliJ).', en: 'Shortcut for System.out.println (as in IntelliJ).' } },
  { label: 'if', insert: 'if ($0) {\n    \n}', kind: 'snippet', info: { de: 'Die Bedingung muss ein boolean sein - „truthy“ gibt es in Java nicht.', en: 'The condition must be a boolean - Java has no “truthy”.' } },
  { label: 'ifelse', insert: 'if ($0) {\n    \n} else {\n    \n}', kind: 'snippet', info: { de: 'if mit else-Zweig.', en: 'if with an else branch.' } },
  { label: 'for', insert: 'for (int i = 0; i < $0; i++) {\n    \n}', kind: 'snippet', info: { de: 'Zählschleife.', en: 'Counting loop.' } },
  { label: 'foreach', insert: 'for (String item : $0) {\n    \n}', kind: 'snippet', info: { de: 'Erweiterte for-Schleife über Arrays und Listen.', en: 'Enhanced for loop over arrays and lists.' } },
  { label: 'while', insert: 'while ($0) {\n    \n}', kind: 'snippet', info: { de: 'Wiederholen, solange die Bedingung gilt.', en: 'Repeat while the condition holds.' } },
  { label: 'switch', insert: 'switch ($0) {\n    case 1 -> System.out.println("eins");\n    default -> System.out.println("andere");\n}', kind: 'snippet', info: { de: 'switch mit Pfeil (ab Java 14) - kein break nötig.', en: 'Arrow switch (Java 14+) - no break needed.' } },
  { label: 'trycatch', insert: 'try {\n    $0\n} catch (Exception e) {\n    System.out.println(e.getMessage());\n}', kind: 'snippet', info: { de: 'Fehler abfangen.', en: 'Catch errors.' } },

  // --- Typen -----------------------------------------------------------------
  { label: 'int', insert: 'int $0 = ', kind: 'keyword', info: { de: 'Ganze Zahl (-2.147.483.648 bis 2.147.483.647).', en: 'Whole number (-2,147,483,648 to 2,147,483,647).' } },
  { label: 'double', insert: 'double $0 = ', kind: 'keyword', info: { de: 'Kommazahl.', en: 'Decimal number.' } },
  { label: 'boolean', insert: 'boolean $0 = ', kind: 'keyword', info: { de: 'true oder false - sonst nichts.', en: 'true or false - nothing else.' } },
  { label: 'char', insert: "char $0 = '';", kind: 'keyword', info: { de: 'Ein einzelnes Zeichen in einfachen Anführungszeichen.', en: 'A single character in single quotes.' } },
  { label: 'long', insert: 'long $0 = ', kind: 'keyword', info: { de: 'Sehr große ganze Zahl.', en: 'Very large whole number.' } },
  { label: 'String', insert: 'String $0 = "";', kind: 'keyword', info: { de: 'Text. Groß geschrieben, weil String eine Klasse ist.', en: 'Text. Capitalized, because String is a class.' } },
  { label: 'var', insert: 'var $0 = ', kind: 'keyword', info: { de: 'Typ wird aus dem Wert abgeleitet (ab Java 10) - trotzdem fest.', en: 'Type inferred from the value (Java 10+) - still fixed.' } },
  { label: 'final', insert: 'final $0', kind: 'keyword', info: { de: 'Wert darf nicht mehr geändert werden (wie const).', en: 'Value cannot be reassigned (like const).' } },
  { label: 'static', insert: 'static $0', kind: 'keyword', info: { de: 'Gehört der Klasse, nicht einem Objekt.', en: 'Belongs to the class, not to an object.' } },
  { label: 'new', insert: 'new $0()', kind: 'keyword', info: { de: 'Erzeugt ein Objekt aus einer Klasse.', en: 'Creates an object from a class.' } },
  { label: 'return', insert: 'return $0;', kind: 'keyword', info: { de: 'Beendet die Methode und gibt einen Wert zurück.', en: 'Ends the method and returns a value.' } },
  { label: 'true', kind: 'keyword', info: { de: 'boolean: wahr.', en: 'boolean: true.' } },
  { label: 'false', kind: 'keyword', info: { de: 'boolean: falsch.', en: 'boolean: false.' } },
  { label: 'null', kind: 'keyword', info: { de: '„Kein Objekt“. Nur bei Klassen möglich, nie bei int oder boolean.', en: '“No object”. Only for classes, never for int or boolean.' } },

  // --- Klassen der Standardbibliothek ---------------------------------------
  { label: 'ArrayList', insert: 'ArrayList<String> $0 = new ArrayList<>();', kind: 'function', info: { de: 'Liste, die mitwächst - anders als ein Array.', en: 'A list that grows - unlike an array.' } },
  { label: 'HashMap', insert: 'HashMap<String, Integer> $0 = new HashMap<>();', kind: 'function', info: { de: 'Zuordnung Schlüssel → Wert.', en: 'Mapping from key to value.' } },
  { label: 'StringBuilder', insert: 'StringBuilder $0 = new StringBuilder();', kind: 'function', info: { de: 'Strings effizient zusammenbauen.', en: 'Build strings efficiently.' } },
  { label: 'Math.max', insert: 'Math.max($0)', kind: 'function', info: { de: 'Die größere von zwei Zahlen.', en: 'The larger of two numbers.' } },
  { label: 'Math.min', insert: 'Math.min($0)', kind: 'function', info: { de: 'Die kleinere von zwei Zahlen.', en: 'The smaller of two numbers.' } },
  { label: 'Math.abs', insert: 'Math.abs($0)', kind: 'function', info: { de: 'Betrag (immer positiv).', en: 'Absolute value (always positive).' } },
  { label: 'Math.round', insert: 'Math.round($0)', kind: 'function', info: { de: 'Rundet zur nächsten ganzen Zahl.', en: 'Rounds to the nearest whole number.' } },
  { label: 'Math.random', insert: 'Math.random()', kind: 'function', info: { de: 'Zufallszahl zwischen 0.0 und 1.0.', en: 'Random number between 0.0 and 1.0.' } },
  { label: 'Integer.parseInt', insert: 'Integer.parseInt($0)', kind: 'function', info: { de: 'Text zu int. Wirft NumberFormatException, wenn es nicht passt.', en: 'Text to int. Throws NumberFormatException if it does not fit.' } },
  { label: 'Double.parseDouble', insert: 'Double.parseDouble($0)', kind: 'function', info: { de: 'Text zu double.', en: 'Text to double.' } },
  { label: 'String.valueOf', insert: 'String.valueOf($0)', kind: 'function', info: { de: 'Beliebigen Wert zu Text.', en: 'Any value to text.' } },
  { label: 'String.format', insert: 'String.format("%s", $0)', kind: 'function', info: { de: 'Formatierten String bauen (statt ausgeben).', en: 'Build a formatted string (instead of printing).' } },
  { label: 'Arrays.toString', insert: 'Arrays.toString($0)', kind: 'function', info: { de: 'Array lesbar ausgeben - sonst kommt [I@1b6d nur Müll.', en: 'Print an array readably - otherwise you only get [I@1b6d.' } },
  { label: 'Arrays.sort', insert: 'Arrays.sort($0)', kind: 'function', info: { de: 'Sortiert das Array an Ort und Stelle.', en: 'Sorts the array in place.' } },
  { label: 'List.of', insert: 'List.of($0)', kind: 'function', info: { de: 'Feste, unveränderliche Liste.', en: 'A fixed, unmodifiable list.' } },
  { label: 'throw', insert: 'throw new IllegalArgumentException("$0");', kind: 'snippet', info: { de: 'Fehler auslösen.', en: 'Throw an error.' } },

  // --- Methoden (nach einem Punkt) -------------------------------------------
  { label: '.length', insert: 'length', kind: 'method', info: { de: 'Array: Anzahl Felder. Achtung - ohne Klammern!', en: 'Array: number of slots. Careful - no parentheses!' } },
  { label: '.length()', insert: 'length()', kind: 'method', info: { de: 'String: Anzahl Zeichen - hier MIT Klammern.', en: 'String: number of characters - here WITH parentheses.' } },
  { label: '.size', insert: 'size()', kind: 'method', info: { de: 'Liste/Map: Anzahl Einträge.', en: 'List/map: number of entries.' } },
  { label: '.equals', insert: 'equals($0)', kind: 'method', info: { de: 'Inhalt vergleichen. Bei Objekten immer equals statt ==!', en: 'Compare content. For objects always use equals instead of ==!' } },
  { label: '.charAt', insert: 'charAt($0)', kind: 'method', info: { de: 'String: Zeichen an Position (0-basiert).', en: 'String: character at an index (0-based).' } },
  { label: '.substring', insert: 'substring($0)', kind: 'method', info: { de: 'String: Ausschnitt ab Position (optional bis).', en: 'String: section from an index (optionally to).' } },
  { label: '.toUpperCase', insert: 'toUpperCase()', kind: 'method', info: { de: 'String: in Großbuchstaben (neuer String!).', en: 'String: to upper case (a new string!).' } },
  { label: '.toLowerCase', insert: 'toLowerCase()', kind: 'method', info: { de: 'String: in Kleinbuchstaben.', en: 'String: to lower case.' } },
  { label: '.trim', insert: 'trim()', kind: 'method', info: { de: 'String: Leerzeichen am Rand entfernen.', en: 'String: remove whitespace at the edges.' } },
  { label: '.contains', insert: 'contains($0)', kind: 'method', info: { de: 'String/Liste: enthält …?', en: 'String/list: contains …?' } },
  { label: '.split', insert: 'split("$0")', kind: 'method', info: { de: 'String: in ein String[] zerlegen.', en: 'String: split into a String[].' } },
  { label: '.isEmpty', insert: 'isEmpty()', kind: 'method', info: { de: 'String/Liste: leer?', en: 'String/list: empty?' } },
  { label: '.add', insert: 'add($0)', kind: 'method', info: { de: 'Liste: Element anhängen.', en: 'List: append an element.' } },
  { label: '.get', insert: 'get($0)', kind: 'method', info: { de: 'Liste: Element an Position. Map: Wert zum Schlüssel.', en: 'List: element at an index. Map: value for a key.' } },
  { label: '.put', insert: 'put($0, )', kind: 'method', info: { de: 'Map: Schlüssel → Wert eintragen.', en: 'Map: store key → value.' } },
  { label: '.remove', insert: 'remove($0)', kind: 'method', info: { de: 'Liste/Map: Eintrag entfernen.', en: 'List/map: remove an entry.' } },
  { label: '.containsKey', insert: 'containsKey($0)', kind: 'method', info: { de: 'Map: gibt es den Schlüssel?', en: 'Map: does the key exist?' } },
  { label: '.keySet', insert: 'keySet()', kind: 'method', info: { de: 'Map: alle Schlüssel (zum Durchlaufen).', en: 'Map: all keys (for iterating).' } },
  { label: '.getMessage', insert: 'getMessage()', kind: 'method', info: { de: 'Exception: der Text, der beim Werfen mitgegeben wurde.', en: 'Exception: the text passed when it was thrown.' } },
  { label: '.toString', insert: 'toString()', kind: 'method', info: { de: 'Objekt als Text. Eigene Klassen sollten sie überschreiben.', en: 'Object as text. Your own classes should override it.' } },
  { label: '.append', insert: 'append($0)', kind: 'method', info: { de: 'StringBuilder: anhängen.', en: 'StringBuilder: append.' } },
  { label: '.stream', insert: 'stream()', kind: 'method', info: { de: 'Liste: Strom für filter/map/… - Javas Gegenstück zu Array-Methoden.', en: 'List: a stream for filter/map/… - Java’s counterpart to array methods.' } },
]

/** Alle Vorschläge für einen Editor, aufgelöst in der Oberflächensprache. */
export function suggestionsFor(editor: EditorLanguage, language: Sprache): Suggestion[] {
  const entries =
    editor === 'java' ? JAVA
      : editor === 'spring' ? [...SPRING, ...JAVA]
      : editor === 'docker' ? DOCKERFILE
      : editor === 'yaml' ? COMPOSE
      : editor === 'properties' ? []
      : editor === 'sql' ? SQL
      : editor === 'react' ? [...REACT, ...JAVASCRIPT]
      : editor === 'ts' ? [...TYPESCRIPT, ...JAVASCRIPT]
      : JAVASCRIPT
  return entries.map((e) => ({ ...e, info: e.info[language] }))
}

const NO_VARIABLES = new Set(
  'const let var function return if else for while do switch case break continue default new class extends import from export async await try catch finally throw typeof instanceof in of this true false null undefined'.split(
    ' ',
  ),
)

/**
 * Sucht passende Vorschläge für das Wort vor dem Cursor.
 * Rückgabe: die Treffer und wie viele Zeichen vor dem Cursor ersetzt werden.
 */
export function search(
  alle: Suggestion[],
  code: string,
  word: string,
  infoInCode: string,
): { hits: Suggestion[]; replaceChars: number } {
  const lower = word.toLowerCase()
  const point = word.lastIndexOf('.')

  // Nach einem Punkt: erst bekannte "objekt.methode"-Einträge (console.lo → console.log) …
  if (point >= 0) {
    const exactHits = alle.filter((v) => !v.label.startsWith('.') && v.label.toLowerCase().startsWith(lower))
    if (exactHits.length) return { hits: exactHits, replaceChars: word.length }

    // … sonst allgemeine Methoden hinter beliebigen Werten (liste.fi → filter)
    const part = lower.slice(point + 1)
    const methods = alle.filter((v) => v.label.startsWith('.') && v.label.slice(1).toLowerCase().startsWith(part))
    return { hits: methods, replaceChars: part.length }
  }

  // Leeres Wort (Strg+Leertaste) zeigt alles, Zahlen und Sonderzeichen nichts.
  // `@` starts an annotation (Spring: @GetMapping).
  if (word && !/^[A-Za-z_$@]/.test(word)) return { hits: [], replaceChars: 0 }

  const isStatic = alle.filter((v) => !v.label.startsWith('.'))
  const starts = isStatic.filter((v) => v.label.toLowerCase().startsWith(lower))
  const contains = lower.length >= 3 ? isStatic.filter((v) => !starts.includes(v) && v.label.toLowerCase().includes(lower)) : []

  // Namen, die schon im Code stehen (Variablen, Funktionen, Komponenten)
  const known = new Set(alle.map((v) => v.label))
  const frequency = new Map<string, number>()
  for (const [name] of code.matchAll(/[A-Za-z_$][\w$]{2,}/g)) {
    frequency.set(name, (frequency.get(name) ?? 0) + 1)
  }
  const ausCode: Suggestion[] = [...frequency]
    // Das gerade getippte Wort selbst taucht einmal auf - das ist kein Vorschlag.
    .filter(([name, count]) => !(name === word && count === 1))
    .filter(([name]) => !known.has(name) && !NO_VARIABLES.has(name) && name.toLowerCase().startsWith(lower))
    .map(([name]) => ({ label: name, kind: 'variable', info: infoInCode }))

  const hits = [...starts, ...ausCode, ...contains]
    // Was genau so schon dasteht, braucht keinen Vorschlag.
    .filter((v) => !(v.label === word && (v.insert ?? v.label) === word))

  return { hits, replaceChars: word.length }
}
