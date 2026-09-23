import { SHOP_TABELLEN } from '../sql/dataset'
import type { Eintrag } from './vorschlaege'

/**
 * Editor suggestions for part 9 (PostgreSQL): keywords, functions, the tables and
 * columns of the example database - and after a dot (`c.na`) the columns again,
 * for table aliases. The search ignores case, so `sel` finds SELECT.
 */

const k = (label: string, de: string, en: string, einfuegen?: string): Eintrag => ({ label, einfuegen, art: 'keyword', info: { de, en } })
const f = (label: string, de: string, en: string, einfuegen = `${label}($0)`): Eintrag => ({ label, einfuegen, art: 'funktion', info: { de, en } })
const s = (label: string, einfuegen: string, de: string, en: string): Eintrag => ({ label, einfuegen, art: 'snippet', info: { de, en } })

const KEYWORDS: Eintrag[] = [
  // --- Reading -------------------------------------------------------------------
  s('SELECT', 'SELECT $0\nFROM ', 'Spalten lesen: SELECT spalten FROM tabelle', 'Read columns: SELECT columns FROM table'),
  k('FROM', 'Aus welcher Tabelle gelesen wird.', 'Which table is read.', 'FROM $0'),
  k('WHERE', 'Nur Zeilen, für die die Bedingung wahr ist.', 'Only rows for which the condition is true.', 'WHERE $0'),
  k('ORDER BY', 'Sortieren - ASC aufsteigend (Standard), DESC absteigend.', 'Sort - ASC ascending (default), DESC descending.', 'ORDER BY $0'),
  k('LIMIT', 'Höchstens so viele Zeilen.', 'At most this many rows.', 'LIMIT $0'),
  k('OFFSET', 'So viele Zeilen überspringen (Seiten blättern).', 'Skip this many rows (paging).', 'OFFSET $0'),
  k('DISTINCT', 'Doppelte Zeilen entfernen.', 'Remove duplicate rows.', 'DISTINCT '),
  k('AS', 'Neuer Name für Spalte oder Tabelle.', 'A new name for a column or table.', 'AS '),
  k('DESC', 'Absteigend sortieren.', 'Sort descending.'),
  k('ASC', 'Aufsteigend sortieren.', 'Sort ascending.'),
  k('NULLS LAST', 'NULL-Werte beim Sortieren ans Ende.', 'NULL values to the end when sorting.'),
  // --- Conditions ----------------------------------------------------------------
  k('AND', 'Beide Bedingungen müssen stimmen.', 'Both conditions must be true.'),
  k('OR', 'Eine der Bedingungen reicht.', 'One of the conditions is enough.'),
  k('NOT', 'Verneint eine Bedingung.', 'Negates a condition.'),
  k('IN', 'Wert aus einer Liste: status IN (\'open\', \'paid\')', 'A value from a list: status IN (\'open\', \'paid\')', 'IN ($0)'),
  k('BETWEEN', 'Bereich inklusive beider Grenzen: price BETWEEN 10 AND 50', 'A range including both ends: price BETWEEN 10 AND 50', 'BETWEEN $0 AND '),
  k('LIKE', 'Textmuster: % beliebig viele Zeichen, _ genau eins.', 'A text pattern: % any number of characters, _ exactly one.', "LIKE '$0'"),
  k('ILIKE', 'Wie LIKE, aber ohne Groß-/Kleinschreibung (PostgreSQL).', 'Like LIKE, but ignoring case (PostgreSQL).', "ILIKE '$0'"),
  k('IS NULL', 'Ist der Wert leer? (= NULL funktioniert nicht!)', 'Is the value empty? (= NULL does not work!)'),
  k('IS NOT NULL', 'Ist ein Wert vorhanden?', 'Is there a value?'),
  s('CASE', 'CASE\n  WHEN $0 THEN \n  ELSE \nEND', 'Wenn-dann in einer Abfrage.', 'If-then inside a query.'),
  k('EXISTS', 'Gibt die Unterabfrage mindestens eine Zeile zurück?', 'Does the subquery return at least one row?', 'EXISTS (\n  SELECT 1 FROM $0\n)'),
  // --- Grouping ------------------------------------------------------------------
  k('GROUP BY', 'Zeilen mit gleichem Wert zu einer Gruppe zusammenfassen.', 'Combine rows with the same value into one group.', 'GROUP BY $0'),
  k('HAVING', 'Filter NACH dem Gruppieren - für Aggregate wie count(*).', 'A filter AFTER grouping - for aggregates like count(*).', 'HAVING $0'),
  // --- Joins ---------------------------------------------------------------------
  k('JOIN', 'Tabellen verbinden (INNER JOIN): nur Zeilen mit Partner.', 'Join tables (INNER JOIN): only rows with a partner.', 'JOIN $0 ON '),
  k('LEFT JOIN', 'Alle Zeilen der linken Tabelle, rechts NULL, wenn es keinen Partner gibt.', 'All rows of the left table, NULL on the right if there is no partner.', 'LEFT JOIN $0 ON '),
  k('ON', 'Die Verbindungsbedingung eines JOIN.', 'The condition of a JOIN.', 'ON $0'),
  k('USING', 'JOIN über gleichnamige Spalten.', 'JOIN on columns with the same name.', 'USING ($0)'),
  k('UNION', 'Ergebnisse untereinander hängen (ohne Duplikate; UNION ALL mit).', 'Stack results (without duplicates; UNION ALL with them).'),
  s('WITH', 'WITH $0 AS (\n  SELECT \n)\nSELECT * FROM ', 'Common Table Expression: eine benannte Zwischenabfrage.', 'Common table expression: a named intermediate query.'),
  k('OVER', 'Window Function: rechnet über andere Zeilen, ohne sie zusammenzufassen.', 'Window function: computes over other rows without collapsing them.', 'OVER ($0)'),
  k('PARTITION BY', 'Fenster in Gruppen teilen.', 'Split the window into groups.', 'PARTITION BY $0'),
  // --- Changing data -------------------------------------------------------------
  s('INSERT INTO', 'INSERT INTO $0 ()\nVALUES ();', 'Neue Zeilen einfügen.', 'Insert new rows.'),
  k('VALUES', 'Die Werte der neuen Zeile(n).', 'The values of the new row(s).', 'VALUES ($0)'),
  k('RETURNING', 'Nach INSERT/UPDATE/DELETE die betroffenen Zeilen zurückgeben.', 'Return the affected rows after INSERT/UPDATE/DELETE.', 'RETURNING $0'),
  s('UPDATE', 'UPDATE $0\nSET \nWHERE ;', 'Zeilen ändern - WHERE nie vergessen!', 'Change rows - never forget WHERE!'),
  k('SET', 'Neue Werte bei UPDATE.', 'New values in UPDATE.', 'SET $0'),
  s('DELETE FROM', 'DELETE FROM $0\nWHERE ;', 'Zeilen löschen - WHERE nie vergessen!', 'Delete rows - never forget WHERE!'),
  k('BEGIN', 'Transaktion starten: alles oder nichts.', 'Start a transaction: all or nothing.', 'BEGIN;'),
  k('COMMIT', 'Transaktion abschließen - Änderungen gelten.', 'Finish the transaction - the changes count.', 'COMMIT;'),
  k('ROLLBACK', 'Transaktion zurückrollen - als wäre nichts passiert.', 'Roll the transaction back - as if nothing happened.', 'ROLLBACK;'),
  k('ON CONFLICT', 'Upsert: was tun, wenn der Schlüssel schon existiert.', 'Upsert: what to do if the key already exists.', 'ON CONFLICT ($0) DO '),
  // --- Tables --------------------------------------------------------------------
  s('CREATE TABLE', 'CREATE TABLE $0 (\n  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  \n);', 'Neue Tabelle anlegen.', 'Create a new table.'),
  k('ALTER TABLE', 'Tabelle ändern: ADD COLUMN, DROP COLUMN, RENAME …', 'Change a table: ADD COLUMN, DROP COLUMN, RENAME …', 'ALTER TABLE $0 '),
  k('ADD COLUMN', 'Spalte hinzufügen.', 'Add a column.', 'ADD COLUMN $0'),
  k('DROP TABLE', 'Tabelle samt Daten löschen.', 'Delete a table with its data.', 'DROP TABLE $0;'),
  s('CREATE INDEX', 'CREATE INDEX ON $0 ();', 'Index: schneller suchen, etwas langsamer schreiben.', 'An index: faster searching, slightly slower writing.'),
  s('CREATE VIEW', 'CREATE VIEW $0 AS\nSELECT ', 'Gespeicherte Abfrage, die man wie eine Tabelle liest.', 'A stored query you read like a table.'),
  k('PRIMARY KEY', 'Eindeutiger Schlüssel jeder Zeile.', 'The unique key of every row.'),
  k('REFERENCES', 'Fremdschlüssel: der Wert muss in der anderen Tabelle existieren.', 'A foreign key: the value must exist in the other table.', 'REFERENCES $0 (id)'),
  k('NOT NULL', 'Wert ist Pflicht.', 'A value is required.'),
  k('UNIQUE', 'Kein Wert darf doppelt vorkommen.', 'No value may occur twice.'),
  k('CHECK', 'Bedingung, die jede Zeile erfüllen muss.', 'A condition every row must meet.', 'CHECK ($0)'),
  k('DEFAULT', 'Wert, wenn beim INSERT keiner angegeben wird.', 'The value if none is given in the INSERT.', 'DEFAULT $0'),
  k('GENERATED ALWAYS AS IDENTITY', 'Automatisch hochzählende id.', 'An automatically increasing id.'),
  k('EXPLAIN', 'Zeigt, wie PostgreSQL die Abfrage ausführen will.', 'Shows how PostgreSQL plans to run the query.', 'EXPLAIN $0'),
  // --- Types ---------------------------------------------------------------------
  k('integer', 'Ganze Zahl (bis ±2,1 Milliarden).', 'A whole number (up to ±2.1 billion).'),
  k('bigint', 'Große ganze Zahl.', 'A big whole number.'),
  k('numeric', 'Exakte Dezimalzahl - für Geld: numeric(10, 2)', 'An exact decimal - for money: numeric(10, 2)', 'numeric($0)'),
  k('text', 'Text beliebiger Länge.', 'Text of any length.'),
  k('varchar', 'Text mit Höchstlänge.', 'Text with a maximum length.', 'varchar($0)'),
  k('boolean', 'true oder false.', 'true or false.'),
  k('date', 'Datum ohne Uhrzeit.', 'A date without time.'),
  k('timestamptz', 'Zeitpunkt mit Zeitzone.', 'A point in time with time zone.'),
  k('jsonb', 'JSON, binär gespeichert und durchsuchbar.', 'JSON, stored binary and searchable.'),
]

