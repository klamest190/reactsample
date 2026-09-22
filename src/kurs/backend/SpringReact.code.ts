import { http, java, js, properties } from '../../lernen/quelltext'
import type { CodeBeispiel } from '../../lernen/jsSandbox'

/** Code for chapter 8.7 - React meets Spring Boot. */

/** The backend of the full-stack workshop - the API the React app talks to. */
export const backend = java`
  @SpringBootApplication
  public class TodoApplication {
    public static void main(String[] args) {
      SpringApplication.run(TodoApplication.class, args);
    }
  }

  record Todo(long id, String title, boolean done) {}
  record NewTodo(@NotBlank @Size(max = 60) String title) {}
  record TodoPatch(boolean done) {}

  @RestController
  @RequestMapping("/api/todos")
  class TodoController {
    private final Map<Long, Todo> todos = new LinkedHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    TodoController() {
      add("Learn Spring Boot");
      add("Connect React and Spring");
    }

    private Todo add(String title) {
      Todo todo = new Todo(ids.incrementAndGet(), title.trim(), false);
      todos.put(todo.id(), todo);
      return todo;
    }

    @GetMapping
    List<Todo> all() {
      return new ArrayList<>(todos.values());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    Todo create(@Valid @RequestBody NewTodo body) {
      System.out.println("new todo: " + body.title());
      return add(body.title());
    }

    @PatchMapping("/{id}")
    ResponseEntity<Todo> patch(@PathVariable long id, @RequestBody TodoPatch patch) {
      Todo old = todos.get(id);
      if (old == null) return ResponseEntity.notFound().build();
      Todo updated = new Todo(id, old.title(), patch.done());
      todos.put(id, updated);
      return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable long id) {
      return todos.remove(id) == null ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
    }
  }
`

/** The frontend of the full-stack workshop - the todo app from part 6, now with a server. */
export const frontend = js`
  const json = { 'Content-Type': 'application/json' }

  function App() {
    const [todos, setTodos] = useState([])
    const [title, setTitle] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    async function load() {
      try {
        const response = await fetch('/api/todos')
        setTodos(await response.json())
        setError(null)
      } catch {
        setError('The server cannot be reached.')
      } finally {
        setLoading(false)
      }
    }

    useEffect(() => {
      load()
    }, [])

    async function add(event) {
      event.preventDefault()
      const response = await fetch('/api/todos', { method: 'POST', headers: json, body: JSON.stringify({ title }) })
      if (!response.ok) {
        setError(\`The server rejected the todo (\${response.status}).\`)
        return
      }
      setTitle('')
      load()
    }

    async function toggle(todo) {
      await fetch(\`/api/todos/\${todo.id}\`, { method: 'PATCH', headers: json, body: JSON.stringify({ done: !todo.done }) })
      load()
    }

    async function remove(todo) {
      await fetch(\`/api/todos/\${todo.id}\`, { method: 'DELETE' })
      load()
    }

    if (loading) return <p>Loading …</p>

    return (
      <div className="max-w-sm space-y-3">
        <form onSubmit={add} className="flex gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" className="flex-1 rounded border px-2 py-1" />
          <button className="rounded bg-emerald-600 px-3 py-1 text-white">Add</button>
        </form>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <ul className="space-y-1">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-2">
              <input type="checkbox" checked={todo.done} onChange={() => toggle(todo)} />
              <span className={todo.done ? 'flex-1 text-slate-400 line-through' : 'flex-1'}>{todo.title}</span>
              <button onClick={() => remove(todo)} aria-label={'Delete ' + todo.title}>✕</button>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-500">{todos.filter((t) => !t.done).length} open</p>
      </div>
    )
  }
`

