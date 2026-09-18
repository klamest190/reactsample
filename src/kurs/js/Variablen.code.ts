import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-variablen-einstieg': {
    code: js`
      const name = 'Ada'
      let age = 36
      age = age + 1

      console.log(\`\${name} is \${age} years old\`)
    `,
  },
  'js-variablen-1': {
    code: js`
      const language = 'JavaScript'
      let version = 2015

      console.log(language, version)

      version = 2025
      console.log('New version:', version)

      // Remove the // in front of the next line and run again:
      // language = 'TypeScript'
    `,
  },
  'js-variablen-2': {
    code: js`
      console.log(typeof 'Hello')
      console.log(typeof 42)
      console.log(typeof true)
      console.log(typeof undefined)
      console.log(typeof null)        // Careful: a famous bug in JS!
      console.log(typeof [1, 2, 3])
      console.log(typeof { a: 1 })
      console.log(typeof function () {})

      // This is how you recognize arrays:
      console.log(Array.isArray([1, 2, 3]))
    `,
  },
  'js-variablen-3': {
    code: js`
      const firstName = 'Grace'
      const lastName = 'Hopper'
      const year = 1906

      // Old: glue together with +
      console.log('Name: ' + firstName + ' ' + lastName)

      // New: template literal
      console.log(\`Name: \${firstName} \${lastName}, born \${year}\`)
      console.log(\`Today she would be \${2025 - year} years old.\`)

      // Useful string methods
      const text = '  Learning React  '
      console.log(text.trim())
      console.log(text.trim().toUpperCase())
      console.log(text.includes('React'))
      console.log('React'.length)
    `,
  },
  'js-variablen-4': {
    code: js`
      console.log('5' + 1)     // the string wins: "51"
      console.log('5' - 1)     // minus only exists for numbers: 4
      console.log(Number('42') + 1)
      console.log(String(42) + 1)

      // Boolean(x) shows whether a value is truthy or falsy
      console.log(Boolean(0), Boolean(''), Boolean(null))
      console.log(Boolean('0'), Boolean([]), Boolean({}))
    `,
  },
  'js-variablen-uebung': {
    tipps: {
      de: [
        'Werte, die sich nicht ändern, bekommen `const`.',
        'Ein Template-Literal steht in Backticks: `${firstName} is ${age} years old.`',
        '`age >= 18` ergibt direkt `true` oder `false`.',
      ],
      en: [
        'Values that don’t change get `const`.',
        'A template literal uses backticks: `${firstName} is ${age} years old.`',
        '`age >= 18` evaluates directly to `true` or `false`.',
      ],
    },
    code: js`
      // Your code:

    `,
    loesung: js`
      const firstName = 'Ada'
      const age = 36
      const sentence = \`\${firstName} is \${age} years old.\`
      const isAdult = age >= 18
    `,
    tests: [
      { name: { de: 'firstName ist "Ada"', en: 'firstName is "Ada"' }, ausdruck: 'firstName', erwartet: 'Ada' },
      { name: { de: 'age ist die Zahl 36 (kein String)', en: 'age is the number 36 (not a string)' }, ausdruck: 'age', erwartet: 36 },
      { name: { de: 'sentence stimmt', en: 'sentence is correct' }, ausdruck: 'sentence', erwartet: 'Ada is 36 years old.' },
      { name: { de: 'isAdult ist true', en: 'isAdult is true' }, ausdruck: 'isAdult', erwartet: true },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    const name = 'Ada'       // cannot be reassigned
    let points = 10          // can change
    points = points + 5      // ✓ allowed
    // name = 'Grace'        // ✗ TypeError: Assignment to constant variable
  `,
  beispiel2: js`false   0   ''   null   undefined   NaN`,
}
