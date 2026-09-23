import { sql } from '../../lernen/quelltext'
import type { SqlBeispiel } from '../../sql/check'

/** Code for chapter 9.7 - Subqueries, CTEs & window functions. */

const REVENUE = sql`
  WITH revenue AS (
    SELECT c.country, c.name, sum(i.quantity * i.unit_price) AS revenue
    FROM customers c
    JOIN orders o      ON o.customer_id = c.id
    JOIN order_items i ON i.order_id = o.id
    WHERE o.status <> 'cancelled'
    GROUP BY c.id, c.country, c.name
  )
`

export const beispiele: Record<string, SqlBeispiel> = {
  'sql-profi-einstieg': {
    code: sql`
      -- Products more expensive than the average - the inner query runs first
      SELECT name, price
      FROM products
      WHERE price > (SELECT avg(price) FROM products)
      ORDER BY price DESC;
    `,
  },
  'sql-profi-in-exists': {
    code: sql`
      -- Customers who have ever ordered a book: IN with a list from a subquery
      SELECT name
      FROM customers
      WHERE id IN (
        SELECT o.customer_id
        FROM orders o
        JOIN order_items i ON i.order_id = o.id
        JOIN products p    ON p.id = i.product_id
        WHERE p.category = 'books'
      )
      ORDER BY name;

      -- EXISTS asks "is there at least one such row?" - here: customers WITHOUT any order
      SELECT c.name
      FROM customers c
      WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)
      ORDER BY c.name;
    `,
  },
  'sql-profi-cte': {
    code: sql`
      -- Step 1: the value of every order. Step 2: statistics about these values.
      WITH order_totals AS (
        SELECT order_id, sum(quantity * unit_price) AS total
        FROM order_items
        GROUP BY order_id
      )
      SELECT count(*)             AS orders,
             round(avg(total), 2) AS average_order,
             max(total)           AS biggest_order
      FROM order_totals;
    `,
  },
  'sql-profi-window': {
    code: sql`
      -- Rank within the category - every product keeps its own row
      SELECT category, name, price,
             rank() OVER (PARTITION BY category ORDER BY price DESC) AS rank_in_category,
             round(avg(price) OVER (PARTITION BY category), 2)      AS category_avg
      FROM products
      ORDER BY category, rank_in_category;
    `,
  },
  'sql-profi-laufend': {
    code: sql`
      WITH monthly AS (
        SELECT to_char(o.ordered_at, 'YYYY-MM')   AS month,
               sum(i.quantity * i.unit_price)    AS revenue
        FROM orders o
        JOIN order_items i ON i.order_id = o.id
        WHERE o.status <> 'cancelled'
        GROUP BY month
      )
      SELECT month,
             revenue,
             sum(revenue) OVER (ORDER BY month)             AS running_total,
             revenue - lag(revenue) OVER (ORDER BY month)   AS vs_last_month
      FROM monthly
      ORDER BY month;
    `,
  },
  'sql-profi-view': {
    code: sql`
      -- Save the query under a name ...
      CREATE VIEW order_totals AS
      SELECT o.id, o.customer_id, o.ordered_at, o.status,
             sum(i.quantity * i.unit_price) AS total
      FROM orders o
      JOIN order_items i ON i.order_id = o.id
      GROUP BY o.id;

      -- ... and read it like a table
      SELECT id, status, total
      FROM order_totals
      WHERE total > 300
      ORDER BY total DESC;
    `,
  },
  'sql-profi-uebung': {
    code:
      REVENUE +
      '\n' +
      sql`
        SELECT country, name, revenue
        FROM revenue
        ORDER BY country;
      `,
    loesung:
      REVENUE +
      ',' +
      '\n' +
      sql`
        ranked AS (
          SELECT country, name, revenue,
                 rank() OVER (PARTITION BY country ORDER BY revenue DESC) AS place
          FROM revenue
        )
        SELECT country, name, revenue
        FROM ranked
        WHERE place = 1
        ORDER BY country;
      `,
    tests: [
      { name: { de: 'Pro Land genau ein Kunde - der mit dem höchsten Umsatz', en: 'Exactly one customer per country - the one with the highest revenue' } },
      { name: { de: 'Nach Land sortiert', en: 'Sorted by country' }, reihenfolge: true },
    ],
    tipps: {
      de: [
        'Nummeriere die Kunden innerhalb jedes Landes: `rank() OVER (PARTITION BY country ORDER BY revenue DESC)`.',
        'Eine Window Function darf nicht im WHERE stehen (das läuft vorher). Leg deshalb einen zweiten Schritt an: `WITH revenue AS (…), ranked AS (SELECT …, rank() OVER (…) AS place FROM revenue)`.',
        'Zum Schluss: `SELECT country, name, revenue FROM ranked WHERE place = 1 ORDER BY country`.',
      ],
      en: [
        'Number the customers within every country: `rank() OVER (PARTITION BY country ORDER BY revenue DESC)`.',
        'A window function must not be in WHERE (that runs before). So add a second step: `WITH revenue AS (…), ranked AS (SELECT …, rank() OVER (…) AS place FROM revenue)`.',
        'Finally: `SELECT country, name, revenue FROM ranked WHERE place = 1 ORDER BY country`.',
      ],
    },
  },
}

export const codeBloecke = {
  window: sql`
    function() OVER (
      PARTITION BY category    -- separate windows per category (optional)
      ORDER BY price DESC      -- order inside the window (optional)
    )
  `,
  union: sql`
    SELECT name, 'customer' AS kind FROM customers
    UNION ALL                      -- stack results; UNION also removes duplicates
    SELECT name, 'product'         FROM products;
  `,
}