export const beispiele = {
  'spring-react-uebung': {
    tipps: {
      de: [
        'Die Methode braucht `@PatchMapping("/{id}")`, die id per `@PathVariable long id` und den Body per `@RequestBody TodoPatch patch`.',
        'Records sind unveränderlich: Du baust ein neues `Todo` mit dem alten Titel und `patch.done()` und legst es mit `todos.put(id, …)` ab.',
        'Gibt es die id nicht, antwortest du mit `ResponseEntity.notFound().build()`, sonst mit `ResponseEntity.ok(updated)`.',
      ],
      en: [
        'The method needs `@PatchMapping("/{id}")`, the id through `@PathVariable long id` and the body through `@RequestBody TodoPatch patch`.',
        'Records are immutable: build a new `Todo` with the old title and `patch.done()` and store it with `todos.put(id, …)`.',
        'If the id does not exist, answer with `ResponseEntity.notFound().build()`, otherwise with `ResponseEntity.ok(updated)`.',
      ],
    },
    code: java`
      @SpringBootApplication
      public class TodoApplication {
        public static void main(String[] args) {
          SpringApplication.run(TodoApplication.class, args);
        }
      }

      record Todo(long id, String title, boolean done) {}
      record TodoPatch(boolean done) {}

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final Map<Long, Todo> todos = new LinkedHashMap<>(Map.of(1L, new Todo(1, "Learn Spring Boot", false)));

        @GetMapping
        List<Todo> all() {
          return new ArrayList<>(todos.values());
        }

        // TODO: PATCH /api/todos/{id} with the body {"done": true}
      }
    `,
    loesung: java`
      @SpringBootApplication
      public class TodoApplication {
        public static void main(String[] args) {
          SpringApplication.run(TodoApplication.class, args);
        }
      }

      record Todo(long id, String title, boolean done) {}
      record TodoPatch(boolean done) {}

      @RestController
      @RequestMapping("/api/todos")
      class TodoController {
        private final Map<Long, Todo> todos = new LinkedHashMap<>(Map.of(1L, new Todo(1, "Learn Spring Boot", false)));

        @GetMapping
        List<Todo> all() {
          return new ArrayList<>(todos.values());
        }

        @PatchMapping("/{id}")
        ResponseEntity<Todo> patch(@PathVariable long id, @RequestBody TodoPatch patch) {
          Todo old = todos.get(id);
          if (old == null) return ResponseEntity.notFound().build();
          Todo updated = new Todo(id, old.title(), patch.done());
          todos.put(id, updated);
          return ResponseEntity.ok(updated);
        }
      }
    `,
    tests: [
      {
        name: { de: 'PATCH setzt done und antwortet mit dem ToDo', en: 'PATCH sets done and answers with the todo' },
        http: 'PATCH /api/todos/1\n{"done": true}\n→ 200 {"id": 1, "title": "Learn Spring Boot", "done": true}',
      },
      {
        name: { de: 'Die Änderung ist danach in der Liste', en: 'The change shows up in the list afterwards' },
        http: 'PATCH /api/todos/1\n{"done": true}\nGET /api/todos\n→ 200 [{"done": true}]',
      },
      {
        name: { de: 'Unbekannte id → 404', en: 'Unknown id → 404' },
        http: 'PATCH /api/todos/9\n{"done": true}\n→ 404',
      },
    ],
  },
} satisfies Record<string, CodeBeispiel>

export const codeBloecke = {
  cors: http`
    # 1. The browser asks first ("preflight") - for POST with JSON, PUT, PATCH, DELETE:
    OPTIONS /api/todos
    Origin: http://localhost:5173
    Access-Control-Request-Method: POST

    # 2. The server has to allow it explicitly:
    → 200
    Access-Control-Allow-Origin: http://localhost:5173
    Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
  `,
  crossOrigin: java`
    @RestController
    @RequestMapping("/api/todos")
    @CrossOrigin(origins = "http://localhost:5173")    // only this one controller
    class TodoController { … }

    // or for the whole application:
    @Configuration
    class WebConfig implements WebMvcConfigurer {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE");
      }
    }
  `,
  proxy: js`
    // vite.config.ts - in development, /api goes to Spring Boot
    export default defineConfig({
      plugins: [react()],
      server: {
        proxy: {
          '/api': 'http://localhost:8080',
        },
      },
    })
  `,
  fetch: js`
    // Always the same pattern: send, check the status, read JSON
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) throw new Error('HTTP ' + response.status)   // fetch does NOT throw on 4xx/5xx
    const created = await response.json()
  `,
  nginx: js`
    # nginx.conf - in production nginx serves the React app AND forwards /api
    server {
      listen 80;
      root /usr/share/nginx/html;

      location /api/ {
        proxy_pass http://api:8080;      # "api" = the backend container (chapter 8.10)
      }

      location / {
        try_files $uri /index.html;      # React Router: every path gets index.html
      }
    }
  `,
  entwicklung: properties`
    # Two terminals during development:
    #   1)  ./mvnw spring-boot:run      → http://localhost:8080  (API)
    #   2)  npm run dev                 → http://localhost:5173  (React, /api via proxy)
  `,
}
