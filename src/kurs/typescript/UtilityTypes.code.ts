import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Codebeispiele für Kapitel 2.6 - Typ-Operatoren & Utility Types. */

export const beispiele = {
  'ts-utility-einstieg': {
    code: js`
      type Todo = { id: number; title: string; done: boolean }

      // Derive new types instead of writing them again:
      type TodoUpdate = Partial<Todo> // every field optional
      type TodoPreview = Pick<Todo, 'id' | 'title'> // only these fields
      type NewTodo = Omit<Todo, 'id'> // everything except id

      function updateTodo(todo: Todo, changes: TodoUpdate): Todo {
        return { ...todo, ...changes }
      }

      const todo: Todo = { id: 1, title: 'Learn utility types', done: false }
      const preview: TodoPreview = { id: todo.id, title: todo.title }
      const draft: NewTodo = { title: 'Write tests', done: false }

      console.log(updateTodo(todo, { done: true }))
      console.log(preview, draft)
    `,
  },
  'ts-utility-keyof-typeof': {
    code: js`
      // typeof in a type position turns a VALUE into a type
      const defaultSettings = {
        theme: 'light',
        fontSize: 16,
        notifications: true,
      }
      type Settings = typeof defaultSettings
      // = { theme: string; fontSize: number; notifications: boolean }

      // keyof turns a type into the union of its keys
      type SettingKey = keyof Settings // 'theme' | 'fontSize' | 'notifications'

      // Indexed access: the type of one field
      type FontSize = Settings['fontSize'] // number

      function change<K extends SettingKey>(key: K, value: Settings[K]) {
        console.log(\`change \${key} to\`, value)
      }

      change('fontSize', 18)
      change('theme', 'dark')
      // change('fontSize', 'big') // ❌ 'string' is not assignable to 'number'

      const biggest: FontSize = 32
      console.log(biggest)
    `,
  },
  'ts-utility-as-const': {
    code: js`
      // Without as const: string[] - any string would do
      const loose = ['small', 'medium', 'large']

      // With as const: readonly, and every value keeps its literal type
      const SIZES = ['small', 'medium', 'large'] as const
      type Size = (typeof SIZES)[number] // 'small' | 'medium' | 'large'

      function isSize(value: string): value is Size {
        return (SIZES as readonly string[]).includes(value)
      }

      // Works for objects, too
      const ROUTES = { home: '/', profile: '/profile' } as const
      type Route = (typeof ROUTES)[keyof typeof ROUTES] // '/' | '/profile'

      const current: Route = ROUTES.profile
      console.log(loose, SIZES, isSize('medium'), isSize('huge'), current)
    `,
  },
  'ts-utility-satisfies': {
    code: js`
      type Color = { r: number; g: number; b: number } | string

      // With an annotation, TypeScript forgets the details:
      const annotated: Record<string, Color> = { red: '#f00', green: { r: 0, g: 255, b: 0 } }
      // annotated.red.toUpperCase() // ❌ could also be an object - and "red" might not exist

      // satisfies checks the value - but keeps its exact type
      const palette = {
        red: '#f00',
        green: { r: 0, g: 255, b: 0 },
      } satisfies Record<string, Color>

      console.log(palette.red.toUpperCase(), palette.green.g) // both known exactly
      // const broken = { blue: 42 } satisfies Record<string, Color> // ❌ 'number' is not a Color

      console.log(Object.keys(annotated))
    `,
  },
  'ts-utility-mehr': {
    code: js`
      type Options = { timeout?: number; retries?: number }
      const full: Required<Options> = { timeout: 1000, retries: 3 } // everything required
      const frozen: Readonly<Options> = { timeout: 500 } // nothing may be reassigned

      // Types from functions
      function createUser(name: string, age: number) {
        return { id: name.length, name, age }
      }
      type User = ReturnType<typeof createUser> // { id: number; name: string; age: number }
      type CreateArgs = Parameters<typeof createUser> // [name: string, age: number]

      async function loadCount() {
        return 42
      }
      type Count = Awaited<ReturnType<typeof loadCount>> // number instead of Promise<number>

      // Filtering unions
      type Status = 'draft' | 'published' | 'archived' | null
      type Visible = Exclude<Status, 'archived' | null> // 'draft' | 'published'
      type OnlyDraft = Extract<Status, 'draft'> // 'draft'
      type Present = NonNullable<Status> // everything except null (and undefined)

      const args: CreateArgs = ['Ada', 36]
      const user: User = createUser(...args)
      const count: Count = 42
      const visible: Visible = 'published'
      const draftOnly: OnlyDraft = 'draft'
      const present: Present = 'archived'

      console.log(full, frozen, user, count)
      console.log(visible, draftOnly, present)
    `,
  },
  'ts-utility-uebung': {
    tipps: {
      de: [
        '`Omit<Product, \'id\'>` - alles außer `id`. `Pick<Product, \'id\' | \'name\'>` - nur diese beiden.',
        'Utility Types lassen sich verschachteln: `Partial<Pick<Product, \'name\' | \'price\' | \'stock\'>>`.',
        'Hänge `as const` an das Array und leite den Typ ab: `type Category = (typeof CATEGORIES)[number]`.',
      ],
      en: [
        '`Omit<Product, \'id\'>` - everything except `id`. `Pick<Product, \'id\' | \'name\'>` - only these two.',
        'Utility types can be nested: `Partial<Pick<Product, \'name\' | \'price\' | \'stock\'>>`.',
        'Add `as const` to the array and derive the type: `type Category = (typeof CATEGORIES)[number]`.',
      ],
    },
    code: js`
      type Product = { id: number; name: string; price: number; stock: number; tags: string[] }

      // 1. Like Product, but without id (the server assigns it)
      type ProductDraft = unknown

      // 2. Only name, price and stock - each of them optional
      type ProductPatch = unknown

      // 3. Only id and name
      type ProductSummary = unknown

      // 4. Category: exactly one of the values in CATEGORIES
      const CATEGORIES = ['kitchen', 'office', 'garden']
      type Category = unknown

      function createProduct(draft: ProductDraft, id: number): Product {
        return { ...draft, id }
      }

      function applyPatch(product: Product, patch: ProductPatch): Product {
        return { ...product, ...patch }
      }

      function summarize(product: Product): ProductSummary {
        return { id: product.id, name: product.name }
      }

      function isCategory(value: string): value is Category {
        return (CATEGORIES as readonly string[]).includes(value)
      }

      const mug = createProduct({ name: 'Mug', price: 9.5, stock: 12, tags: ['kitchen'] }, 1)
      console.log(applyPatch(mug, { price: 8 }), summarize(mug), isCategory('office'))
    `,
    loesung: js`
      type Product = { id: number; name: string; price: number; stock: number; tags: string[] }

      // 1. Like Product, but without id (the server assigns it)
      type ProductDraft = Omit<Product, 'id'>

      // 2. Only name, price and stock - each of them optional
      type ProductPatch = Partial<Pick<Product, 'name' | 'price' | 'stock'>>

      // 3. Only id and name
      type ProductSummary = Pick<Product, 'id' | 'name'>

      // 4. Category: exactly one of the values in CATEGORIES
      const CATEGORIES = ['kitchen', 'office', 'garden'] as const
      type Category = (typeof CATEGORIES)[number]

      function createProduct(draft: ProductDraft, id: number): Product {
        return { ...draft, id }
      }

      function applyPatch(product: Product, patch: ProductPatch): Product {
        return { ...product, ...patch }
      }

      function summarize(product: Product): ProductSummary {
        return { id: product.id, name: product.name }
      }

      function isCategory(value: string): value is Category {
        return (CATEGORIES as readonly string[]).includes(value)
      }

      const mug = createProduct({ name: 'Mug', price: 9.5, stock: 12, tags: ['kitchen'] }, 1)
      console.log(applyPatch(mug, { price: 8 }), summarize(mug), isCategory('office'))
    `,
    tests: [
      { name: 'applyPatch(mug, { price: 8 }).price', ausdruck: 'applyPatch(mug, { price: 8 }).price', erwartet: 8 },
      { name: 'summarize(mug)', ausdruck: 'summarize(mug)', erwartet: { id: 1, name: 'Mug' } },
      { name: "isCategory('garden') / isCategory('pool')", ausdruck: "[isCategory('garden'), isCategory('pool')]", erwartet: [true, false] },
    ],
    typTests: [
      {
        name: { de: 'ProductDraft hat alles außer id', en: 'ProductDraft has everything except id' },
        code: "const okDraft: ProductDraft = { name: 'A', price: 1, stock: 1, tags: [] }\n// @ts-expect-error - no id in a draft\nconst draftWithId: ProductDraft = { id: 1, name: 'A', price: 1, stock: 1, tags: [] }",
      },
      {
        name: { de: 'ProductPatch: name, price, stock - alles optional', en: 'ProductPatch: name, price, stock - all optional' },
        code: "const emptyPatch: ProductPatch = {}\nconst pricePatch: ProductPatch = { price: 5 }\n// @ts-expect-error - tags cannot be patched\nconst tagPatch: ProductPatch = { tags: [] }",
      },
      {
        name: { de: 'ProductSummary hat nur id und name', en: 'ProductSummary only has id and name' },
        code: "declare const summary: ProductSummary\nconst summaryName: string = summary.name\n// @ts-expect-error - no price in a summary\nsummary.price",
      },
      {
        name: { de: 'Category ist eine Union der Werte', en: 'Category is a union of the values' },
        code: "const garden: Category = 'garden'\n// @ts-expect-error - not a category\nconst pool: Category = 'pool'",
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  uebersicht: js`
    Partial<T>          every field optional              (update functions, patches)
    Required<T>         every field required
    Readonly<T>         every field readonly
    Pick<T, 'a' | 'b'>  only these fields
    Omit<T, 'a'>        everything except these fields
    Record<K, V>        object with keys K and values V
    ReturnType<F>       return type of a function type    (with typeof fn)
    Parameters<F>       parameters as a tuple
    Awaited<P>          what a promise resolves to
    Exclude<U, X>       remove members from a union
    Extract<U, X>       keep only these members of a union
    NonNullable<T>      remove null and undefined
  `,
}
