import { sql } from '../../lernen/quelltext'
import type { UebungsSammlung } from './typen'

/**
 * Extra exercises for part 9 (PostgreSQL) - graded per chapter:
 * predict -> find the bug -> write freely.
 *
 * Everything runs on the example shop database (src/sql/dataset.ts). The tests
 * compare with the result of the model solution (src/sql/check.ts).
 */

const t = <T>(de: T, en: T) => ({ de, en })

export const uebungen: UebungsSammlung = {
  'sql-start': [
    {
      id: 'sql-start-vorhersage-limit',
      stufe: 'vorhersage',
      titel: t('Welche Zeilen kommen zurück?', 'Which rows come back?'),
      frage: t(
        'Die Produkte kosten 9.90, 14.90, 29.90, 34.90, 39.50 … Was liefert diese Abfrage?',
        'The products cost 9.90, 14.90, 29.90, 34.90, 39.50 … What does this query return?',
      ),
      code: sql`
        SELECT price
        FROM products
        ORDER BY price
        LIMIT 2 OFFSET 1;
      `,
      antworten: ['9.90, 14.90', '14.90, 29.90', '29.90, 34.90', '14.90'],
      richtig: 1,
      erklaerung: t(
        '`OFFSET 1` überspringt die erste Zeile (9.90), `LIMIT 2` nimmt die nächsten zwei. Beides wirkt erst nach dem Sortieren.',
        '`OFFSET 1` skips the first row (9.90), `LIMIT 2` takes the next two. Both only apply after sorting.',
      ),
    },
    {
      id: 'sql-start-fehler-anfuehrung',
      stufe: 'fehler',
      titel: t('Die Spalte mit dem Leerzeichen', 'The column with the space'),
      aufgabe: t(
        'Die Abfrage soll `name` und den Bruttopreis (`price * 1.19`) unter dem Namen **Gross price** zeigen - mit Leerzeichen und großem G. Sie bricht aber ab. Repariere sie.',
        'The query should show `name` and the gross price (`price * 1.19`) under the name **Gross price** - with a space and a capital G. But it fails. Fix it.',
      ),
      modus: 'sql',
      code: sql`
        SELECT name, price * 1.19 AS 'Gross price'
        FROM products;
      `,
      loesung: sql`
        SELECT name, price * 1.19 AS "Gross price"
        FROM products;
      `,
      tests: [{ name: t('Spalten name und „Gross price“', 'Columns name and “Gross price”'), spalten: true }],
      tipps: t(
        ['Einfache Anführungszeichen stehen in SQL für **Text-Werte**, nicht für Namen.', 'Namen mit Leerzeichen oder Großbuchstaben gehören in doppelte Anführungszeichen: `"Gross price"`.'],
        ['Single quotes in SQL stand for **text values**, not for names.', 'Names with spaces or capital letters belong in double quotes: `"Gross price"`.'],
      ),
    },
    {
      id: 'sql-start-frei-neueste',
      stufe: 'frei',
      titel: t('Die neuesten Kunden', 'The newest customers'),
      aufgabe: t(
        'Zeige die **drei Kunden, die zuletzt dazugekommen sind** (Spalte `joined`): `name`, `country` und `joined`, der neueste zuerst.',
        'Show the **three customers who joined most recently** (column `joined`): `name`, `country` and `joined`, the newest first.',
      ),
      modus: 'sql',
      code: sql`
        SELECT name, country, joined
        FROM customers;
      `,
      loesung: sql`
        SELECT name, country, joined
        FROM customers
        ORDER BY joined DESC
        LIMIT 3;
      `,
      tests: [{ name: t('Die drei neuesten, der neueste zuerst', 'The three newest, the newest first'), reihenfolge: true }],
      tipps: t(['Datumswerte lassen sich sortieren wie Zahlen.', '`ORDER BY joined DESC LIMIT 3`'], ['Dates can be sorted like numbers.', '`ORDER BY joined DESC LIMIT 3`']),
    },
  ],

  'sql-where': [
    {
      id: 'sql-where-vorhersage-null',
      stufe: 'vorhersage',
      titel: t('Wie viele Zeilen?', 'How many rows?'),
      frage: t(
        '12 Kunden, bei einem ist `city` NULL, zwei wohnen in London. Wie viele Zeilen liefert die Abfrage?',
        '12 customers, one has `city` NULL, two live in London. How many rows does the query return?',
      ),
      code: sql`
        SELECT name
        FROM customers
        WHERE city <> 'London';
      `,
      antworten: ['12', '10', '9', '0'],
      richtig: 2,
      erklaerung: t(
        'Für die zwei Londoner ist die Bedingung falsch. Für Joan Clarke ergibt `NULL <> \'London\'` weder wahr noch falsch, sondern NULL - und WHERE behält nur Zeilen mit **wahr**. Bleiben 9.',
        'For the two Londoners the condition is false. For Joan Clarke `NULL <> \'London\'` is neither true nor false but NULL - and WHERE only keeps rows that are **true**. That leaves 9.',
      ),
    },
    {
      id: 'sql-where-fehler-oder',
      stufe: 'fehler',
      titel: t('Zu viele Bestellungen', 'Too many orders'),
      aufgabe: t(
        'Gesucht sind die **offenen oder bezahlten** Bestellungen **von Kunde 2** (Grace Hopper). Die Abfrage liefert aber auch Bestellungen anderer Kunden. Warum?',
        'We want the **open or paid** orders **of customer 2** (Grace Hopper). But the query also returns orders of other customers. Why?',
      ),
      modus: 'sql',
      code: sql`
        SELECT id, customer_id, status
        FROM orders
        WHERE customer_id = 2 AND status = 'open' OR status = 'paid'
        ORDER BY id;
      `,
      loesung: sql`
        SELECT id, customer_id, status
        FROM orders
        WHERE customer_id = 2 AND status IN ('open', 'paid')
        ORDER BY id;
      `,
      tests: [{ name: t('Nur die offenen und bezahlten Bestellungen von Kunde 2', 'Only the open and paid orders of customer 2') }],
      tipps: t(
        ['`AND` bindet stärker als `OR`: gelesen wird `(customer_id = 2 AND status = \'open\') OR status = \'paid\'`.', 'Klammern um das OR - oder gleich `status IN (\'open\', \'paid\')`.'],
        ['`AND` binds more strongly than `OR`: it is read as `(customer_id = 2 AND status = \'open\') OR status = \'paid\'`.', 'Parentheses around the OR - or simply `status IN (\'open\', \'paid\')`.'],
      ),
    },
    {
      id: 'sql-where-frei-kontakt',
      stufe: 'frei',
      titel: t('Kontaktliste mit Lücken', 'Contact list with gaps'),
      aufgabe: t(
        'Für einen Brief-Versand: alle Kunden aus dem **UK** mit `name` und einer Spalte `contact`, in der die E-Mail steht - oder `letter only`, wenn es keine gibt. Nach Name sortiert.',
        'For a mailing: all customers from the **UK** with `name` and a column `contact` holding the email - or `letter only` if there is none. Sorted by name.',
      ),
      modus: 'sql',
      code: sql`
        SELECT name, email
        FROM customers;
      `,
      loesung: sql`
        SELECT name, coalesce(email, 'letter only') AS contact
        FROM customers
        WHERE country = 'UK'
        ORDER BY name;
      `,
      tests: [{ name: t('Vier Kunden aus dem UK, fehlende E-Mail ersetzt, nach Name', 'Four UK customers, missing email replaced, by name'), reihenfolge: true, spalten: true }],
      tipps: t(
        ['`coalesce(a, b)` liefert `a`, außer wenn `a` NULL ist - dann `b`.', 'Vergiss den Spaltennamen nicht: `… AS contact`.'],
        ['`coalesce(a, b)` returns `a`, unless `a` is NULL - then `b`.', 'Do not forget the column name: `… AS contact`.'],
      ),
    },
  ],

  'sql-gruppieren': [
    {
      id: 'sql-gruppieren-vorhersage-count',
      stufe: 'vorhersage',
      titel: t('Drei Zählungen', 'Three counts'),
      frage: t(
        '16 Produkte, 5 davon ohne Lagerbestand (`stock` ist NULL), 5 Kategorien. Was kommt heraus?',
        '16 products, 5 of them without stock (`stock` is NULL), 5 categories. What is the result?',
      ),
      code: sql`
        SELECT count(*), count(stock), count(DISTINCT category)
        FROM products;
      `,
      antworten: ['16, 16, 5', '16, 11, 5', '16, 11, 16', '11, 11, 5'],
      richtig: 1,
      erklaerung: t(
        '`count(*)` zählt Zeilen, `count(stock)` nur Zeilen, in denen `stock` nicht NULL ist, `count(DISTINCT …)` verschiedene Werte.',
        '`count(*)` counts rows, `count(stock)` only rows where `stock` is not NULL, `count(DISTINCT …)` different values.',
      ),
    },
    {
      id: 'sql-gruppieren-fehler-having',
      stufe: 'fehler',
      titel: t('Aggregat im WHERE', 'Aggregate in WHERE'),
      aufgabe: t(
        'Gesucht: Länder mit **mindestens zwei** Kunden und deren Anzahl. PostgreSQL lehnt die Abfrage ab - lies die Meldung und repariere sie.',
        'We want countries with **at least two** customers and their number. PostgreSQL rejects the query - read the message and fix it.',
      ),
      modus: 'sql',
      code: sql`
        SELECT country, count(*) AS customers
        FROM customers
        WHERE count(*) >= 2
        GROUP BY country;
      `,
      loesung: sql`
        SELECT country, count(*) AS customers
        FROM customers
        GROUP BY country
        HAVING count(*) >= 2;
      `,
      tests: [{ name: t('UK und USA mit ihrer Kundenzahl', 'UK and USA with their number of customers') }],
      tipps: t(
        ['WHERE läuft **vor** dem Gruppieren - da gibt es noch keine Gruppen, die man zählen könnte.', 'Bedingungen über Gruppen gehören in `HAVING`, und das steht **nach** `GROUP BY`.'],
        ['WHERE runs **before** grouping - there are no groups to count yet.', 'Conditions on groups belong in `HAVING`, which comes **after** `GROUP BY`.'],
      ),
    },
    {
      id: 'sql-gruppieren-frei-artikel',
      stufe: 'frei',
      titel: t('Positionen pro Bestellung', 'Line items per order'),
      aufgabe: t(
        'Wie viele **Artikel** (Summe von `quantity`) umfasst jede Bestellung? Zeige `order_id` und `items` für alle Bestellungen mit **mindestens 4 Artikeln**, nach `order_id` sortiert.',
        'How many **items** (sum of `quantity`) does every order contain? Show `order_id` and `items` for all orders with **at least 4 items**, sorted by `order_id`.',
      ),
      modus: 'sql',
      code: sql`
        SELECT order_id, quantity
        FROM order_items;
      `,
      loesung: sql`
        SELECT order_id, sum(quantity) AS items
        FROM order_items
        GROUP BY order_id
        HAVING sum(quantity) >= 4
        ORDER BY order_id;
      `,
      tests: [{ name: t('Die richtigen Bestellungen mit ihrer Artikelzahl, nach order_id', 'The right orders with their number of items, by order_id'), reihenfolge: true }],
      tipps: t(['`GROUP BY order_id` und `sum(quantity)`.', 'Die Bedingung über die Summe steht in `HAVING`.'], ['`GROUP BY order_id` and `sum(quantity)`.', 'The condition on the sum goes into `HAVING`.']),
    },
  ],

  'sql-joins': [
    {
      id: 'sql-joins-vorhersage-left',
      stufe: 'vorhersage',
      titel: t('LEFT JOIN zählen', 'Counting a LEFT JOIN'),
      frage: t(
        '12 Kunden, 20 Bestellungen, 2 Kunden ohne Bestellung. Wie viele Zeilen liefert die Abfrage?',
        '12 customers, 20 orders, 2 customers without an order. How many rows does the query return?',
      ),
      code: sql`
        SELECT c.name, o.id
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id;
      `,
      antworten: ['12', '20', '22', '240'],
      richtig: 2,
      erklaerung: t(
        'Jede der 20 Bestellungen erscheint einmal mit ihrem Kunden. Dazu kommen die 2 Kunden ohne Bestellung - mit NULL rechts. Ein INNER JOIN hätte 20 geliefert.',
        'Each of the 20 orders appears once with its customer. Plus the 2 customers without an order - with NULL on the right. An INNER JOIN would return 20.',
      ),
    },
    {
      id: 'sql-joins-fehler-mehrdeutig',
      stufe: 'fehler',
      titel: t('Welche id?', 'Which id?'),
      aufgabe: t(
        'Die Abfrage soll zu jeder Bestellung von **Grace Hopper** die Bestellnummer und das Datum zeigen, nach Nummer sortiert. PostgreSQL meldet einen Fehler.',
        'The query should show the order number and date of every order by **Grace Hopper**, sorted by number. PostgreSQL reports an error.',
      ),
      modus: 'sql',
      code: sql`
        SELECT id, ordered_at
        FROM orders
        JOIN customers ON customers.id = orders.customer_id
        WHERE name = 'Grace Hopper'
        ORDER BY id;
      `,
      loesung: sql`
        SELECT o.id, o.ordered_at
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        WHERE c.name = 'Grace Hopper'
        ORDER BY o.id;
      `,
      tests: [{ name: t('Die vier Bestellungen von Grace, nach Nummer', 'Grace’s four orders, by number'), reihenfolge: true }],
      tipps: t(
        ['Beide Tabellen haben eine Spalte `id` - PostgreSQL weiß nicht, welche gemeint ist („ambiguous“).', 'Schreib die Tabelle davor: `orders.id` - kürzer mit Alias: `FROM orders o` und dann `o.id`.'],
        ['Both tables have a column `id` - PostgreSQL does not know which one is meant (“ambiguous”).', 'Put the table in front: `orders.id` - shorter with an alias: `FROM orders o` and then `o.id`.'],
      ),
    },
    {
      id: 'sql-joins-frei-kategorien',
      stufe: 'frei',
      titel: t('Umsatz pro Kategorie', 'Revenue per category'),
      aufgabe: t(
        'Wie viel Umsatz hat jede Produkt-Kategorie gemacht? Zeige `category` und `revenue` (Summe von `quantity * unit_price`), **ohne stornierte Bestellungen**, höchster Umsatz zuerst.',
        'How much revenue did each product category make? Show `category` and `revenue` (sum of `quantity * unit_price`), **without cancelled orders**, highest revenue first.',
      ),
      modus: 'sql',
      code: sql`
        SELECT p.category, i.quantity * i.unit_price AS revenue
        FROM order_items i
        JOIN products p ON p.id = i.product_id;
      `,
      loesung: sql`
        SELECT p.category, sum(i.quantity * i.unit_price) AS revenue
        FROM order_items i
        JOIN products p ON p.id = i.product_id
        JOIN orders o   ON o.id = i.order_id
        WHERE o.status <> 'cancelled'
        GROUP BY p.category
        ORDER BY revenue DESC;
      `,
      tests: [{ name: t('Fünf Kategorien mit dem richtigen Umsatz, höchster zuerst', 'Five categories with the right revenue, highest first'), reihenfolge: true }],
      tipps: t(
        ['Den Status kennt nur `orders` - dafür braucht es einen dritten JOIN.', 'Dann `GROUP BY p.category` und `sum(…)`.'],
        ['Only `orders` knows the status - that needs a third JOIN.', 'Then `GROUP BY p.category` and `sum(…)`.'],
      ),
    },
  ],

  'sql-aendern': [
    {
      id: 'sql-aendern-vorhersage-rollback',
      stufe: 'vorhersage',
      titel: t('Was bleibt übrig?', 'What is left?'),
      frage: t('Der Shop hat 16 Produkte. Was zeigt das letzte SELECT?', 'The shop has 16 products. What does the last SELECT show?'),
      code: sql`
        BEGIN;
        DELETE FROM order_items;
        DELETE FROM products WHERE category = 'books';
        ROLLBACK;
        SELECT count(*) FROM products;
      `,
      antworten: ['12', '16', '0', 'Einen Fehler'],
      richtig: 1,
      erklaerung: t(
        '`ROLLBACK` macht alles seit `BEGIN` rückgängig - beide DELETEs. Es sind wieder 16.',
        '`ROLLBACK` undoes everything since `BEGIN` - both DELETEs. There are 16 again.',
      ),
    },
    {
      id: 'sql-aendern-fehler-where',
      stufe: 'fehler',
      titel: t('Die Preiserhöhung, die zu weit ging', 'The price rise that went too far'),
      aufgabe: t(
        'Nur der **27-inch Monitor** soll 259.00 kosten. Das Skript ändert aber viel mehr. Repariere es - der Rest des Sortiments muss bleiben, wie er ist.',
        'Only the **27-inch Monitor** should cost 259.00. But the script changes much more. Fix it - the rest of the range must stay as it is.',
      ),
      modus: 'sql',
      code: sql`
        UPDATE products
        SET price = 259.00;
      `,
      loesung: sql`
        UPDATE products
        SET price = 259.00
        WHERE name = '27-inch Monitor';
      `,
      tests: [
        { name: t('Der Monitor kostet 259.00', 'The monitor costs 259.00'), abfrage: `SELECT price FROM products WHERE name = '27-inch Monitor'` },
        { name: t('Alle anderen Preise sind unverändert', 'All other prices are unchanged'), abfrage: `SELECT name, price FROM products WHERE name <> '27-inch Monitor' ORDER BY id` },
      ],
      tipps: t(
        ['Ohne `WHERE` gilt ein UPDATE für **jede** Zeile.', 'Mit `WHERE name = \'27-inch Monitor\'` - oder sicherer über den Schlüssel: `WHERE id = 3`.'],
        ['Without `WHERE` an UPDATE applies to **every** row.', 'With `WHERE name = \'27-inch Monitor\'` - or safer via the key: `WHERE id = 3`.'],
      ),
    },
    {
      id: 'sql-aendern-frei-storno',
      stufe: 'frei',
      titel: t('Eine Bestellung stornieren', 'Cancelling an order'),
      aufgabe: t(
        'Hedy Lamarr storniert ihre offene Bestellung **118**. Setze ihren Status auf `cancelled` - und **lösche** Bestellung **106** (schon storniert) samt ihrer Positionen, weil sie aufgeräumt werden soll.',
        'Hedy Lamarr cancels her open order **118**. Set its status to `cancelled` - and **delete** order **106** (already cancelled) with its line items, because it should be cleaned up.',
      ),
      modus: 'sql',
      code: sql`
        -- your changes

      `,
      loesung: sql`
        UPDATE orders SET status = 'cancelled' WHERE id = 118;
        DELETE FROM orders WHERE id = 106;
      `,
      tests: [
        { name: t('Die Status aller Bestellungen stimmen', 'The status of every order is right'), abfrage: `SELECT id, status FROM orders ORDER BY id` },
        { name: t('Die Positionen von 106 sind weg, alle anderen noch da', 'The line items of 106 are gone, all others still there'), abfrage: `SELECT order_id, product_id FROM order_items` },
      ],
      tipps: t(
        ['Zwei Anweisungen: ein `UPDATE … WHERE id = 118` und ein `DELETE … WHERE id = 106`.', 'Die Positionen musst du nicht selbst löschen: `order_items.order_id` hat `ON DELETE CASCADE` (siehe `\\d order_items`).'],
        ['Two statements: an `UPDATE … WHERE id = 118` and a `DELETE … WHERE id = 106`.', 'You do not have to delete the line items yourself: `order_items.order_id` has `ON DELETE CASCADE` (see `\\d order_items`).'],
      ),
    },
  ],

  'sql-tabellen': [
    {
      id: 'sql-tabellen-vorhersage-default',
      stufe: 'vorhersage',
      titel: t('DEFAULT oder NULL?', 'DEFAULT or NULL?'),
      frage: t('Was zeigt das SELECT?', 'What does the SELECT show?'),
      code: sql`
        CREATE TABLE notes (
          id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          text  text NOT NULL,
          pinned boolean DEFAULT false,
          color text
        );
        INSERT INTO notes (text) VALUES ('Buy milk');
        SELECT id, pinned, color FROM notes;
      `,
      antworten: ['1, false, NULL', '1, NULL, NULL', 'NULL, false, NULL', 'Einen Fehler, weil color fehlt'],
      richtig: 0,
      erklaerung: t(
        '`id` zählt die Identity hoch, `pinned` bekommt seinen DEFAULT. `color` hat keinen DEFAULT und ist nicht `NOT NULL` - also NULL.',
        '`id` is counted up by the identity, `pinned` gets its DEFAULT. `color` has no DEFAULT and is not `NOT NULL` - so NULL.',
      ),
    },
    {
      id: 'sql-tabellen-fehler-geld',
      stufe: 'fehler',
      titel: t('Rundungsfehler im Kontostand', 'Rounding errors in the balance'),
      aufgabe: t(
        'Zehn Gutschriften zu je 0.10 € sollen genau **1.00** ergeben. Mit dem gewählten Datentyp kommt aber nicht genau 1 heraus. Ändere nur den Typ der Spalte `amount`.',
        'Ten credits of 0.10 € each should add up to exactly **1.00**. With the chosen data type the result is not exactly 1. Change only the type of the column `amount`.',
      ),
      modus: 'sql',
      code: sql`
        CREATE TABLE credits (amount real NOT NULL);
        INSERT INTO credits SELECT 0.10 FROM generate_series(1, 10);
        SELECT sum(amount) = 1 AS exact, sum(amount) AS total FROM credits;
      `,
      loesung: sql`
        CREATE TABLE credits (amount numeric(10, 2) NOT NULL);
        INSERT INTO credits SELECT 0.10 FROM generate_series(1, 10);
        SELECT sum(amount) = 1 AS exact, sum(amount) AS total FROM credits;
      `,
      tests: [{ name: t('Die Summe ist genau 1.00', 'The sum is exactly 1.00') }],
      tipps: t(
        ['`real` und `double precision` sind Gleitkommazahlen - 0.1 ist darin nicht exakt darstellbar.', 'Für Geld: `numeric(10, 2)` - exakt, mit zwei Nachkommastellen.'],
        ['`real` and `double precision` are floating point numbers - 0.1 cannot be stored exactly.', 'For money: `numeric(10, 2)` - exact, with two decimal places.'],
      ),
    },
    {
      id: 'sql-tabellen-frei-gutscheine',
      stufe: 'frei',
      titel: t('Eine Tabelle für Gutscheine', 'A table for vouchers'),
      aufgabe: t(
        'Lege die Tabelle `vouchers` an: `code` (text, Primärschlüssel), `percent` (integer, Pflicht, **nur 1 bis 50** erlaubt) und `valid_until` (date, Pflicht). Füge danach den Gutschein `WELCOME10` mit 10 % bis `2026-12-31` ein.',
        'Create the table `vouchers`: `code` (text, primary key), `percent` (integer, required, **only 1 to 50** allowed) and `valid_until` (date, required). Then insert the voucher `WELCOME10` with 10 % until `2026-12-31`.',
      ),
      modus: 'sql',
      code: sql`
        CREATE TABLE vouchers (
          -- your columns
        );
      `,
      loesung: sql`
        CREATE TABLE vouchers (
          code        text PRIMARY KEY,
          percent     integer NOT NULL CHECK (percent BETWEEN 1 AND 50),
          valid_until date NOT NULL
        );

        INSERT INTO vouchers (code, percent, valid_until)
        VALUES ('WELCOME10', 10, '2026-12-31');
      `,
      tests: [
        {
          name: t('Drei Spalten mit den richtigen Typen, alle Pflicht', 'Three columns with the right types, all required'),
          abfrage: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'vouchers' ORDER BY ordinal_position`,
          reihenfolge: true,
        },
        {
          name: t('Primärschlüssel und eine CHECK-Regel', 'A primary key and a CHECK rule'),
          abfrage: `SELECT contype FROM pg_constraint WHERE conrelid = to_regclass('vouchers') AND contype IN ('p', 'c')`,
        },
        {
          name: t('Der CHECK lässt 50 zu, aber nicht 51 und nicht 0', 'The CHECK allows 50, but not 51 and not 0'),
          // Tries the values out: a temporary function inserts them and catches the CHECK violation.
          abfrage: `
            CREATE FUNCTION pg_temp.accepts(p integer) RETURNS boolean LANGUAGE plpgsql AS $$
            BEGIN
              INSERT INTO vouchers (code, percent, valid_until) VALUES ('TEST' || p, p, '2030-01-01');
              DELETE FROM vouchers WHERE code = 'TEST' || p;
              RETURN true;
            EXCEPTION WHEN check_violation THEN
              RETURN false;
            END $$;
            SELECT pg_temp.accepts(0) AS "0", pg_temp.accepts(1) AS "1", pg_temp.accepts(50) AS "50", pg_temp.accepts(51) AS "51";`,
        },
        { name: t('WELCOME10 ist eingetragen', 'WELCOME10 is in the table'), abfrage: `SELECT code, percent, valid_until FROM vouchers` },
      ],
      tipps: t(
        ['Spalten: `code text PRIMARY KEY`, dann `percent` und `valid_until` mit `NOT NULL`.', 'Der Bereich: `CHECK (percent BETWEEN 1 AND 50)`.', 'Danach ein `INSERT INTO vouchers (code, percent, valid_until) VALUES (…)`.'],
        ['Columns: `code text PRIMARY KEY`, then `percent` and `valid_until` with `NOT NULL`.', 'The range: `CHECK (percent BETWEEN 1 AND 50)`.', 'Then an `INSERT INTO vouchers (code, percent, valid_until) VALUES (…)`.'],
      ),
    },
  ],

  'sql-profi': [
    {
      id: 'sql-profi-vorhersage-rank',
      stufe: 'vorhersage',
      titel: t('rank und row_number', 'rank and row_number'),
      frage: t(
        'Die Bestellungen 108 und 118 haben beide den höchsten Wert nach 103. Welche Plätze vergibt `rank()` für 103, 108, 118, 113?',
        'Orders 108 and 118 both have the highest value after 103. Which places does `rank()` give to 103, 108, 118, 113?',
      ),
      code: sql`
        WITH totals AS (
          SELECT order_id, sum(quantity * unit_price) AS total
          FROM order_items GROUP BY order_id
        )
        SELECT order_id, total, rank() OVER (ORDER BY total DESC)
        FROM totals
        ORDER BY total DESC, order_id
        LIMIT 4;
      `,
      antworten: ['1, 2, 3, 4', '1, 2, 2, 3', '1, 2, 2, 4', '1, 1, 2, 3'],
      richtig: 2,
      erklaerung: t(
        '`rank()` gibt Gleichstand denselben Platz und lässt danach eine Lücke (1, 2, 2, 4). `dense_rank()` ergäbe 1, 2, 2, 3, `row_number()` immer 1, 2, 3, 4.',
        '`rank()` gives ties the same place and leaves a gap afterwards (1, 2, 2, 4). `dense_rank()` would give 1, 2, 2, 3, `row_number()` always 1, 2, 3, 4.',
      ),
    },
    {
      id: 'sql-profi-fehler-subquery',
      stufe: 'fehler',
      titel: t('Mehr als eine Zeile', 'More than one row'),
      aufgabe: t(
        'Gesucht sind alle Bestellungen von Kunden aus dem **UK** (id und customer_id, nach id). PostgreSQL bricht ab: „more than one row returned by a subquery“. Repariere die Abfrage.',
        'We want all orders of customers from the **UK** (id and customer_id, by id). PostgreSQL fails: “more than one row returned by a subquery”. Fix the query.',
      ),
      modus: 'sql',
      code: sql`
        SELECT id, customer_id
        FROM orders
        WHERE customer_id = (SELECT id FROM customers WHERE country = 'UK')
        ORDER BY id;
      `,
      loesung: sql`
        SELECT id, customer_id
        FROM orders
        WHERE customer_id IN (SELECT id FROM customers WHERE country = 'UK')
        ORDER BY id;
      `,
      tests: [{ name: t('Alle Bestellungen der UK-Kunden, nach id', 'All orders of UK customers, by id'), reihenfolge: true }],
      tipps: t(
        ['`=` vergleicht mit **einem** Wert. Die Unterabfrage liefert aber vier ids.', 'Mit einer Liste vergleicht man per `IN (…)`.'],
        ['`=` compares with **one** value. But the subquery returns four ids.', 'To compare with a list, use `IN (…)`.'],
      ),
    },
    {
      id: 'sql-profi-frei-anteil',
      stufe: 'frei',
      titel: t('Anteil am Kategorie-Umsatz', 'Share of the category revenue'),
      aufgabe: t(
        'Zeige für jedes **Buch** (`category = \'books\'`) `name` und `share`: den Anteil seines Lagerwerts (`price * stock`) am Lagerwert aller Bücher in Prozent, auf eine Nachkommastelle gerundet. Nach `share` absteigend.',
        'For every **book** (`category = \'books\'`) show `name` and `share`: the percentage of its stock value (`price * stock`) of the stock value of all books, rounded to one decimal place. By `share` descending.',
      ),
      modus: 'sql',
      code: sql`
        SELECT name, price * stock AS stock_value
        FROM products
        WHERE category = 'books';
      `,
      loesung: sql`
        SELECT name,
               round(100 * price * stock / sum(price * stock) OVER (), 1) AS share
        FROM products
        WHERE category = 'books'
        ORDER BY share DESC;
      `,
      tests: [{ name: t('Drei Bücher mit ihrem Anteil in Prozent, größter zuerst', 'Three books with their share in percent, largest first'), reihenfolge: true }],
      tipps: t(
        ['`sum(price * stock) OVER ()` ist die Summe über **alle** Zeilen des Ergebnisses - neben jeder einzelnen Zeile.', '`round(100 * price * stock / sum(…) OVER (), 1)`'],
        ['`sum(price * stock) OVER ()` is the sum over **all** rows of the result - next to every single row.', '`round(100 * price * stock / sum(…) OVER (), 1)`'],
      ),
    },
  ],
}
