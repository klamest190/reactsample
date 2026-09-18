import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen (Anzeige) gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-kontrollfluss-einstieg': {
    code: js`
      const temperature = 23

      if (temperature > 20) {
        console.log('Warm ☀️')
      } else {
        console.log('Cold ❄️')
      }
    `,
  },
  'js-kontrollfluss-1': {
    code: js`
      console.log(5 == '5')     // true  - type conversion!
      console.log(5 === '5')    // false - different types
      console.log(0 == false)   // true
      console.log(0 === false)  // false
      console.log(null == undefined, null === undefined)

      // More comparisons
      console.log(3 !== 4, 10 >= 10, 'a' < 'b')

      // Logical operators
      const age = 20
      const hasTicket = true
      console.log(age >= 18 && hasTicket)  // AND
      console.log(age < 18 || hasTicket)   // OR
      console.log(!hasTicket)              // NOT
    `,
  },
  'js-kontrollfluss-2': {
    code: js`
      const temperature = 23

      if (temperature > 30) {
        console.log('Hot! 🥵')
      } else if (temperature > 15) {
        console.log('Pleasant 😊')
      } else {
        console.log('Chilly 🥶')
      }

      const trafficLight = 'yellow'

      switch (trafficLight) {
        case 'red':
          console.log('Stop')
          break
        case 'yellow':
          console.log('Caution')
          break   // without break it falls through to the next case!
        case 'green':
          console.log('Go')
          break
        default:
          console.log('Traffic light broken?')
      }
    `,
  },
  'js-kontrollfluss-3': {
    code: js`
      const points = 0
      const user = { name: 'Ada', address: null }

      // Ternary: a value depending on a condition
      const status = points > 50 ? 'passed' : 'failed'
      console.log(status)

      // && returns the second value only if the first is truthy
      console.log(true && 'is shown')
      console.log(false && 'is NOT shown')

      // || vs ?? - the difference with 0
      console.log('with ||:', points || 'not specified')
      console.log('with ??:', points ?? 'not specified')

      // Optional chaining
      console.log(user.address?.city)          // undefined instead of an error
      console.log(user.address?.city ?? 'unknown')
      // console.log(user.address.city)        // TypeError!
    `,
  },
  'js-kontrollfluss-4': {
    code: js`
      // Classic counting loop
      for (let i = 1; i <= 3; i++) {
        console.log('Round', i)
      }

      // for...of: over every element
      const fruits = ['apple', 'pear', 'kiwi']
      for (const fruit of fruits) {
        console.log('I eat', fruit)
      }

      // while: as long as the condition holds
      let countdown = 3
      while (countdown > 0) {
        console.log(countdown)
        countdown--
      }
      console.log('Liftoff! 🚀')
    `,
  },
  'js-kontrollfluss-uebung': {
    tipps: {
      de: [
        'Prüfe zuerst den Sonderfall „keine Punkte“: `points === null || points === undefined`.',
        'Dann von oben nach unten: `>= 90`, `>= 70`, `>= 50` - mit frühem `return` brauchst du kein `else`.',
      ],
      en: [
        'Check the special case “no points” first: `points === null || points === undefined`.',
        'Then from top to bottom: `>= 90`, `>= 70`, `>= 50` - with an early `return` you don’t need `else`.',
      ],
    },
    code: js`
      function grade(points) {
        // Your code here - return gives back the value
      }

      console.log(grade(95))
    `,
    loesung: js`
      function grade(points) {
        if (points === null || points === undefined) return 'not specified'
        if (points >= 90) return 'excellent'
        if (points >= 70) return 'good'
        if (points >= 50) return 'passed'
        return 'failed'
      }

      console.log(grade(95))
    `,
    tests: [
      { name: { de: 'grade(95) ist \'excellent\'', en: 'grade(95) is \'excellent\'' }, ausdruck: 'grade(95)', erwartet: 'excellent' },
      { name: { de: 'grade(90) ist \'excellent\' (Grenze)', en: 'grade(90) is \'excellent\' (boundary)' }, ausdruck: 'grade(90)', erwartet: 'excellent' },
      { name: { de: 'grade(75) ist \'good\'', en: 'grade(75) is \'good\'' }, ausdruck: 'grade(75)', erwartet: 'good' },
      { name: { de: 'grade(50) ist \'passed\'', en: 'grade(50) is \'passed\'' }, ausdruck: 'grade(50)', erwartet: 'passed' },
      { name: { de: 'grade(0) ist \'failed\'', en: 'grade(0) is \'failed\'' }, ausdruck: 'grade(0)', erwartet: 'failed' },
      { name: { de: 'grade(null) ist \'not specified\'', en: 'grade(null) is \'not specified\'' }, ausdruck: 'grade(null)', erwartet: 'not specified' },
      { name: { de: 'grade() ist \'not specified\'', en: 'grade() is \'not specified\'' }, ausdruck: 'grade()', erwartet: 'not specified' },
    ],
  },
} satisfies Record<string, CodeBeispiel>

/** Statische Codebeispiele (CodeBlock) in Reihenfolge ihres Auftretens. */
export const codeBloecke = {
  beispiel1: js`
    <p>{isLoggedIn ? \`Hello \${name}\` : 'Please log in'}</p>
    {error && <p className="error">{error}</p>}
    <span>{user?.address?.city ?? 'unknown'}</span>
  `,
}
