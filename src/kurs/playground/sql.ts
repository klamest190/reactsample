import { sql } from '../../lernen/quelltext'
import type { Baustein, PlaygroundDaten } from './typen'

/**
 * Playground for part 9: real PostgreSQL on the example shop database.
 * Every building block is a complete statement and lands at the end of the script.
 * Every run starts with fresh tables, so the blocks may change data - but each
 * name they create (table, view) exists only once, so all of them run together.
 */

const b = (titelDe: string, titelEn: string, infoDe: string, infoEn: string, code: string, kapitel: string): Baustein => ({
  titel: { de: titelDe, en: titelEn },
  info: { de: infoDe, en: infoEn },
  code: '\n' + code,
  ort: 'ende',
  kapitel,
})

export const sqlPlayground: PlaygroundDaten = {
  teil: 'sql',
  modus: 'sql',
  hinweis: {
    de: 'Jeder Lauf startet mit frischen Beispieltabellen und führt das ganze Skript von oben nach unten aus - du kannst also nach Herzenslust ändern und löschen. Die Tabellen stehen über dem Editor.',
    en: 'Every run starts with fresh example tables and runs the whole script from top to bottom - so change and delete to your heart’s content. The tables are listed above the editor.',
  },
  vorlagen: [
    {
      titel: { de: 'Tabellen erkunden', en: 'Explore the tables' },
      info: { de: 'Die Tabellen der Beispieldatenbank und ein erster Blick hinein.', en: 'The tables of the example database and a first look inside.' },
      code: sql`
        -- The example shop. Click a building block on the left - or write your own query.
        \dt
        SELECT * FROM customers;
      `,
    },
    {
      titel: { de: 'Umsatz-Bericht', en: 'Revenue report' },
      info: { de: 'JOIN, GROUP BY und eine Window Function: Umsatz pro Monat mit laufender Summe.', en: 'JOIN, GROUP BY and a window function: revenue per month with a running total.' },
      code: sql`
        WITH monthly AS (
          SELECT to_char(o.ordered_at, 'YYYY-MM') AS month,
                 count(DISTINCT o.id)            AS orders,
                 sum(i.quantity * i.unit_price)  AS revenue
          FROM orders o
          JOIN order_items i ON i.order_id = o.id
          WHERE o.status <> 'cancelled'
          GROUP BY month
        )
        SELECT month, orders, revenue,
               sum(revenue) OVER (ORDER BY month) AS running_total
        FROM monthly
        ORDER BY month;
      `,
    },
    {
      titel: { de: 'Eigene Tabelle', en: 'Your own table' },
      info: { de: 'Eine Tabelle anlegen, befüllen und mit den Kunden verbinden.', en: 'Create a table, fill it and join it with the customers.' },
      code: sql`
        CREATE TABLE support_tickets (
          id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          customer_id integer NOT NULL REFERENCES customers (id),
          subject     text NOT NULL,
          priority    text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
          closed      boolean NOT NULL DEFAULT false
        );

        INSERT INTO support_tickets (customer_id, subject, priority)
        VALUES (2, 'Compiler license key missing', 'high'),
               (8, 'Shortest delivery route?', 'low'),
               (2, 'Invoice address', DEFAULT);

        SELECT t.id, c.name, t.subject, t.priority
        FROM support_tickets t
        JOIN customers c ON c.id = t.customer_id
        ORDER BY t.id;
      `,
    },
  ],
  gruppen: [
    {
      titel: { de: 'Lesen', en: 'Reading' },
      bausteine: [
        b('SELECT *', 'SELECT *', 'Alle Spalten einer Tabelle.', 'All columns of a table.', 'SELECT * FROM products;', 'sql-start'),
        b('Spalten & AS', 'Columns & AS', 'Ausgewählte Spalten, eine Rechnung und neue Namen.', 'Chosen columns, a calculation and new names.', sql`
          SELECT name, price, price * 1.19 AS gross
          FROM products;
        `, 'sql-start'),
        b('ORDER BY & LIMIT', 'ORDER BY & LIMIT', 'Die fünf teuersten Produkte.', 'The five most expensive products.', sql`
          SELECT name, price
          FROM products
          ORDER BY price DESC
          LIMIT 5;
        `, 'sql-start'),
        b('DISTINCT', 'DISTINCT', 'Jedes Land nur einmal.', 'Every country only once.', 'SELECT DISTINCT country FROM customers ORDER BY country;', 'sql-start'),
      ],
    },
    {
      titel: { de: 'Filtern', en: 'Filtering' },
      bausteine: [
        b('WHERE', 'WHERE', 'Nur Zeilen, für die die Bedingung stimmt.', 'Only rows for which the condition holds.', "SELECT name, city FROM customers WHERE country = 'UK';", 'sql-where'),
        b('AND / OR', 'AND / OR', 'Bedingungen verknüpfen - Klammern nicht vergessen.', 'Combine conditions - do not forget the parentheses.', sql`
          SELECT name, category, price
          FROM products
          WHERE (category = 'hardware' OR category = 'books') AND price < 40;
        `, 'sql-where'),
        b('IN', 'IN', 'Einer von mehreren Werten.', 'One of several values.', "SELECT id, status FROM orders WHERE status IN ('open', 'paid');", 'sql-where'),
        b('BETWEEN (Datum)', 'BETWEEN (dates)', 'Ein Zeitraum, beide Grenzen inklusive.', 'A period, both ends included.', "SELECT id, ordered_at FROM orders WHERE ordered_at BETWEEN '2026-06-01' AND '2026-08-31';", 'sql-where'),
        b('ILIKE', 'ILIKE', 'Textsuche ohne Groß-/Kleinschreibung.', 'Text search ignoring case.', "SELECT name FROM products WHERE name ILIKE '%code%';", 'sql-where'),
        b('IS NULL', 'IS NULL', 'Zeilen ohne Wert - `= NULL` funktioniert nicht.', 'Rows without a value - `= NULL` does not work.', 'SELECT name, stock FROM products WHERE stock IS NULL;', 'sql-where'),
        b('CASE', 'CASE', 'Werte in Klassen einteilen.', 'Sort values into classes.', sql`
          SELECT name, stock,
                 CASE WHEN stock IS NULL THEN 'not stocked'
                      WHEN stock = 0     THEN 'sold out'
                      ELSE 'available' END AS availability
          FROM products;
        `, 'sql-where'),
      ],
    },
    {
      titel: { de: 'Gruppieren', en: 'Grouping' },
      bausteine: [
        b('count pro Gruppe', 'count per group', 'Kunden pro Land.', 'Customers per country.', sql`
          SELECT country, count(*) AS customers
          FROM customers
          GROUP BY country
          ORDER BY customers DESC;
        `, 'sql-gruppieren'),
        b('sum & avg', 'sum & avg', 'Warenwert jeder Bestellung.', 'The value of every order.', sql`
          SELECT order_id, sum(quantity * unit_price) AS total
          FROM order_items
          GROUP BY order_id
          ORDER BY total DESC;
        `, 'sql-gruppieren'),
        b('HAVING', 'HAVING', 'Nur Gruppen, die eine Bedingung erfüllen.', 'Only groups that meet a condition.', sql`
          SELECT customer_id, count(*) AS orders
          FROM orders
          GROUP BY customer_id
          HAVING count(*) >= 3;
        `, 'sql-gruppieren'),
        b('pro Monat', 'per month', 'Bestellungen pro Monat.', 'Orders per month.', sql`
          SELECT to_char(ordered_at, 'YYYY-MM') AS month, count(*) AS orders
          FROM orders
          GROUP BY month
          ORDER BY month;
        `, 'sql-gruppieren'),
      ],
    },
    {
      titel: { de: 'Verbinden', en: 'Joining' },
      bausteine: [
        b('JOIN', 'JOIN', 'Bestellungen mit dem Namen des Kunden.', 'Orders with the customer’s name.', sql`
          SELECT o.id, o.ordered_at, c.name
          FROM orders o
          JOIN customers c ON c.id = o.customer_id;
        `, 'sql-joins'),
        b('LEFT JOIN', 'LEFT JOIN', 'Kunden ohne eine einzige Bestellung.', 'Customers without a single order.', sql`
          SELECT c.name
          FROM customers c
          LEFT JOIN orders o ON o.customer_id = c.id
          WHERE o.id IS NULL;
        `, 'sql-joins'),
        b('Vier Tabellen', 'Four tables', 'Jede Position mit Kunde und Produkt.', 'Every line item with customer and product.', sql`
          SELECT o.id, c.name AS customer, p.name AS product, i.quantity
          FROM orders o
          JOIN customers c   ON c.id = o.customer_id
          JOIN order_items i ON i.order_id = o.id
          JOIN products p    ON p.id = i.product_id
          ORDER BY o.id;
        `, 'sql-joins'),
      ],
    },
    {
      titel: { de: 'Ändern', en: 'Changing' },
      bausteine: [
        b('INSERT', 'INSERT', 'Neue Zeile - RETURNING zeigt, was angelegt wurde.', 'A new row - RETURNING shows what was created.', sql`
          INSERT INTO customers (name, email, city, country)
          VALUES ('Radia Perlman', 'radia@stp.example', 'Seattle', 'USA')
          RETURNING *;
        `, 'sql-aendern'),
        b('UPDATE', 'UPDATE', 'Preise ändern - WHERE nicht vergessen!', 'Change prices - do not forget WHERE!', sql`
          UPDATE products
          SET price = price * 0.9
          WHERE category = 'books'
          RETURNING name, price;
        `, 'sql-aendern'),
        b('DELETE', 'DELETE', 'Zeilen löschen - mit ON DELETE CASCADE gehen die Positionen mit.', 'Delete rows - with ON DELETE CASCADE the line items go too.', sql`
          DELETE FROM orders
          WHERE status = 'cancelled'
          RETURNING id;
        `, 'sql-aendern'),
        b('Transaktion', 'Transaction', 'Ausprobieren und mit ROLLBACK zurücknehmen.', 'Try something and take it back with ROLLBACK.', sql`
          BEGIN;
          DELETE FROM order_items;
          SELECT count(*) AS inside_the_transaction FROM order_items;
          ROLLBACK;
          SELECT count(*) AS after_rollback FROM order_items;
        `, 'sql-aendern'),
      ],
    },
    {
      titel: { de: 'Tabellen', en: 'Tables' },
      bausteine: [
        b('CREATE TABLE', 'CREATE TABLE', 'Eine neue Tabelle mit Schlüsseln und Regeln.', 'A new table with keys and rules.', sql`
          CREATE TABLE reviews (
            id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            product_id integer NOT NULL REFERENCES products (id),
            rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment    text
          );
          INSERT INTO reviews (product_id, rating, comment) VALUES (15, 5, 'Best debugger ever');
          SELECT * FROM reviews;
        `, 'sql-tabellen'),
        b('ALTER TABLE', 'ALTER TABLE', 'Eine Spalte hinzufügen.', 'Add a column.', sql`
          ALTER TABLE customers ADD COLUMN newsletter boolean NOT NULL DEFAULT false;
          SELECT name, newsletter FROM customers LIMIT 3;
        `, 'sql-tabellen'),
        b('CREATE INDEX', 'CREATE INDEX', 'Ein Index für häufige Suchen.', 'An index for frequent searches.', 'CREATE INDEX orders_status_idx ON orders (status);', 'sql-tabellen'),
        b('EXPLAIN', 'EXPLAIN', 'Wie PostgreSQL eine Abfrage ausführen will.', 'How PostgreSQL plans to run a query.', "EXPLAIN SELECT * FROM orders WHERE status = 'open';", 'sql-tabellen'),
      ],
    },
    {
      titel: { de: 'Fortgeschritten', en: 'Advanced' },
      bausteine: [
        b('Unterabfrage', 'Subquery', 'Teurer als der Durchschnitt.', 'More expensive than the average.', sql`
          SELECT name, price
          FROM products
          WHERE price > (SELECT avg(price) FROM products);
        `, 'sql-profi'),
        b('WITH (CTE)', 'WITH (CTE)', 'Eine benannte Zwischenabfrage.', 'A named intermediate query.', sql`
          WITH totals AS (
            SELECT order_id, sum(quantity * unit_price) AS total
            FROM order_items
            GROUP BY order_id
          )
          SELECT round(avg(total), 2) AS average_order FROM totals;
        `, 'sql-profi'),
        b('rank() OVER', 'rank() OVER', 'Rangliste innerhalb jeder Kategorie.', 'A ranking within every category.', sql`
          SELECT category, name, price,
                 rank() OVER (PARTITION BY category ORDER BY price DESC) AS place
          FROM products;
        `, 'sql-profi'),
        b('CREATE VIEW', 'CREATE VIEW', 'Eine Abfrage unter einem Namen speichern.', 'Save a query under a name.', sql`
          CREATE VIEW open_orders AS
          SELECT id, customer_id, ordered_at FROM orders WHERE status = 'open';
          SELECT * FROM open_orders;
        `, 'sql-profi'),
      ],
    },
    {
      titel: { de: 'psql', en: 'psql' },
      bausteine: [
        b('\\dt', '\\dt', 'Alle Tabellen.', 'All tables.', '\\dt', 'sql-start'),
        b('\\d orders', '\\d orders', 'Spalten, Schlüssel und Regeln einer Tabelle.', 'Columns, keys and rules of a table.', '\\d orders', 'sql-start'),
        b('\\di', '\\di', 'Alle Indizes.', 'All indexes.', '\\di', 'sql-tabellen'),
      ],
    },
  ],
}
