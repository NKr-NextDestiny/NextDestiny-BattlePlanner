# NextDestiny BattlePlanner

**Team-scoped collaborative tactical strategy planning for Rainbow Six Siege.**

Built for the NKr-NextDestiny Discord community. Authenticate via Discord, select your team, and plan strategies together in real-time. All content is isolated per team.

![Version](https://img.shields.io/badge/version-3.4.0-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Node](https://img.shields.io/badge/Node.js-24-green)

---

## Features

- **Discord OAuth2 Only** — Login exclusively via Discord. No email/password, no guests.
- **Team Isolation** — Each Discord role maps to a team. All battleplans and rooms are scoped to the selected team.
- **Real-Time Collaboration** — Create rooms and draw together with Socket.IO. Live cursors, instant drawing sync.
- **Canvas Drawing System** — 3-layer canvas with pen, lines, rectangles, text, operator/gadget icons.
- **Zoom + Pan** — Mouse wheel zoom (25%-400%), pan tool, middle-click pan.
- **Select, Drag, Resize & Rotate** — Click to select, drag to move, corner handles to resize, rotate handle.
- **Undo / Redo** — Ctrl+Z / Ctrl+Y with full history.
- **Operator Lineup** — 5 defender + 5 attacker slots with real-time sync.
- **Battle Plan Management** — Save, name, tag, and organize plans. Public sharing with voting.
- **Export** — PNG (current floor) or PDF (all floors as multi-page landscape).
- **Admin Panel** — Manage teams, users, games, maps, operators, gadgets, and settings.
- **Pre-Seeded Data** — Ships with full R6 Siege data: 21 maps, ~78 operators, ~87 gadgets, 165 floor images.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query |
| **Backend** | Fastify 5, Socket.IO 4.8 |
| **Database** | PostgreSQL 16 (Drizzle ORM) |
| **Cache** | Redis 7 |
| **Auth** | Discord OAuth2 + JWT |
| **Language** | TypeScript 5.7 |
| **Package Manager** | pnpm (monorepo) |

---

## Requirements

- **Node.js** 24.x
- **pnpm** >= 10.30
- **npm** >= 11.12 (only if you use npm directly; the project itself uses pnpm)
- **Docker** + **Docker Compose** (for PostgreSQL + Redis)
- **Git**
- A **Discord Application** with OAuth2 configured

Docker is only needed if you want this repo to provide PostgreSQL and Redis for you. If you already have external PostgreSQL/Redis instances, you can point `.env` at those and skip `docker compose`.

---

## Windows Development (dev.bat)

```
dev.bat
```

Starts Docker containers (PostgreSQL + Redis), installs dependencies, builds shared package, runs migrations + seed, and starts the dev server. Requires Docker Desktop to be running.

---

## Production Installation (Debian 13)

Complete guide for a fresh **Debian 13 (Trixie)** server. SSL is not covered here — add it separately with certbot/nginx if needed.

### 1. System Dependencies

```bash
apt update && apt upgrade -y
apt install -y curl git ca-certificates gnupg

# Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs

# pnpm via Corepack (preferred)
corepack enable
corepack prepare pnpm@10.30.0 --activate

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

Verify:

```bash
node -v    # v24.x
npm -v     # v11.12.x
pnpm -v    # 10.30.x
docker -v  # 27.x
```

> **Proxmox LXC**: Enable **Nesting** in container features (Options > Features > Nesting). For unprivileged containers, also enable **keyctl**.

### 2. Clone & Configure

```bash
cd /opt
git clone https://github.com/NKr-NextDestiny/NextDestiny-BattlePlanner.git battleplanner
cd battleplanner

cp .env.example .env
nano .env
```

Configure `.env`:

```env
# Database (matches docker-compose defaults)
DATABASE_URL=postgresql://battleplanner:battleplanner@localhost:5432/battleplanner

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=production

# Public URL (your domain or IP — NO trailing slash)
# Public browser URL (your domain or IP, no trailing slash)
# In development this is the Vite app URL (5173), not the API port (3001).
APP_URL=http://your-server-ip:5173

# JWT — generate with: openssl rand -base64 48
JWT_SECRET=<random-string-1>
JWT_REFRESH_SECRET=<random-string-2>

# Discord OAuth2 — create at https://discord.com/developers/applications
# Redirect URI: http://your-server-ip:5173/auth/discord/callback
DISCORD_CLIENT_ID=your-client-id
DISCORD_CLIENT_SECRET=your-client-secret
DISCORD_GUILD_ID=your-discord-server-id
DISCORD_REDIRECT_URI=http://your-server-ip:5173/auth/discord/callback

# Discord Admin — your Discord user ID (first admin user)
DISCORD_ADMIN_ID=your-discord-user-id

# Client
```

### 3. Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**, name it (e.g. "NextDestiny BattlePlanner")
3. Go to **OAuth2** > **General**
4. Copy **Client ID** and **Client Secret** into `.env`
5. Add **Redirect URI**: `http://your-server-ip:5173/auth/discord/callback` (or your domain)
6. Go to **Bot** section — no bot is needed, but the application must exist
7. Get your **Guild ID**: Enable Developer Mode in Discord (Settings > Advanced), right-click your server > Copy Server ID

### 4. Initial Setup

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Install dependencies
pnpm install

# Build shared package first
pnpm --filter @nd-battleplanner/shared build

# Apply committed migrations
pnpm db:migrate

# Seed database (admin user + R6 Siege data)
pnpm db:seed

# Build everything
pnpm build
```

If you want one interactive command after `.env` is configured, you can also run:

```bash
bash update.sh
```

and choose `9` (`setup`).

### 5. Runtime Model

Current repo status:

- `docker-compose.yml` only provides `postgres` and `redis`
- the app itself is still built and started on the host
- there is currently no `Dockerfile` and no fully containerized app stack in this repository

That means the old nginx/systemd style deployment is a host-based production setup, not an all-Docker deployment.

If you want a pure Docker deployment, that still needs to be implemented in the repo first.

### 6. systemd Service

Create system user:

```bash
useradd --system --no-create-home --shell /usr/sbin/nologin battleplanner
chown -R battleplanner:battleplanner /opt/battleplanner
```

Create `/etc/systemd/system/battleplanner.service`:

```ini
[Unit]
Description=NextDestiny BattlePlanner
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=battleplanner
WorkingDirectory=/opt/battleplanner
ExecStart=/usr/bin/node packages/server/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/opt/battleplanner/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
systemctl daemon-reload
systemctl enable battleplanner
systemctl start battleplanner
systemctl status battleplanner
```

View logs:

```bash
journalctl -u battleplanner -f
```

### 7. Firewall (ufw)

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw enable
ufw status
```

### 8. Open the App

Navigate to `http://your-server-ip` in your browser. Click **Login with Discord** to authenticate.

The first user with the `DISCORD_ADMIN_ID` from `.env` will automatically be an admin with access to the admin panel.

---

## Updating (Production)

Use the update script:

```bash
bash update.sh
```

Or create a global command:

```bash
chmod +x /opt/battleplanner/update.sh
ln -sf /opt/battleplanner/update.sh /usr/local/bin/battleplanner-update
battleplanner-update
```

Select the appropriate mode. Data is preserved during normal updates.

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (API:3001 + Client:5173) |
| `pnpm build` | Build all packages for production |
| `pnpm db:generate` | Generate Drizzle migration files |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed database with initial data |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `docker compose up -d` | Start PostgreSQL + Redis |
| `docker compose down` | Stop containers (data persists) |
| `docker compose down -v` | Stop + **delete all data** |

---

## Database Management

### Reset Everything

```bash
docker compose down -v
docker compose up -d
sleep 3
pnpm db:migrate
pnpm db:seed
```

### Browse Database

```bash
pnpm db:studio
```

Opens Drizzle Studio at `https://local.drizzle.studio`.

---

## Troubleshooting

### "ECONNREFUSED" in Vite console
The backend server is not running. Start it with `pnpm dev` or `node packages/server/dist/index.js`.

### `db:migrate` fails with "column already exists"
Clean old migration files and regenerate:
```bash
rm -rf packages/server/drizzle/*
pnpm db:generate
pnpm db:migrate
```

### Discord login fails
- Check `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID` in `.env`
- Verify the redirect URI in Discord Developer Portal matches `DISCORD_REDIRECT_URI` in `.env` exactly
- Make sure the user is a member of the Discord server (guild)

### No teams shown after login
Teams are mapped from Discord roles. An admin must create teams in the admin panel (Admin > Teams) and assign Discord role IDs.

---

## Credits

Based on [TactiHub](https://github.com/niklask52t/TactiHub) by Niklas Kronig, which was inspired by [r6-map-planner](https://github.com/prayansh/r6-map-planner) and [r6-maps](https://github.com/jayfoe/r6-maps).

---

## Disclaimer

This is a fan-made tool and is not affiliated with Ubisoft or any game publisher. All game names, logos, and assets are trademarks of their respective owners.

---
_Last reviewed: 2026-04-11_
