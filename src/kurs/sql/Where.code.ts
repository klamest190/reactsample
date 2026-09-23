import { sql } from '../../lernen/quelltext'
import type { SqlBeispiel } from '../../sql/check'

/** Code for chapter 9.2 - Filtering with WHERE. */

export const beispiele: Record<string, SqlBeispiel> = {
  'sql-where-einstieg': {
    code: sql`
      -- Only customers from the USA. Try 'UK' - or country <> 'USA'.
      SELECT name, city, country
      FROM customers
      WHERE country = 'USA'
      ORDER BY name;
    `,
  },
  'sql-where-vergleiche': {
    code: sql`
      -- Cheap hardware: both conditions must be true
      SELECT name, price
      FROM products
      WHERE category = 'hardware' AND price < 50;

      -- One of several values: IN is shorter than a chain of OR
      SELECT name, category
      FROM products
      WHERE category IN ('books', 'accessories');

      -- A range including both ends - works for dates too
      SELECT id, ordered_at, status
      FROM orders
      WHERE ordered_at BETWEEN '2026-06-01' AND '2026-08-31';
    `,
  },
  'sql-where-klammern': {
    code: sql`
      -- Meant: hardware or books, each under 40.
      -- But AND binds more strongly than OR: hardware (any price) OR (books under 40)
      SELECT name, category, price
      FROM products
      WHERE category = 'hardware' OR category = 'books' AND price < 40;

      -- With parentheses it says what it means
      SELECT name, category, price
      FROM products
      WHERE (category = 'hardware' OR category = 'books') AND price < 40;
    `,
  },
  'sql-where-like': {
    code: sql`
      -- % stands for any number of characters, _ for exactly one
      SELECT name FROM products WHERE name LIKE 'Code%';

      -- LIKE is case-sensitive: '%BOOK%' finds nothing
      SELECT name FROM products WHERE name LIKE '%BOOK%';

      -- ILIKE (PostgreSQL) ignores case
      SELECT name FROM products WHERE name ILIKE '%book%';
    `,
  },
  'sql-where-null': {
    code: sql`
      -- Looks right, finds nothing: NULL is not equal to anything - not even to NULL
      SELECT name FROM customers WHERE email = NULL;

      -- This is how you ask for "no value"
      SELECT name FROM customers WHERE email IS NULL;

      -- Replace NULL for display
      SELECT name, coalesce(city, '(unknown)') AS city
      FROM customers
      WHERE country = 'UK';

      -- The trap: "not sold out" also drops the products WITHOUT stock (NULL)
      SELECT name, stock FROM products WHERE stock <> 0;
    `,
  },
  'sql-where-case': {
    code: sql`
      SELECT name, price,
             CASE
               WHEN price < 20  THEN 'cheap'
               WHEN price < 100 THEN 'medium'
               ELSE 'expensive'
             END AS price_range
      FROM products
      ORDER BY price;
    `,
  },
  'sql-where-uebung': {
    code: sql`
      SELECT name, stock
      FROM products;
    `,
    loesung: sql`
      SELECT name, stock
      FROM products
      WHERE stock < 10
      ORDER BY stock, name;
    `,
    tests: [
      { name: { de: 'Genau die Produkte mit weniger als 10 Stück', en: 'Exactly the products with fewer than 10 in stock' } },
      { name: { de: 'Kleinster Bestand zuerst, bei Gleichstand nach Name', en: 'Smallest stock first, ties by name' }, reihenfolge: true },
    ],
    tipps: {
      de: ['Die Bedingung heißt `stock < 10`.', 'Und NULL? `NULL < 10` ist nicht wahr - diese Zeilen fallen von selbst heraus.', 'Sortieren: `ORDER BY stock, name`.'],
      en: ['The condition is `stock < 10`.', 'And NULL? `NULL < 10` is not true - these rows drop out by themselves.', 'Sort: `ORDER BY stock, name`.'],
    },
  },
}

export const codeBloecke = {
  operatoren: sql`
    price = 10        price <> 10       -- equal, not equal (!= works too)
    price < 10        price <= 10       -- smaller (or equal)
    price > 10        price >= 10       -- greater (or equal)
    NOT (price > 10)                    -- negation
    name = 'Ada'                        -- text: exact, case-sensitive
    ordered_at >= '2026-07-01'          -- dates are compared like numbers
  `,
  null: sql`
    NULL = NULL          -- NULL  (not true!)
    NULL <> 1            -- NULL
    NULL + 1             -- NULL
    NULL IS NULL         -- true
    coalesce(NULL, 'x')  -- 'x'
  `,
}
