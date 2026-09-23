import { java, sql } from '../../lernen/quelltext'
import type { SqlBeispiel } from '../../sql/check'

/** Code for chapter 9.6 - Designing tables: CREATE TABLE. */

export const beispiele: Record<string, SqlBeispiel> = {
  'sql-tabellen-einstieg': {
    code: sql`
      -- A new table for product reviews - with rules the database enforces
      CREATE TABLE reviews (
        id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        product_id  integer NOT NULL REFERENCES products (id),
        customer_id integer NOT NULL REFERENCES customers (id),
        rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     text,
        created_at  timestamptz NOT NULL DEFAULT now()
      );

      INSERT INTO reviews (product_id, customer_id, rating, comment)
      VALUES (15, 1, 5, 'Solved every bug I explained to it.'),
             (3,  9, 4, NULL);

      SELECT r.rating, p.name AS product, c.name AS customer, r.comment
      FROM reviews r
      JOIN products p  ON p.id = r.product_id
      JOIN customers c ON c.id = r.customer_id;
    `,
  },
  'sql-tabellen-check': {
    code: sql`
      CREATE TABLE reviews (
        id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        product_id  integer NOT NULL REFERENCES products (id),
        rating      integer NOT NULL CHECK (rating BETWEEN 1 AND 5)
      );

      INSERT INTO reviews (product_id, rating) VALUES (1, 5);   -- fine
      INSERT INTO reviews (product_id, rating) VALUES (1, 6);   -- 6 stars? The CHECK says no.
    `,
  },
  'sql-tabellen-alter': {
    code: sql`
      -- Add a column - existing rows get the DEFAULT
      ALTER TABLE customers ADD COLUMN newsletter boolean NOT NULL DEFAULT false;

      -- Rename, add a rule afterwards
      ALTER TABLE products RENAME COLUMN stock TO in_stock;
      ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name);

      UPDATE customers SET newsletter = true WHERE country = 'Germany';

      SELECT name, newsletter FROM customers WHERE newsletter;
      \d products
    `,
  },
  'sql-tabellen-index': {
    code: sql`
      -- 200,000 page views - enough for an index to matter
      CREATE TABLE page_views (
        id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        customer_id integer NOT NULL,
        viewed_at   timestamptz NOT NULL
      );
      INSERT INTO page_views (customer_id, viewed_at)
      SELECT n % 5000, timestamptz '2026-01-01' + n * interval '1 minute'
      FROM generate_series(1, 200000) AS n;
      ANALYZE page_views;

      -- Without an index: PostgreSQL reads the whole table (Seq Scan)
      EXPLAIN SELECT * FROM page_views WHERE customer_id = 42;

      CREATE INDEX page_views_customer_idx ON page_views (customer_id);

      -- With an index: it jumps straight to the 40 matching rows
      EXPLAIN SELECT * FROM page_views WHERE customer_id = 42;
    `,
  },
  'sql-tabellen-uebung': {
    code: sql`
      CREATE TABLE wishlist (
        -- your columns
      );
    `,
    loesung: sql`
      CREATE TABLE wishlist (
        customer_id integer NOT NULL REFERENCES customers (id),
        product_id  integer NOT NULL REFERENCES products (id),
        added       date    NOT NULL DEFAULT current_date,
        PRIMARY KEY (customer_id, product_id)
      );

      INSERT INTO wishlist (customer_id, product_id) VALUES (1, 6);
    `,
    tests: [
      {
        name: { de: 'Spalten customer_id, product_id (integer) und added (date), alle Pflicht', en: 'Columns customer_id, product_id (integer) and added (date), all required' },
        abfrage: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'wishlist' ORDER BY ordinal_position`,
        reihenfolge: true,
      },
      {
        name: { de: 'Zwei Fremdschlüssel und ein Primärschlüssel aus beiden ids', en: 'Two foreign keys and a primary key made of both ids' },
        abfrage: `SELECT contype, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = to_regclass('wishlist') AND contype IN ('p', 'f')`,
      },
      {
        name: { de: 'added bekommt automatisch das heutige Datum', en: 'added gets today’s date automatically' },
        abfrage: `SELECT pg_get_expr(adbin, adrelid) FROM pg_attrdef WHERE adrelid = to_regclass('wishlist')`,
      },
      {
        name: { de: 'Ada (1) wünscht sich die Kopfhörer (6)', en: 'Ada (1) wishes for the headphones (6)' },
        abfrage: `SELECT customer_id, product_id, added = current_date FROM wishlist`,
      },
    ],
    tipps: {
      de: [
        'Eine Spalte mit Fremdschlüssel: `customer_id integer NOT NULL REFERENCES customers (id)`.',
        'Das heutige Datum als Standard: `DEFAULT current_date`.',
        'Ein Schlüssel aus zwei Spalten steht als eigene Zeile am Ende: `PRIMARY KEY (customer_id, product_id)`.',
      ],
      en: [
        'A column with a foreign key: `customer_id integer NOT NULL REFERENCES customers (id)`.',
        'Today’s date as the default: `DEFAULT current_date`.',
        'A key made of two columns is a separate line at the end: `PRIMARY KEY (customer_id, product_id)`.',
      ],
    },
  },
}

export const codeBloecke = {
  aufbau: sql`
    CREATE TABLE table_name (
      column  type  [rules],
      column  type  [rules],
      [rules for the whole table]
    );
  `,
  entity: java`
    @Entity
    @Table(name = "reviews")
    class Review {
      @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
      Long id;

      @ManyToOne(optional = false)      // product_id integer NOT NULL REFERENCES products
      Product product;

      @Column(nullable = false)
      int rating;

      String comment;
    }
  `,
  migration: sql`
    -- src/main/resources/db/migration/V2__add_reviews.sql  (Flyway)
    CREATE TABLE reviews (
      id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      product_id bigint NOT NULL REFERENCES products (id),
      rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5)
    );
  `,
}
