import { laden, type Teil } from './typen'

export const sqlTeil: Teil = {
  id: 'sql',
  nummer: 9,
  titel: { de: 'Datenbanken: SQL mit PostgreSQL', en: 'Databases: SQL with PostgreSQL' },
  kurztitel: { de: 'PostgreSQL', en: 'PostgreSQL' },
  bereich: 'backend',
  beschreibung: {
    de: 'Die Sprache der Datenbanken: abfragen, filtern, gruppieren, Tabellen verbinden, Daten ändern und Tabellen entwerfen. Alles läuft auf echtem PostgreSQL direkt im Browser - mit einer fertigen Shop-Datenbank, die bei jedem Lauf frisch startet.',
    en: 'The language of databases: querying, filtering, grouping, joining tables, changing data and designing tables. Everything runs on real PostgreSQL right in the browser - with a ready-made shop database that starts fresh on every run.',
  },
  kapitel: [
    {
      id: 'sql-start',
      titel: { de: 'Tabellen & SELECT', en: 'Tables & SELECT' },
      kurz: {
        de: 'Was eine relationale Datenbank ist, die Beispieldatenbank - und die ersten Abfragen.',
        en: 'What a relational database is, the example database - and the first queries.',
      },
      dauer: 30,
      lernziele: {
        de: ['Tabellen, Zeilen, Spalten und Schlüssel erklären', 'Spalten mit SELECT auswählen und umbenennen', 'Ergebnisse mit ORDER BY und LIMIT sortieren und begrenzen', 'Mit psql und \\d eine Datenbank erkunden'],
        en: ['Explain tables, rows, columns and keys', 'Select and rename columns with SELECT', 'Sort and limit results with ORDER BY and LIMIT', 'Explore a database with psql and \\d'],
      },
      stichworte: ['SQL', 'PostgreSQL', 'Postgres', 'database', 'Datenbank', 'relational', 'table', 'Tabelle', 'SELECT', 'FROM', 'AS', 'ORDER BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'psql', 'PGlite', 'primary key', 'Primärschlüssel'],
      Komponente: {
        de: laden(() => import('../sql/Start'), 'Start'),
        en: laden(() => import('../sql/Start.en'), 'Start'),
      },
    },
    {
      id: 'sql-where',
      titel: { de: 'Filtern mit WHERE', en: 'Filtering with WHERE' },
      kurz: {
        de: 'Vergleiche, AND/OR, IN, BETWEEN, LIKE - und der Sonderfall NULL.',
        en: 'Comparisons, AND/OR, IN, BETWEEN, LIKE - and the special case NULL.',
      },
      dauer: 30,
      lernziele: {
        de: ['Zeilen mit Vergleichen und AND/OR filtern', 'IN, BETWEEN, LIKE und ILIKE einsetzen', 'NULL mit IS NULL und COALESCE richtig behandeln', 'Werte mit CASE einteilen'],
        en: ['Filter rows with comparisons and AND/OR', 'Use IN, BETWEEN, LIKE and ILIKE', 'Handle NULL correctly with IS NULL and COALESCE', 'Classify values with CASE'],
      },
      stichworte: ['WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'NULL', 'IS NULL', 'COALESCE', 'CASE', 'filter', 'Filter'],
      Komponente: {
        de: laden(() => import('../sql/Where'), 'Where'),
        en: laden(() => import('../sql/Where.en'), 'Where'),
      },
    },
    {
      id: 'sql-gruppieren',
      titel: { de: 'Zählen & Gruppieren', en: 'Counting & Grouping' },
      kurz: {
        de: 'count, sum und avg, GROUP BY und HAVING - Auswertungen in einer Abfrage.',
        en: 'count, sum and avg, GROUP BY and HAVING - reports in one query.',
      },
      dauer: 35,
      lernziele: {
        de: ['Aggregatfunktionen wie count, sum und avg anwenden', 'Mit GROUP BY pro Gruppe rechnen', 'WHERE und HAVING unterscheiden', 'Die Reihenfolge kennen, in der eine Abfrage ausgewertet wird'],
        en: ['Use aggregate functions like count, sum and avg', 'Compute per group with GROUP BY', 'Tell WHERE and HAVING apart', 'Know the order in which a query is evaluated'],
      },
      stichworte: ['GROUP BY', 'HAVING', 'aggregate', 'Aggregat', 'count', 'sum', 'avg', 'min', 'max', 'round', 'date_trunc', 'extract', 'string_agg'],
      Komponente: {
        de: laden(() => import('../sql/Gruppieren'), 'Gruppieren'),
        en: laden(() => import('../sql/Gruppieren.en'), 'Gruppieren'),
      },
    },
    {
      id: 'sql-joins',
      titel: { de: 'Tabellen verbinden: JOIN', en: 'Joining Tables: JOIN' },
      kurz: {
        de: 'Primär- und Fremdschlüssel, INNER und LEFT JOIN - und Abfragen über vier Tabellen.',
        en: 'Primary and foreign keys, INNER and LEFT JOIN - and queries across four tables.',
      },
      dauer: 40,
      lernziele: {
        de: ['Beziehungen über Fremdschlüssel verstehen', 'Tabellen mit JOIN … ON verbinden', 'Mit LEFT JOIN auch Zeilen ohne Partner finden', 'JOIN und GROUP BY für Auswertungen kombinieren'],
        en: ['Understand relationships through foreign keys', 'Connect tables with JOIN … ON', 'Find rows without a partner with LEFT JOIN', 'Combine JOIN and GROUP BY for reports'],
      },
      stichworte: ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'ON', 'USING', 'foreign key', 'Fremdschlüssel', 'relationship', 'Beziehung', 'alias', 'n:m'],
      Komponente: {
        de: laden(() => import('../sql/Joins'), 'Joins'),
        en: laden(() => import('../sql/Joins.en'), 'Joins'),
      },
    },
    {
      id: 'sql-aendern',
      titel: { de: 'Daten ändern & Transaktionen', en: 'Changing Data & Transactions' },
      kurz: {
        de: 'INSERT, UPDATE und DELETE sicher einsetzen - und mit BEGIN/ROLLBACK alles oder nichts.',
        en: 'Use INSERT, UPDATE and DELETE safely - and all or nothing with BEGIN/ROLLBACK.',
      },
      dauer: 35,
      lernziele: {
        de: ['Zeilen mit INSERT einfügen und mit RETURNING zurückbekommen', 'Zeilen mit UPDATE und DELETE gezielt ändern', 'Fehlermeldungen von Constraints lesen', 'Änderungen in Transaktionen bündeln'],
        en: ['Insert rows with INSERT and get them back with RETURNING', 'Change rows precisely with UPDATE and DELETE', 'Read error messages from constraints', 'Bundle changes in transactions'],
      },
      stichworte: ['INSERT', 'UPDATE', 'DELETE', 'RETURNING', 'transaction', 'Transaktion', 'BEGIN', 'COMMIT', 'ROLLBACK', 'ACID', 'constraint', 'ON CONFLICT', 'upsert'],
      Komponente: {
        de: laden(() => import('../sql/Aendern'), 'Aendern'),
        en: laden(() => import('../sql/Aendern.en'), 'Aendern'),
      },
    },
    {
      id: 'sql-tabellen',
      titel: { de: 'Tabellen entwerfen: CREATE TABLE', en: 'Designing Tables: CREATE TABLE' },
      kurz: {
        de: 'Datentypen, Schlüssel und Constraints, ALTER TABLE - und Indizes für schnelle Abfragen.',
        en: 'Data types, keys and constraints, ALTER TABLE - and indexes for fast queries.',
      },
      dauer: 40,
      lernziele: {
        de: ['Tabellen mit passenden Datentypen anlegen', 'Regeln mit PRIMARY KEY, REFERENCES, NOT NULL, UNIQUE und CHECK festlegen', 'Tabellen mit ALTER TABLE ändern', 'Mit EXPLAIN sehen, wann ein Index hilft'],
        en: ['Create tables with fitting data types', 'Set rules with PRIMARY KEY, REFERENCES, NOT NULL, UNIQUE and CHECK', 'Change tables with ALTER TABLE', 'See with EXPLAIN when an index helps'],
      },
      stichworte: ['CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'data type', 'Datentyp', 'PRIMARY KEY', 'REFERENCES', 'NOT NULL', 'UNIQUE', 'CHECK', 'DEFAULT', 'IDENTITY', 'index', 'Index', 'CREATE INDEX', 'EXPLAIN', 'numeric', 'jsonb', 'normalization', 'Normalisierung'],
      Komponente: {
        de: laden(() => import('../sql/Tabellen'), 'Tabellen'),
        en: laden(() => import('../sql/Tabellen.en'), 'Tabellen'),
      },
    },
    {
      id: 'sql-profi',
      titel: { de: 'Unterabfragen, CTEs & Window Functions', en: 'Subqueries, CTEs & Window Functions' },
      kurz: {
        de: 'Abfragen in Abfragen, WITH für Lesbarkeit, Ranglisten und laufende Summen.',
        en: 'Queries inside queries, WITH for readability, rankings and running totals.',
      },
      dauer: 40,
      lernziele: {
        de: ['Unterabfragen in WHERE und FROM einsetzen', 'Lange Abfragen mit WITH in Schritte zerlegen', 'Mit Window Functions Ranglisten und laufende Summen bilden', 'Abfragen als View speichern'],
        en: ['Use subqueries in WHERE and FROM', 'Split long queries into steps with WITH', 'Build rankings and running totals with window functions', 'Save queries as a view'],
      },
      stichworte: ['subquery', 'Unterabfrage', 'EXISTS', 'CTE', 'WITH', 'window function', 'OVER', 'PARTITION BY', 'rank', 'row_number', 'running total', 'laufende Summe', 'VIEW', 'CREATE VIEW', 'UNION'],
      Komponente: {
        de: laden(() => import('../sql/Profi'), 'Profi'),
        en: laden(() => import('../sql/Profi.en'), 'Profi'),
      },
    },
  ],
}
