import { sql } from '../../lernen/quelltext'
import type { SqlBeispiel } from '../../sql/check'

/** Code for chapter 9.3 - Counting & grouping. */

export const beispiele: Record<string, SqlBeispiel> = {
  'sql-gruppieren-einstieg': {
    code: sql`
      -- One row per category - with the number of products and the average price
      SELECT category,
             count(*)             AS products,
             round(avg(price), 2) AS avg_price
      FROM products
      GROUP BY category
      ORDER BY products DESC, category;
    `,
  },
  'sql-gruppieren-aggregate': {
    code: sql`
      -- Without GROUP BY: the whole table becomes ONE row
      SELECT count(*)             AS all_products,
             count(stock)         AS with_stock,   -- count(column) skips NULL
             sum(stock)           AS items_in_stock,
             min(price)           AS cheapest,
             max(price)           AS most_expensive,
             round(avg(price), 2) AS average
      FROM products;
    `,
  },
  'sql-gruppieren-group-by': {
    code: sql`
      -- How many orders per status?
      SELECT status, count(*) AS orders
      FROM orders
      GROUP BY status
      ORDER BY orders DESC;

      -- The value of every order: sum of quantity × unit price of its line items
      SELECT order_id,
             count(*)                     AS line_items,
             sum(quantity * unit_price)   AS total
      FROM order_items
      GROUP BY order_id
      ORDER BY total DESC
      LIMIT 5;
    `,
  },
  'sql-gruppieren-fehler': {
    code: sql`
      -- Which name should be in the one row of the category "books"? There are three.
      SELECT category, name, count(*)
      FROM products
      GROUP BY category;
    `,
  },
  'sql-gruppieren-having': {
    code: sql`
      -- WHERE filters rows BEFORE grouping, HAVING filters groups AFTERWARDS
      SELECT customer_id, count(*) AS orders
      FROM orders
      WHERE status <> 'cancelled'
      GROUP BY customer_id
      HAVING count(*) >= 2
      ORDER BY orders DESC, customer_id;
    `,
  },
  'sql-gruppieren-alias': {
    code: sql`
      -- WHERE is evaluated before SELECT - the name "gross" does not exist yet
      SELECT name, price * 1.19 AS gross
      FROM products
      WHERE gross > 100;
    `,
    loesung: sql`
      SELECT name, price * 1.19 AS gross
      FROM products
      WHERE price * 1.19 > 100;
    `,
  },
  'sql-gruppieren-zeit': {
    code: sql`
      -- Orders per month: to_char turns a date into text in any format
      SELECT to_char(ordered_at, 'YYYY-MM') AS month, count(*) AS orders
      FROM orders
      GROUP BY month
      ORDER BY month;

      -- string_agg joins the texts of a group
      SELECT country, count(*) AS customers, string_agg(name, ', ' ORDER BY name) AS names
      FROM customers
      GROUP BY country
      ORDER BY customers DESC, country;
    `,
  },
  'sql-gruppieren-uebung': {
    code: sql`
      SELECT order_id, quantity * unit_price AS total
      FROM order_items;
    `,
    loesung: sql`
      SELECT order_id, sum(quantity * unit_price) AS total
      FROM order_items
      GROUP BY order_id
      HAVING sum(quantity * unit_price) > 400
      ORDER BY total DESC, order_id;
    `,
    tests: [
      { name: { de: 'Eine Zeile pro Bestellung über 400 €, mit der Summe', en: 'One row per order over 400 €, with the total' } },
      { name: { de: 'Höchster Wert zuerst, bei Gleichstand nach order_id', en: 'Highest value first, ties by order_id' }, reihenfolge: true },
    ],
    tipps: {
      de: ['Eine Zeile pro Bestellung: `GROUP BY order_id` und `sum(quantity * unit_price)`.', 'Die Bedingung betrifft die Summe - sie gehört in `HAVING`, nicht in `WHERE`.', '`ORDER BY total DESC, order_id`'],
      en: ['One row per order: `GROUP BY order_id` and `sum(quantity * unit_price)`.', 'The condition is about the sum - it belongs in `HAVING`, not in `WHERE`.', '`ORDER BY total DESC, order_id`'],
    },
  },
}

export const codeBloecke = {
  funktionen: sql`
    count(*)          -- number of rows
    count(email)      -- number of rows where email is NOT NULL
    count(DISTINCT country)
    sum(stock)   avg(price)   min(price)   max(price)
    string_agg(name, ', ')    -- texts joined
  `,
}
