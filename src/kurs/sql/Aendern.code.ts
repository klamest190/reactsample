import { sql } from '../../lernen/quelltext'
import type { SqlBeispiel } from '../../sql/check'

/** Code for chapter 9.5 - Changing data & transactions. */

export const beispiele: Record<string, SqlBeispiel> = {
  'sql-aendern-einstieg': {
    code: sql`
      -- A new customer. id and joined are filled in by the database (DEFAULT).
      INSERT INTO customers (name, company, email, city, country)
      VALUES ('Radia Perlman', 'Spanning Trees Inc', 'radia@stp.example', 'Seattle', 'USA')
      RETURNING id, name, joined;

      SELECT id, name, country FROM customers ORDER BY id DESC LIMIT 3;
    `,
  },
  'sql-aendern-insert': {
    code: sql`
      -- Several rows at once; columns that are left out get their DEFAULT (or NULL)
      INSERT INTO products (name, category, price, stock)
      VALUES ('USB Microphone', 'hardware', 69.00, 12),
             ('Pair Programming Session', 'service', 150.00, NULL)
      RETURNING *;
    `,
  },
  'sql-aendern-update': {
    code: sql`
      -- All books 10 % more expensive - RETURNING shows the new prices
      UPDATE products
      SET price = price * 1.10
      WHERE category = 'books'
      RETURNING name, price;

      -- Several columns at once
      UPDATE orders
      SET status = 'shipped'
      WHERE status = 'paid'
      RETURNING id, status;
    `,
  },
  'sql-aendern-delete': {
    code: sql`
      -- The cancelled order goes. Its line items go with it:
      -- order_items.order_id was declared with ON DELETE CASCADE.
      DELETE FROM orders
      WHERE status = 'cancelled'
      RETURNING id;

      SELECT count(*) AS line_items_left FROM order_items;
    `,
  },
  'sql-aendern-fremdschluessel': {
    code: sql`
      -- Ada still has orders - the foreign key protects them
      DELETE FROM customers
      WHERE id = 1;
    `,
  },
  'sql-aendern-rollback': {
    code: sql`
      BEGIN;

      UPDATE products SET price = 0;     -- oops: no WHERE - everything is free now
      SELECT name, price FROM products ORDER BY id LIMIT 3;

      ROLLBACK;                          -- undo everything since BEGIN

      SELECT name, price FROM products ORDER BY id LIMIT 3;
    `,
  },
  'sql-aendern-transaktion': {
    code: sql`
      -- Margaret (id 7) buys two laptop stands: order, line item and stock - all or nothing
      BEGIN;

      INSERT INTO orders (customer_id, status)
      VALUES (7, 'paid')
      RETURNING id;                      -- 121, the next free number

      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (121, 5, 2, 45.00);

      UPDATE products SET stock = stock - 2 WHERE id = 5
      RETURNING name, stock;

      COMMIT;
    `,
  },
  'sql-aendern-upsert': {
    code: sql`
      -- The email exists already: instead of an error, update the existing row
      INSERT INTO customers (name, email, city, country)
      VALUES ('Ada King', 'ada@engines.example', 'London', 'UK')
      ON CONFLICT (email) DO UPDATE
        SET name = excluded.name
      RETURNING id, name, email;
    `,
  },
  'sql-aendern-uebung': {
    code: sql`
      -- 1. All books 10 % cheaper

      -- 2. Then the new book, at the full price

    `,
    loesung: sql`
      UPDATE products
      SET price = price * 0.9
      WHERE category = 'books';

      INSERT INTO products (name, category, price, stock)
      VALUES ('PostgreSQL Pocket Guide', 'books', 19.90, 30);
    `,
    tests: [
      {
        name: { de: 'Die Bücher: drei günstiger, eines neu', en: 'The books: three cheaper, one new' },
        abfrage: `SELECT name, price, stock FROM products WHERE category = 'books' ORDER BY name`,
      },
      {
        name: { de: 'Alle anderen Produkte sind unverändert', en: 'All other products are unchanged' },
        abfrage: `SELECT name, price, stock FROM products WHERE category <> 'books' ORDER BY id`,
      },
    ],
    tipps: {
      de: [
        '10 % günstiger heißt `price * 0.9` - nur für `WHERE category = \'books\'`.',
        'Die Reihenfolge zählt: Erst das UPDATE, dann das INSERT - sonst wird das neue Buch mit reduziert.',
        '`INSERT INTO products (name, category, price, stock) VALUES (…)`',
      ],
      en: [
        '10 % cheaper means `price * 0.9` - only for `WHERE category = \'books\'`.',
        'The order matters: first the UPDATE, then the INSERT - otherwise the new book is reduced too.',
        '`INSERT INTO products (name, category, price, stock) VALUES (…)`',
      ],
    },
  },
}

export const codeBloecke = {
  formen: sql`
    INSERT INTO table (column1, column2) VALUES (value1, value2);
    UPDATE table SET column1 = value1 WHERE condition;
    DELETE FROM table WHERE condition;
    -- all three: add RETURNING column, … to see the affected rows
  `,
  fehler: sql`
    ERROR:  null value in column "name" of relation "customers" violates not-null constraint
    ERROR:  duplicate key value violates unique constraint "customers_email_key"
    ERROR:  new row for relation "products" violates check constraint "products_price_check"
    ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
  `,
}
