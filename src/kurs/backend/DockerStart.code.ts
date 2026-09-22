import { js } from '../../lernen/quelltext'
import type { TerminalTask } from '../demos/DockerTerminal'

/** Code for chapter 8.8 - Containers & images. The terminal is simulated (src/docker/cli.ts). */

const running = (image: string) => (c: { image: string; status: string }) => c.image.startsWith(image) && c.status === 'running'

export const terminalTasks: TerminalTask[] = [
  {
    text: { de: 'Starte den Container `hello-world`.', en: 'Start the container `hello-world`.' },
    command: 'docker run hello-world',
    done: (s) => s.containers.some((c) => c.image === 'hello-world') || s.history.some((h) => /run .*hello-world/.test(h)),
  },
  {
    text: {
      de: 'Starte nginx **im Hintergrund** mit dem Namen `web`, Port 8080 deines Rechners auf Port 80 des Containers.',
      en: 'Start nginx **in the background** named `web`, port 8080 of your machine to port 80 of the container.',
    },
    command: 'docker run -d --name web -p 8080:80 nginx',
    done: (s) => s.containers.some((c) => c.name === 'web' && running('nginx')(c) && c.ports.some((p) => p.host === 8080 && p.container === 80)),
  },
  {
    text: { de: 'Sieh nach, welche Container laufen.', en: 'Check which containers are running.' },
    command: 'docker ps',
    done: (s) => s.history.some((h) => /^docker (ps|container ls)/.test(h)),
  },
  {
    text: { de: 'Ruf die Seite ab: `curl http://localhost:8080`', en: 'Fetch the page: `curl http://localhost:8080`' },
    command: 'curl http://localhost:8080',
    done: (s) => s.history.some((h) => /^curl .*8080/.test(h)) && s.containers.some((c) => c.name === 'web'),
  },
  {
    text: {
      de: 'Starte PostgreSQL als `db` im Hintergrund - so, dass der Container **läuft** (Tipp: `docker logs db`).',
      en: 'Start PostgreSQL as `db` in the background - so that the container **keeps running** (tip: `docker logs db`).',
    },
    command: 'docker rm -f db && docker run -d --name db -e POSTGRES_PASSWORD=secret postgres:17',
    done: (s) => s.containers.some((c) => c.name === 'db' && running('postgres')(c)),
  },
  {
    text: { de: 'Stoppe `web` und entferne den Container.', en: 'Stop `web` and remove the container.' },
    command: 'docker rm -f web',
    done: (s) => s.history.some((h) => /run .*--name web/.test(h)) && !s.containers.some((c) => c.name === 'web'),
  },
]

/** Exercise: volumes, logs and exec - the topics of the later sections. */
export const uebungTasks: TerminalTask[] = [
  {
    text: {
      de: 'Starte PostgreSQL als `shop-db` im Hintergrund, mit dem Volume `shop-data` auf `/var/lib/postgresql/data`.',
      en: 'Start PostgreSQL as `shop-db` in the background, with the volume `shop-data` on `/var/lib/postgresql/data`.',
    },
    command: 'docker run -d --name shop-db -e POSTGRES_PASSWORD=secret -v shop-data:/var/lib/postgresql/data postgres:17',
    // Auch über die Historie, damit der Haken stehen bleibt, wenn der Container
    // in der letzten Aufgabe wieder entfernt wird.
    done: (s) =>
      s.containers.some(
        (c) => c.name === 'shop-db' && running('postgres')(c) && c.volumes.some((v) => v.source === 'shop-data'),
      ) || s.history.some((h) => /run .*--name shop-db.*-v shop-data:/.test(h)),
  },
  {
    text: {
      de: 'Sieh nach, was der Container ausgegeben hat.',
      en: 'Check what the container printed.',
    },
    command: 'docker logs shop-db',
    done: (s) => s.history.some((h) => /^docker logs .*shop-db/.test(h)),
  },
  {
    text: {
      de: 'Entferne `shop-db` wieder - und prüfe, dass das Volume `shop-data` noch da ist.',
      en: 'Remove `shop-db` again - and check that the volume `shop-data` is still there.',
    },
    command: 'docker rm -f shop-db && docker volume ls',
    done: (s) =>
      !s.containers.some((c) => c.name === 'shop-db') &&
      s.volumes.includes('shop-data') &&
      s.history.some((h) => /^docker volume ls/.test(h)),
  },
]

export const codeBloecke = {
  befehle: js`
    docker run hello-world                      # pull the image (if needed) and start a container
    docker run -d --name web -p 8080:80 nginx   # in the background, named, with a port
    docker ps                                   # running containers   (-a: also stopped ones)
    docker logs web                             # what the container printed   (-f: keep following)
    docker exec web ls /usr/share/nginx/html    # run a command INSIDE the running container
    docker stop web                             # stop (the container still exists)
    docker start web                            # start it again
    docker rm web                               # remove it   (-f: stop + remove)
    docker images                               # images on this machine
    docker pull postgres:17                     # only download
  `,
  run: js`
    docker run  -d  --name db  -p 5432:5432  -e POSTGRES_PASSWORD=secret  -v db-data:/var/lib/postgresql/data  postgres:17
                │   │          │             │                            │                                   │
                │   │          │             │                            │                                   └ image:tag
                │   │          │             │                            └ volume: data survives the container
                │   │          │             └ environment variable
                │   │          └ port HOST:CONTAINER
                │   └ a name instead of a random one
                └ detached: in the background
  `,
  tags: js`
    postgres:17          ← repository : tag (the version)
    postgres:17-alpine   ← the same on a tiny Linux (Alpine)
    postgres             ← means postgres:latest - "whatever is newest today"
  `,
  volume: js`
    docker volume create db-data
    docker run -d --name db -e POSTGRES_PASSWORD=secret -v db-data:/var/lib/postgresql/data postgres:17
    docker rm -f db                       # the container is gone ...
    docker run -d --name db -e POSTGRES_PASSWORD=secret -v db-data:/var/lib/postgresql/data postgres:17
                                          # ... the data is still there
  `,
  installieren: js`
    # Windows / macOS: install Docker Desktop (docker.com), then in a terminal:
    $ docker --version
    $ docker run hello-world
  `,
}
