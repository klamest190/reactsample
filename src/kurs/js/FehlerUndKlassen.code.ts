import { js } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/**
 * Codebeispiele für dieses Kapitel - für die deutsche UND die englische Fassung.
 * Code ist immer Englisch; nur Testnamen und Tipps gibt es in beiden Sprachen.
 */

export const beispiele = {
  'js-fehler-einstieg': {
    code: js`
      try {
        const data = JSON.parse('{ broken json')
        console.log('never reached', data)
      } catch (error) {
        console.log('Caught:', error.message)
      }
      console.log('The program keeps running.')
    `,
  },
  'js-fehler-werfen': {
    code: js`
      function withdraw(balance, amount) {
        if (typeof amount !== 'number' || amount <= 0) {
          throw new TypeError('Amount must be a positive number')
        }
        if (amount > balance) {
          throw new RangeError('Not enough money: ' + balance + ' available')
        }
        return balance - amount
      }

      for (const amount of [30, 500, -5]) {
        try {
          console.log('New balance:', withdraw(100, amount))
        } catch (error) {
          // name tells you the kind of error, message the details
          console.log(error.name + ': ' + error.message)
        } finally {
          // runs in every case - for cleanup like hiding a spinner
          console.log('  (finally for ' + amount + ')')
        }
      }

      // Without try/catch an error stops the whole script:
      // withdraw(100, 500)
    `,
  },
  'js-fehler-klassen': {
    code: js`
      class Counter {
        // Field with a start value - every instance gets its own
        count = 0
        // Private field: only reachable inside the class
        #step

        constructor(step = 1) {
          this.#step = step
        }

        increment() {
          this.count += this.#step
          return this // allows chaining: counter.increment().increment()
        }

        // Getter: read like a field, computed like a function
        get isEven() {
          return this.count % 2 === 0
        }

        static fromString(text) {
          return new Counter(Number(text))
        }
      }

      const a = new Counter()
      const b = new Counter(5)
      a.increment().increment()
      b.increment()

      console.log(a.count, a.isEven) // 2 true
      console.log(b.count, b.isEven) // 5 false
      console.log(Counter.fromString('10').increment().count) // 10
      console.log(a instanceof Counter) // true
      // console.log(a.#step) // SyntaxError: private field
    `,
  },
  'js-fehler-this': {
    code: js`
      class Timer {
        seconds = 3

        tick() {
          // this = the object before the dot: timer.tick() -> this is timer
          this.seconds--
          console.log('seconds:', this.seconds)
        }
      }

      const timer = new Timer()
      timer.tick() // works: called as timer.tick()

      // Passing the method on loses the object in front of the dot:
      const tick = timer.tick
      try {
        tick()
      } catch (error) {
        console.log('Lost this:', error.message)
      }

      // Fix 1: an arrow function that calls it with the dot
      setTimeout(() => timer.tick(), 10)

      // Fix 2: bind fixes this once and for all
      setTimeout(timer.tick.bind(timer), 20)

      // Arrow functions have no own this - they use the one from outside.
      // That is why function components in React never need this.
    `,
  },
  'js-fehler-vererbung': {
    code: js`
      // Own error types: extends Error, name for display
      class ValidationError extends Error {
        constructor(field, message) {
          super(message) // calls the constructor of Error
          this.name = 'ValidationError'
          this.field = field
        }
      }

      function register(user) {
        if (!user.email.includes('@')) throw new ValidationError('email', 'Invalid e-mail')
        if (user.password.length < 8) throw new ValidationError('password', 'Password too short')
        return { id: 1, ...user }
      }

      function handleSubmit(user) {
        try {
          console.log('Registered:', register(user).email)
        } catch (error) {
          // instanceof tells expected errors from real bugs
          if (error instanceof ValidationError) {
            console.log('Show next to field "' + error.field + '": ' + error.message)
          } else {
            throw error // unknown errors: pass them on, never swallow them
          }
        }
      }

      handleSubmit({ email: 'ada@example.com', password: 'secret123' })
      handleSubmit({ email: 'ada.example.com', password: 'secret123' })
      handleSubmit({ email: 'ada@example.com', password: '123' })
    `,
  },
  'js-fehler-uebung': {
    tipps: {
      de: [
        'Beginne mit `class InsufficientFundsError extends Error` - im Konstruktor `super(…)` aufrufen und `this.name` setzen.',
        'Der Kontostand gehört in ein privates Feld `#balance`, nach außen gibt ihn ein Getter `get balance()` heraus.',
        'In `withdraw` zuerst prüfen und werfen, erst danach abziehen - sonst ist der Kontostand bei einem Fehler schon verändert.',
      ],
      en: [
        'Start with `class InsufficientFundsError extends Error` - call `super(…)` in the constructor and set `this.name`.',
        'The balance belongs in a private field `#balance`; a getter `get balance()` exposes it.',
        'In `withdraw`, check and throw first and only subtract afterwards - otherwise the balance has already changed when an error happens.',
      ],
    },
    code: js`
      // 1. class InsufficientFundsError extends Error

      // 2. class BankAccount
      //    - new BankAccount(owner, start = 0)
      //    - balance (getter, read-only)
      //    - deposit(amount), withdraw(amount)
      //    - history: array of { type: 'deposit' | 'withdraw', amount }

      // 3. safeWithdraw(account, amount)
      //    returns true on success, false for InsufficientFundsError,
      //    and throws every other error on
    `,
    loesung: js`
      class InsufficientFundsError extends Error {
        constructor(balance, amount) {
          super('Cannot withdraw ' + amount + ', only ' + balance + ' available')
          this.name = 'InsufficientFundsError'
        }
      }

      class BankAccount {
        #balance
        history = []

        constructor(owner, start = 0) {
          this.owner = owner
          this.#balance = start
        }

        get balance() {
          return this.#balance
        }

        deposit(amount) {
          if (amount <= 0) throw new RangeError('Amount must be positive')
          this.#balance += amount
          this.history.push({ type: 'deposit', amount })
        }

        withdraw(amount) {
          if (amount <= 0) throw new RangeError('Amount must be positive')
          if (amount > this.#balance) throw new InsufficientFundsError(this.#balance, amount)
          this.#balance -= amount
          this.history.push({ type: 'withdraw', amount })
        }
      }

      function safeWithdraw(account, amount) {
        try {
          account.withdraw(amount)
          return true
        } catch (error) {
          if (error instanceof InsufficientFundsError) return false
          throw error
        }
      }

      const account = new BankAccount('Ada', 100)
      account.deposit(50)
      console.log(account.balance, safeWithdraw(account, 500), account.history)
    `,
    tests: [
      {
        name: { de: 'Startguthaben und Einzahlung', en: 'Starting balance and deposit' },
        ausdruck: '(() => { const a = new BankAccount("Ada", 100); a.deposit(50); return a.balance })()',
        erwartet: 150,
      },
      {
        name: { de: 'Startguthaben ist ohne Angabe 0', en: 'Starting balance defaults to 0' },
        ausdruck: 'new BankAccount("Ada").balance',
        erwartet: 0,
      },
      {
        name: { de: 'balance lässt sich nicht von außen setzen', en: 'balance cannot be set from outside' },
        ausdruck: '(() => { const a = new BankAccount("Ada", 100); try { a.balance = 1e6 } catch {} return a.balance })()',
        erwartet: 100,
      },
      {
        name: { de: 'Zu viel abheben wirft InsufficientFundsError', en: 'Withdrawing too much throws InsufficientFundsError' },
        ausdruck: '(() => { const a = new BankAccount("Ada", 10); try { a.withdraw(50) } catch (e) { return e instanceof InsufficientFundsError && e instanceof Error && e.name } return "no error" })()',
        erwartet: 'InsufficientFundsError',
      },
      {
        name: { de: 'Nach dem Fehler ist das Guthaben unverändert', en: 'The balance is unchanged after the error' },
        ausdruck: '(() => { const a = new BankAccount("Ada", 10); try { a.withdraw(50) } catch {} return a.balance })()',
        erwartet: 10,
      },
      {
        name: { de: 'history protokolliert beide Buchungen', en: 'history records both transactions' },
        ausdruck: '(() => { const a = new BankAccount("Ada", 100); a.deposit(20); a.withdraw(30); return a.history })()',
        erwartet: [
          { type: 'deposit', amount: 20 },
          { type: 'withdraw', amount: 30 },
        ],
      },
      {
        name: { de: 'safeWithdraw liefert true bzw. false', en: 'safeWithdraw returns true or false' },
        ausdruck: '(() => { const a = new BankAccount("Ada", 100); return [safeWithdraw(a, 40), safeWithdraw(a, 400), a.balance] })()',
        erwartet: [true, false, 60],
      },
      {
        name: { de: 'safeWithdraw reicht andere Fehler weiter', en: 'safeWithdraw passes other errors on' },
        ausdruck: '(() => { try { safeWithdraw({ withdraw() { throw new TypeError("boom") } }, 1); return "swallowed" } catch (e) { return e.message } })()',
        erwartet: 'boom',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>
