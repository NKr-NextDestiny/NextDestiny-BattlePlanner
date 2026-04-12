# NextDestiny BattlePlanner

**Team-scoped collaborative tactical strategy planning for Rainbow Six Siege.**

Built for the NKr-NextDestiny Discord community. Authenticate via Discord, select your team, and plan strategies together in real time. All content is isolated per team.

![Version](https://img.shields.io/badge/version-3.4.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Node](https://img.shields.io/badge/Node.js-24-green)

---

## Features

- **Discord OAuth2 Only** - Login exclusively via Discord. No email/password, no guests.
- **Team Isolation** - Each Discord role maps to a team. All battleplans and rooms are scoped to the selected team.
- **Real-Time Collaboration** - Create rooms and draw together with Socket.IO. Live cursors, instant drawing sync.
- **Canvas Drawing System** - 3-layer canvas with pen, lines, rectangles, text, icons, arrows, and ellipses.
- **Operator Lineup + Bans + Loadouts** - Full R6 planning workflow directly in the editor.
- **Undo / Redo** - Ctrl+Z / Ctrl+Y with full history.
- **Export** - PNG, PDF, and `.nds` strat export/import.
- **Admin Panel** - Manage teams, users, games, maps, operators, gadgets, and settings.
- **Pre-Seeded Data** - Ships with R6 Siege maps, operators, gadgets, and uploaded assets.

---

## Deployment Modes

- **Development**: app runs on the host with `pnpm dev`, while `postgres` and `redis` run via Docker.
- **Production**: full Docker stack via `docker compose` with `postgres`, `redis`, `app`, and `web`.

---

## Requirements

### Development

- Node.js 24.x
- pnpm >= 10.30
- npm >= 11.12 if you use npm directly
- Docker + Docker Compose
- Git
- A Discord Application with OAuth2 configured

### Production

- Docker + Docker Compose
- Git
- A Discord Application with OAuth2 configured

---

## Windows Development

Use:

```bat
dev.bat
```

This starts only `postgres` and `redis` in Docker, then runs the app locally with Vite and Fastify.

Dev URLs:

- Client: `http://localhost:5173`
- API: `http://localhost:3001`

---

## Production Installation (Debian 13, Full Docker)

### 1. System Dependencies

```bash
apt update && apt upgrade -y
apt install -y curl git ca-certificates gnupg

curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

docker -v
docker compose version
```

> Proxmox LXC: enable `Nesting`, and for unprivileged containers also enable `keyctl`.

### 2. Clone & Configure

```bash
cd /opt
git clone https://github.com/NKr-NextDestiny/NextDestiny-BattlePlanner.git battleplanner
cd battleplanner

cp .env.example .env
nano .env
```

Minimal production `.env`:

```env
APP_URL=http://your-server-ip
NODE_ENV=production

JWT_SECRET=<random-string-1>
JWT_REFRESH_SECRET=<random-string-2>

DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_GUILD_ID=your-discord-server-id
DISCORD_REDIRECT_URI=http://your-server-ip/auth/discord/callback
DISCORD_ADMIN_ID=your-discord-user-id
```

Notes:

- `APP_URL` is the public browser URL, not the API port.
- Inside Docker, `DATABASE_URL` and `REDIS_URL` are injected by `docker-compose.yml`.
- For local dev, `APP_URL` stays `http://localhost:5173`.

### 3. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Copy `Client ID` and `Client Secret` into `.env`
4. Add Redirect URI: `http://your-server-ip/auth/discord/callback`
5. Get your Guild ID via Discord Developer Mode

### 4. First-Time Setup

Option A:

```bash
bash update.sh
```

Then choose:

```text
9
```

Option B:

```bash
docker compose up -d postgres redis
docker compose build app web migrate seed
docker compose run --rm migrate
docker compose run --rm seed
docker compose up -d app web
```

### 5. Open the App

Open:

```text
http://your-server-ip
```

The first user matching `DISCORD_ADMIN_ID` becomes admin automatically.

---

## Updating (Production)

Interactive:

```bash
bash update.sh
```

Recommended production mode:

- `6` for `main`
- `7` for `dev`

Manual alternative:

```bash
git pull origin main
docker compose up -d postgres redis
docker compose build app web migrate seed
docker compose run --rm migrate
docker compose up -d app web
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start local development app |
| `pnpm build` | Build all packages locally |
| `pnpm db:migrate` | Apply migrations locally |
| `pnpm db:seed` | Seed locally |
| `docker compose up -d postgres redis` | Start only DB services for dev |
| `docker compose build app web migrate seed` | Build Docker images |
| `docker compose run --rm migrate` | Run DB migrations in Docker |
| `docker compose run --rm seed` | Seed DB in Docker |
| `docker compose up -d app web` | Start production app containers |
| `docker compose ps` | Show container status |
| `docker compose logs -f app` | Follow backend logs |
| `docker compose logs -f web` | Follow frontend/nginx logs |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop containers and delete all data volumes |

---

## Reset Everything

```bash
docker compose down -v
docker compose up -d postgres redis
docker compose build app web migrate seed
docker compose run --rm migrate
docker compose run --rm seed
docker compose up -d app web
```

---

## Repo Size

The repository is large mainly because of committed R6 SVG map files and uploaded assets.

Main size driver:

- `packages/client/public/maps/svg/`

This is expected for the current project state and is much larger than the gadget PNGs or DB migration files.

---

## Troubleshooting

### `Unsupported engine` warnings

For local host development, install Node.js 24.x.

For production Docker deployment, the containers already use Node 24.

### OAuth redirect issues

Make sure:

- `APP_URL` matches the public URL you actually open in the browser
- `DISCORD_REDIRECT_URI` matches `{APP_URL}/auth/discord/callback`
- the same redirect URI is registered in the Discord Developer Portal

### Docker setup works, but browser cannot connect

Check:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f web
```

Make sure port `80` is reachable on the host.
