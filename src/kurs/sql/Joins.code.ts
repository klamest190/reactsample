import { sql } from '../../lernen/quelltext'
import type { SqlTest } from '../../sql/check'

/** Code for chapter 9.4 - Joining tables: JOIN. */

export const beispiele: Record<string, { code: string; loesung?: string; tests?: SqlTest[] }> = {
  'sql-joins-einstieg': {
    code: sql`
      -- orders only knows the customer_id - the JOIN fetches the name
      SELECT o.id, o.ordered_at, o.status, c.name
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.id;
    `,
  },
  'sql-joins-ohne-on': {
    code: sql`
      -- Without a condition every order is combined with every customer: 20 × 12
      SELECT count(*) AS combinations
      FROM orders, customers;

      -- ON keeps only the pairs that belong together: 20
      SELECT count(*) AS pairs
      FROM orders o
      JOIN customers c ON c.id = o.customer_id;
    `,
  },
  'sql-joins-left': {
    code: sql`
      -- All customers - Margaret and Niklaus have no order: NULL on the right
      SELECT c.name, o.id AS order_id, o.status
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      ORDER BY c.name, o.id;

      -- Customers WITHOUT an order: exactly the rows where the right side is NULL
      SELECT c.name
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      WHERE o.id IS NULL;
    `,
  },
  'sql-joins-kette': {
    code: sql`
      -- Order 111 with everything: customer, products, quantities
      SELECT o.id, c.name AS customer, p.name AS product, i.quantity, i.unit_price
      FROM orders o
      JOIN customers c   ON c.id = o.customer_id
      JOIN order_items i ON i.order_id = o.id
      JOIN products p    ON p.id = i.product_id
      WHERE o.id = 111
      ORDER BY p.name;
    `,
  },
  'sql-joins-auswertung': {
    code: sql`
      -- Revenue per customer - cancelled orders do not count
      SELECT c.name,
             count(DISTINCT o.id)           AS orders,
             sum(i.quantity * i.unit_price) AS revenue
      FROM customers c
      JOIN orders o      ON o.customer_id = c.id
      JOIN order_items i ON i.order_id = o.id
      WHERE o.status <> 'cancelled'
      GROUP BY c.id, c.name
      ORDER BY revenue DESC;
    `,
  },
  'sql-joins-zaehlen': {
    code: sql`
      -- Orders per customer, including those without any.
      -- count(o.id) counts only real orders - count(*) would give Margaret a 1.
      SELECT c.name, count(o.id) AS orders, count(*) AS wrong
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id, c.name
      ORDER BY orders, c.name;
    `,
  },
  'sql-joins-uebung': {
    code: sql`
      SELECT p.name, p.category
      FROM products p
      ORDER BY p.name;
    `,
    loesung: sql`
      SELECT p.name, p.category
      FROM products p
      LEFT JOIN order_items i ON i.product_id = p.id
      WHERE i.product_id IS NULL
      ORDER BY p.name;
    `,
    tests: [
      { name: { de: 'Genau die Produkte, die nie bestellt wurden', en: 'Exactly the products that were never ordered' } },
      { name: { de: 'Nach Name sortiert', en: 'Sorted by name' }, reihenfolge: true },
    ],
  },
}

export const codeBloecke = {
  syntax: sql`
    SELECT o.id, c.name              -- columns from both tables
    FROM orders o                    -- o is a short name (alias) for orders
    JOIN customers c                 -- the second table ...
      ON c.id = o.customer_id;       -- ... and which rows belong together
  `,
  arten: sql`
    FROM a JOIN b ON …         -- INNER JOIN: only rows with a partner on both sides
    FROM a LEFT JOIN b ON …    -- all rows of a; b is NULL where there is no partner
    FROM a RIGHT JOIN b ON …   -- the other way round (rare - swap the tables instead)
    FROM a FULL JOIN b ON …    -- all rows of both sides
    FROM a JOIN b USING (id)   -- short form if both columns have the same name
  `,
  falle: sql`
    -- LEFT JOIN, but a condition on the right table in WHERE:
    -- the NULL rows fail the condition - it is an INNER JOIN again
    FROM customers c
    LEFT JOIN orders o ON o.customer_id = c.id
    WHERE o.status = 'open'

    -- correct: the condition belongs into ON
    LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'open'
  `,
}
