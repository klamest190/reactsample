import { http, java } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Code for chapter 8.2 - Beans & dependency injection. */

// The main class is the same everywhere - it is put in front of every example.
const APP = java`
  @SpringBootApplication
  public class ShopApplication {
    public static void main(String[] args) {
      SpringApplication.run(ShopApplication.class, args);
    }
  }
`
const withApp = (code: string) => `${APP}\n\n${code}`

export const beispiele = {
  'spring-beans-einstieg': {
    code: withApp(java`
      @Service
      class GreetingService {
        String greet(String name) {
          return "Hello, " + name + "!";
        }
      }

      @RestController
      class GreetingController {
        private final GreetingService service;

        // No "new" anywhere: Spring sees the parameter and passes the GreetingService bean.
        GreetingController(GreetingService service) {
          this.service = service;
        }

        @GetMapping("/greet")
        String greet(@RequestParam(defaultValue = "World") String name) {
          return service.greet(name);
        }
      }
    `),
    requests: http`
      GET /greet?name=Ada
      → 200 "Hello, Ada!"
    `,
  },
  'spring-beans-singleton': {
    code: withApp(java`
      @Service
      class VisitCounter {
        private int visits = 0;

        int next() {
          return ++visits;
        }
      }

      @RestController
      class HomeController {
        private final VisitCounter counter;

        HomeController(VisitCounter counter) {
          this.counter = counter;
        }

        @GetMapping("/home")
        String home() {
          return "Home - visit no. " + counter.next();
        }
      }

      @RestController
      class ShopController {
        private final VisitCounter counter;

        ShopController(VisitCounter counter) {
          this.counter = counter;
        }

        @GetMapping("/shop")
        String shop() {
          return "Shop - visit no. " + counter.next();
        }
      }
    `),
    requests: http`
      GET /home
      GET /shop
      GET /home
    `,
  },
  'spring-beans-fehlt': {
    // On purpose: FriendlyGreeter has no annotation - there is no bean of type Greeter.
    code: withApp(java`
      interface Greeter {
        String greet(String name);
      }

      class FriendlyGreeter implements Greeter {
        public String greet(String name) {
          return "Hi " + name;
        }
      }

      @RestController
      class GreetingController {
        private final Greeter greeter;

        GreetingController(Greeter greeter) {
          this.greeter = greeter;
        }
      }
    `),
  },
  'spring-beans-zwei': {
    // On purpose: two beans implement Greeter - which one should Spring pass?
    code: withApp(java`
      interface Greeter {
        String greet(String name);
      }

      @Component
      class EnglishGreeter implements Greeter {
        public String greet(String name) { return "Hello " + name; }
      }

      @Component
      class GermanGreeter implements Greeter {
        public String greet(String name) { return "Hallo " + name; }
      }

      @RestController
      class GreetingController {
        private final Greeter greeter;

        GreetingController(Greeter greeter) {
          this.greeter = greeter;
        }
      }
    `),
  },
  'spring-beans-primary': {
    code: withApp(java`
      interface Greeter {
        String greet(String name);
      }

      @Component
      @Primary                      // wins whenever a single Greeter is needed
      class EnglishGreeter implements Greeter {
        public String greet(String name) { return "Hello " + name; }
      }

      @Component
      class GermanGreeter implements Greeter {
        public String greet(String name) { return "Hallo " + name; }
      }

      @RestController
      class GreetingController {
        private final Greeter standard;
        private final Greeter german;
        private final List<Greeter> all;

        GreetingController(Greeter standard,
                           @Qualifier("germanGreeter") Greeter german,
                           List<Greeter> all) {
          this.standard = standard;
          this.german = german;
          this.all = all;
        }

        @GetMapping("/greet")
        String greet(@RequestParam String name) {
          return standard.greet(name);
        }

        @GetMapping("/greet/de")
        String greetGerman(@RequestParam String name) {
          return german.greet(name);
        }

        @GetMapping("/greet/all")
        List<String> greetAll(@RequestParam String name) {
          List<String> result = new ArrayList<>();
          for (Greeter greeter : all) {
            result.add(greeter.greet(name));
          }
          return result;
        }
      }
    `),
    requests: http`
      GET /greet?name=Ada
      → 200 "Hello Ada"
      GET /greet/de?name=Ada
      → 200 "Hallo Ada"
      GET /greet/all?name=Ada
      → 200 ["Hello Ada", "Hallo Ada"]
    `,
  },
  'spring-beans-bean': {
    code: withApp(java`
      // Imagine this class comes from a library: you cannot put @Component on it.
      class PriceFormatter {
        private final String currency;

        PriceFormatter(String currency) {
          this.currency = currency;
        }

        String format(double amount) {
          return String.format("%.2f %s", amount, currency);
        }
      }

      @Configuration
      class ShopConfig {

        // The return value becomes a bean named "priceFormatter".
        @Bean
        PriceFormatter priceFormatter() {
          return new PriceFormatter("EUR");
        }

        // Runs once after the start - handy for test data or a quick check.
        @Bean
        CommandLineRunner hello(PriceFormatter formatter) {
          return args -> System.out.println("The shop is open, a coffee costs " + formatter.format(3.5));
        }
      }

      @RestController
      class PriceController {
        private final PriceFormatter formatter;

        PriceController(PriceFormatter formatter) {
          this.formatter = formatter;
        }

        @GetMapping("/price")
        String price(@RequestParam double amount) {
          return formatter.format(amount);
        }
      }
    `),
    requests: http`
      GET /price?amount=19.9
      → 200 "19.90 EUR"
    `,
  },
  'spring-beans-kreis': {
    // On purpose: the two services need each other.
    code: withApp(java`
      @Service
      class OrderService {
        private final CustomerService customers;
        OrderService(CustomerService customers) { this.customers = customers; }
      }

      @Service
      class CustomerService {
        private final OrderService orders;
        CustomerService(OrderService orders) { this.orders = orders; }
      }
    `),
  },
  'spring-beans-uebung': {
    tipps: {
      de: [
        'Klassen werden zu Beans, wenn sie eine Annotation tragen: `@Service` für `PriceService`, `@Component` für beide Rabatt-Klassen.',
        'Der Controller soll nichts mehr mit `new` erzeugen: Er bekommt den `PriceService` als Konstruktor-Parameter.',
        '`PriceService` bekommt eine `DiscountPolicy` als Konstruktor-Parameter. Weil es zwei gibt, gewinnt die mit `@Primary`.',
      ],
      en: [
        'Classes become beans when they carry an annotation: `@Service` for `PriceService`, `@Component` for both discount classes.',
        'The controller should not create anything with `new` any more: it gets the `PriceService` as a constructor parameter.',
        '`PriceService` gets a `DiscountPolicy` as a constructor parameter. Since there are two, the one with `@Primary` wins.',
      ],
    },
    code: withApp(java`
      interface DiscountPolicy {
        double apply(double amount);
      }

      class NoDiscount implements DiscountPolicy {
        public double apply(double amount) { return amount; }
      }

      class StudentDiscount implements DiscountPolicy {
        public double apply(double amount) { return amount * 0.8; }
      }

      class PriceService {
        private final DiscountPolicy policy;

        PriceService(DiscountPolicy policy) {
          this.policy = policy;
        }

        double price(double amount) {
          return policy.apply(amount);
        }
      }

      @RestController
      class PriceController {
        // TODO: let Spring inject the PriceService instead of creating it here
        private final PriceService service = new PriceService(new NoDiscount());

        @GetMapping("/api/price")
        double price(@RequestParam double amount) {
          return service.price(amount);
        }
      }
    `),
    loesung: withApp(java`
      interface DiscountPolicy {
        double apply(double amount);
      }

      @Component
      class NoDiscount implements DiscountPolicy {
        public double apply(double amount) { return amount; }
      }

      @Component
      @Primary
      class StudentDiscount implements DiscountPolicy {
        public double apply(double amount) { return amount * 0.8; }
      }

      @Service
      class PriceService {
        private final DiscountPolicy policy;

        PriceService(DiscountPolicy policy) {
          this.policy = policy;
        }

        double price(double amount) {
          return policy.apply(amount);
        }
      }

      @RestController
      class PriceController {
        private final PriceService service;

        PriceController(PriceService service) {
          this.service = service;
        }

        @GetMapping("/api/price")
        double price(@RequestParam double amount) {
          return service.price(amount);
        }
      }
    `),
    tests: [
      {
        name: { de: 'GET /api/price?amount=100 → 80.0 (Studentenrabatt)', en: 'GET /api/price?amount=100 → 80.0 (student discount)' },
        http: 'GET /api/price?amount=100\n→ 200 80',
      },
      {
        name: { de: 'PriceService ist eine Bean', en: 'PriceService is a bean' },
        ausdruck: 'context.containsBean("priceService")',
      },
      {
        name: { de: 'Beide Rabatte sind Beans', en: 'Both discounts are beans' },
        ausdruck: 'context.containsBean("noDiscount") && context.containsBean("studentDiscount")',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  ohneSpring: java`
    // Without Spring: every class builds what it needs itself.
    class TodoController {
      private final TodoService service =
          new TodoService(new TodoRepository(new DataSource("jdbc:postgresql://…")));
    }
  `,
  mitSpring: java`
    // With Spring: every class only SAYS what it needs.
    @RestController
    class TodoController {
      private final TodoService service;

      TodoController(TodoService service) {   // Spring passes the bean
        this.service = service;
      }
    }
  `,
  feld: java`
    @RestController
    class TodoController {
      @Autowired                       // works - but:
      private TodoService service;     // not final, invisible from outside,
    }                                  // and a test has to use reflection to set it
  `,
  test: java`
    // A plain unit test - no Spring needed, because of the constructor:
    TodoController controller = new TodoController(new FakeTodoService());
  `,
  reactVergleich: java`
    // React (chapter 4.6): a value is PROVIDED once and USED deep down
    <ThemeProvider value="dark">  →  const theme = useContext(ThemeContext)

    // Spring: a bean is REGISTERED once and INJECTED where it is needed
    @Service class ThemeService   →  Controller(ThemeService themes)
  `,
}
