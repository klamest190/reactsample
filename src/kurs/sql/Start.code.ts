import { js, sql } from '../../lernen/quelltext'
import type { SqlBeispiel } from '../../sql/check'

/** Code for chapter 9.1 - Tables & SELECT. Runs on real PostgreSQL (src/sql/). */

export const beispiele: Record<string, SqlBeispiel> = {
  'sql-start-einstieg': {
    code: sql`
      -- Your first query: three columns of all customers, sorted by name.
      -- Change something and press Ctrl+Enter - e.g. add the column country.
      SELECT name, company, city
      FROM customers
      ORDER BY name;
    `,
  },
  'sql-start-erkunden': {
    code: sql`
      -- psql meta commands start with a backslash and need no semicolon.
      \dt
      \d products
    `,
  },
  'sql-start-select': {
    code: sql`
      -- All columns - handy for exploring
      SELECT * FROM products;

      -- Only some columns, a calculation and new names with AS
      SELECT name,
             price,
             price * 1.19          AS gross,
             'only ' || price || ' €' AS advert
      FROM products;
    `,
  },
  'sql-start-sortieren': {
    code: sql`
      -- The most expensive first; with the same price alphabetically
      SELECT name, category, price
      FROM products
      ORDER BY price DESC, name
      LIMIT 5;

      -- Every category only once
      SELECT DISTINCT category
      FROM products
      ORDER BY category;
    `,
  },
  'sql-start-uebung': {
    code: sql`
      SELECT *
      FROM products;
    `,
    loesung: sql`
      SELECT name, price
      FROM products
      ORDER BY price DESC
      LIMIT 5;
    `,
    tests: [
      { name: { de: 'Genau die fünf teuersten Produkte, mit Name und Preis', en: 'Exactly the five most expensive products, with name and price' } },
      { name: { de: 'Das teuerste steht oben', en: 'The most expensive one comes first' }, reihenfolge: true },
    ],
    tipps: {
      de: ['Wähle die zwei Spalten statt `*`.', 'Sortiere mit `ORDER BY price DESC`.', 'Begrenze mit `LIMIT 5` - das steht ganz am Ende.'],
      en: ['Select the two columns instead of `*`.', 'Sort with `ORDER BY price DESC`.', 'Limit with `LIMIT 5` - that goes at the very end.'],
    },
  },
}

export const codeBloecke = {
  syntax: sql`
    SELECT name, price        -- which columns
    FROM products             -- from which table
    ORDER BY price DESC       -- sorted how (optional)
    LIMIT 3;                  -- how many (optional)
  `,
  regeln: sql`
    select NAME from PRODUCTS;          -- keywords and names: case does not matter
    SELECT 'Ada' AS "First Name";       -- 'text' in single quotes, "names" in double quotes
    SELECT 1; SELECT 2;                 -- ; ends a statement
    /* a comment
       over several lines */
  `,
  docker: js`
    docker run -d --name db -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:17
    docker exec -it db psql -U postgres
  `,
  psql: sql`
    postgres=# \l                 -- list the databases
    postgres=# CREATE DATABASE shop;
    postgres=# \c shop            -- connect to shop
    shop=# \dt                    -- the tables
    shop=# \d customers           -- columns, keys, indexes of one table
    shop=# SELECT count(*) FROM customers;
    shop=# \q                     -- quit
  `,
}