const FUNCTIONS: Eintrag[] = [
  f('count', 'Anzahl: count(*) alle Zeilen, count(spalte) ohne NULL.', 'Count: count(*) all rows, count(column) without NULL.', 'count(*)'),
  f('sum', 'Summe.', 'Sum.'),
  f('avg', 'Durchschnitt.', 'Average.'),
  f('min', 'Kleinster Wert.', 'Smallest value.'),
  f('max', 'Größter Wert.', 'Largest value.'),
  f('round', 'Runden: round(wert, 2)', 'Round: round(value, 2)', 'round($0, 2)'),
  f('coalesce', 'Erster Wert, der nicht NULL ist: coalesce(city, \'?\')', 'The first value that is not NULL: coalesce(city, \'?\')'),
  f('nullif', 'NULL, wenn beide Werte gleich sind (gegen Division durch 0).', 'NULL if both values are equal (against division by 0).'),
  f('lower', 'Text in Kleinbuchstaben.', 'Text in lower case.'),
  f('upper', 'Text in Großbuchstaben.', 'Text in upper case.'),
  f('length', 'Länge eines Textes.', 'Length of a text.'),
  f('concat', 'Texte verbinden (NULL wird ignoriert). Auch: a || b', 'Join texts (NULL is ignored). Also: a || b'),
  f('substring', 'Teil eines Textes.', 'Part of a text.'),
  f('split_part', "Stück eines Textes: split_part(email, '@', 2)", "A piece of a text: split_part(email, '@', 2)"),
  f('now', 'Aktueller Zeitpunkt.', 'The current point in time.', 'now()'),
  k('current_date', 'Heutiges Datum.', 'Today’s date.'),
  f('extract', "Teil eines Datums: extract(month FROM ordered_at)", 'Part of a date: extract(month FROM ordered_at)', 'extract($0 FROM )'),
  f('date_trunc', "Datum abschneiden: date_trunc('month', ordered_at)", "Truncate a date: date_trunc('month', ordered_at)", "date_trunc('$0', )"),
  f('to_char', "Formatieren: to_char(ordered_at, 'YYYY-MM')", "Format: to_char(ordered_at, 'YYYY-MM')", "to_char($0, 'YYYY-MM')"),
  f('age', 'Zeitspanne bis heute.', 'The time span until today.'),
  f('string_agg', "Texte einer Gruppe verbinden: string_agg(name, ', ')", "Join the texts of a group: string_agg(name, ', ')", "string_agg($0, ', ')"),
  f('row_number', 'Window Function: laufende Nummer.', 'Window function: a running number.', 'row_number() OVER ($0)'),
  f('rank', 'Window Function: Rang mit Lücken bei Gleichstand.', 'Window function: rank with gaps on ties.', 'rank() OVER (ORDER BY $0)'),
  f('lag', 'Window Function: Wert der vorherigen Zeile.', 'Window function: the value of the previous row.'),
]

/** Tables and columns of the example database, taken from SHOP_TABELLEN. */
const SCHEMA: Eintrag[] = [
  ...SHOP_TABELLEN.map((t): Eintrag => ({ label: t.name, art: 'variable', info: { de: `Tabelle: ${t.info.de}`, en: `Table: ${t.info.en}` } })),
  ...[...new Map(SHOP_TABELLEN.flatMap((t) => t.spalten.map((c) => [c.name, t.name] as const))).entries()].flatMap(([column, table]): Eintrag[] => {
    const info = { de: `Spalte (${table}${column === 'id' || column === 'name' ? ' u. a.' : ''})`, en: `Column (${table}${column === 'id' || column === 'name' ? ' and others' : ''})` }
    return [
      { label: column, art: 'variable', info },
      { label: '.' + column, einfuegen: column, art: 'methode', info },
    ]
  }),
]

export const SQL: Eintrag[] = [...KEYWORDS, ...FUNCTIONS, ...SCHEMA]
