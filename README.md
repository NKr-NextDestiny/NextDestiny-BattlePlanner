# TactiHub

**Collaborative tactical strategy planning for Rainbow Six Siege.**

TactiHub is a real-time collaboration tool that lets teams draw tactics on game maps, create and share battle plans, and coordinate strategies together. Built for Rainbow Six Siege with full map and operator data, it features a powerful canvas drawing system, live cursors, and persistent battle plan management.

![Version](https://img.shields.io/badge/version-1.8.4-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Node](https://img.shields.io/badge/Node.js-20+-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## Table of Contents

- [Features](#features)
- [Color Palette](#color-palette)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation (Debian 13)](#installation-debian-13)
- [Useful Commands](#useful-commands)
- [Updating](#updating)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)
  - [Nginx Reverse Proxy](#5-nginx-reverse-proxy)
  - [SSL with Let's Encrypt](#6-ssl-with-lets-encrypt)
  - [systemd Service](#7-systemd-service)
  - [Firewall](#8-firewall-ufw)
  - [reCAPTCHA Setup](#9-recaptcha-setup-optional)
- [Map Images](#map-images)
- [Credits & Acknowledgments](#credits--acknowledgments)
- [Disclaimer](#disclaimer)

---

## Features

- **Rainbow Six Siege** — Ships with full R6 Siege data: 21 maps with Blueprint/Darkprint/Whiteprint floor images, ~78 operators, and ~87 gadgets. Additional games can be added through the admin panel.
- **Real-Time Collaboration** — Create rooms and draw together in real-time with Socket.IO. See teammates' cursors and drawings appear instantly.
- **Canvas Drawing System** — 3-layer canvas with tools for freehand pen, straight lines, rectangles, text (adjustable font size), and operator/gadget icons.
- **Zoom + Pan** — Mouse wheel zoom centered on cursor (25%-400%), pan tool, middle-click pan, and reset button.
- **Eraser** — Click on your own drawings to delete them. Others' draws appear dimmed and can't be erased.
- **Select, Drag, Resize & Rotate** — Click to select your own drawings, drag to reposition, use corner/edge handles to resize, or use the rotate handle to rotate. Auto-switches to select mode after drawing.
- **Undo / Redo** — Ctrl+Z / Ctrl+Y keyboard shortcuts and toolbar buttons.
- **In-Room Chat** — Ephemeral text messaging between room participants with unread badge. Messages are not persisted.
- **Battle Plan Management** — Save, name, and organize battle plans. Mark as public to share with the community, or keep private.
- **Battleplan Tags** — Tag plans with categories (Rush, Default, Retake, etc.) for organization and filtering.
- **Battleplan Description & Notes** — Add descriptions and notes to plans, inline-editable for owners.
- **Share by Link** — Public toggle + share button copies a direct link. Public plans are viewable without login.
- **Voting System** — Upvote/downvote public battle plans to surface the best strategies.
- **Operator Lineup** — Assign operators to 5 defender slots per plan (optional 5 attacker slots), synced in real-time. Sidebar auto-filters operators and gadgets to lineup members. "Show all" toggle reveals hidden items with warning.
- **Floor Switching** — Navigate multi-floor maps with keyboard shortcuts (J/K) or buttons.
- **View Mode Switcher** — Toggle between Blueprint, Darkprint, and Whiteprint floor views (when available). Default is always Blueprint.
- **Compass** — SVG north indicator overlay on every canvas.
- **Sandbox Mode** — Try drawing on any map without creating an account. Drawings are local only.
- **Guest Access** — Guests can view and draw in rooms without logging in. Guest drawings are local only and won't be saved or shared with other room members.
- **Export Drawings** — Export the current floor as PNG or all floors as a multi-page landscape PDF. Available to all users including guests.
- **Admin Panel** — Full CRUD management for games, maps, floors, operators, gadgets, users, and registration tokens.
- **Token-Based Registration** — Admin can toggle public registration on/off and create invite tokens for controlled access.
- **Email Verification** — New accounts must verify their email. Admins can also manually verify users from the admin panel.
- **reCAPTCHA v2** — Optional Google reCAPTCHA v2 checkbox on registration to prevent spam. Works without configuration (no CAPTCHA shown).
- **Account Self-Deletion** — Users can delete their own account with double confirmation + email verification. Account is deactivated for 30 days before permanent deletion, allowing admins to reactivate.
- **Magic Link Login** — Passwordless login via email link. Enter your email or username, receive a login link, click to log in instantly.
- **Floor Layout Management** — Upload and manage floor layout images (blueprint, darkprint, whiteprint) per map through the admin panel with reordering support.
- **Pre-Seeded Map Images** — 165 R6 map floor images (Blueprint/Darkprint/Whiteprint) + 23 gadget icons included in the repo as WebP. Works out of the box after seeding.
- **Dark Theme** — Built with a dark color scheme matching the TactiHub brand (see color palette below).
- **Help & FAQ** — Built-in help page with tool descriptions, keyboard shortcuts, and frequently asked questions.

---

## Color Palette

The color scheme is derived from the TactiHub logo gradient and uses the [OKLCH](https://oklch.com/) color space in CSS. All colors are defined in `packages/client/src/index.css` via Tailwind v4 `@theme` variables.

| Role | Hex | OKLCH | Usage |
|------|-----|-------|-------|
| **Primary** | `#fd7100` | `oklch(0.68 0.19 45)` | Buttons, links, accents, focus rings, glow effects |
| **Primary Foreground** | `#ffffff` | `oklch(0.98 0 0)` | Text on primary-colored backgrounds |
| **Destructive** | `#da2c00` | `oklch(0.55 0.22 25)` | Error states, delete actions, warnings |
| **Background** | `#2a2f38` | `oklch(0.185 0.01 250)` | Page background |
| **Foreground** | `#c3c9cc` | `oklch(0.88 0.005 250)` | Primary text color |
| **Card** | `#323842` | `oklch(0.22 0.012 250)` | Card / dialog backgrounds |
| **Secondary / Muted** | `#3c4653` | `oklch(0.28 0.015 250)` | Secondary backgrounds, inactive badges |
| **Muted Foreground** | — | `oklch(0.65 0.01 250)` | Secondary text, labels, placeholders |
| **Border / Input** | — | `oklch(0.32 0.015 250)` | Borders, input field outlines |
| **Chart 1** | — | `oklch(0.68 0.19 45)` | Orange (matches primary) |
| **Chart 2** | — | `oklch(0.55 0.22 25)` | Red-orange (matches destructive) |
| **Chart 3** | — | `oklch(0.65 0.15 60)` | Amber |
| **Chart 4** | — | `oklch(0.65 0.15 160)` | Teal |
| **Chart 5** | — | `oklch(0.65 0.15 310)` | Purple |

> **Logo colors**: The logo uses a gradient from `#fd7100` (orange) to `#da2c00` (red-orange), with gray tones from `#c3c9cc` to `#3c4653`.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + Vite | 19.0 / 6.x |
| **UI** | Tailwind CSS v4 + shadcn/ui | 4.0 |
| **State** | Zustand + TanStack Query | 5.x |
| **Routing** | React Router | 7.x |
| **Forms** | react-hook-form + zod | 7.x / 3.x |
| **Backend** | Fastify | 5.x |
| **ORM** | Drizzle ORM + drizzle-kit | 0.45+ |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis (ioredis) | 7 |
| **Realtime** | Socket.IO | 4.8 |
| **Auth** | JWT (access + refresh tokens) | — |
| **Email** | Nodemailer | 6.x |
| **Images** | Sharp | 0.33 |
| **Language** | TypeScript | 5.7 |
| **Package Manager** | pnpm (workspaces) | 10.x |
| **Containerization** | Docker Compose | — |

---

## Project Structure

```
TactiHub/
├── docker-compose.yml          # PostgreSQL 16 + Redis 7
├── package.json                # Root workspace config (v1.8.0)
├── pnpm-workspace.yaml         # Workspace definition
├── tsconfig.base.json          # Shared TypeScript config
├── .env.example                # Environment template
├── CLAUDE.md                   # AI assistant project guide
│
├── packages/
│   ├── shared/                 # @tactihub/shared — Types, constants, enums
│   │   └── src/
│   │       ├── types/          # Auth, Game, Battleplan, Room, Admin, API, Canvas
│   │       └── constants/      # Colors, defaults, limits, APP_VERSION
│   │
│   ├── server/                 # @tactihub/server — Fastify API + Socket.IO
│   │   ├── drizzle.config.ts
│   │   ├── uploads/            # Image assets (maps/ + gadgets/ tracked, games/ + operators/ gitignored)
│   │   └── src/
│   │       ├── db/
│   │       │   ├── schema/     # 11 Drizzle schema files (15 tables)
│   │       │   ├── connection.ts
│   │       │   └── seed.ts     # R6 Siege seed data
│   │       ├── plugins/        # Fastify plugins (Redis, Auth)
│   │       ├── middleware/      # Auth middleware (requireAuth, optionalAuth, requireAdmin)
│   │       ├── routes/         # REST API routes
│   │       │   ├── admin/      # Admin CRUD endpoints (9 files)
│   │       │   ├── auth.ts     # Registration, login, JWT refresh, email verify
│   │       │   ├── games.ts    # Public game data
│   │       │   ├── battleplans.ts
│   │       │   ├── draws.ts
│   │       │   ├── rooms.ts
│   │       │   └── operator-slots.ts
│   │       ├── services/       # Business logic (auth, email, upload, cleanup)
│   │       ├── socket/         # Socket.IO handlers (room, drawing, cursor)
│   │       └── index.ts        # Server entry point
│   │
│   └── client/                 # @tactihub/client — React SPA
│       ├── public/             # Static assets (logos)
│       ├── vite.config.ts
│       └── src/
│           ├── components/
│           │   ├── ui/         # shadcn/ui components (15+)
│           │   ├── layout/     # AppLayout, AdminLayout, AuthLayout
│           │   └── auth/       # ProtectedRoute
│           ├── features/
│           │   ├── admin/      # Admin panel pages (8 pages)
│           │   ├── auth/       # Login, Register, Forgot/Reset Password, Verify Email
│           │   ├── battleplan/ # My Plans, Public Plans, Viewer (with sharing)
│           │   ├── canvas/     # CanvasView, CanvasLayer, Toolbar, Compass, hitTest
│           │   ├── game/       # Game Dashboard
│           │   ├── home/       # Landing page
│           │   ├── legal/      # Impressum, Help, FAQ
│           │   ├── room/       # Create Room (game/map flow), Room (live collaboration)
│           │   └── sandbox/    # Sandbox (local drawing without login)
│           ├── stores/         # Zustand stores (auth, canvas with viewport+history, room)
│           ├── lib/            # API client, Socket.IO client, utilities
│           └── main.tsx        # App entry point
```

---

## Requirements

- **OS**: Debian 13 (Trixie) recommended — also works on Ubuntu 22.04+, Debian 12, or any Linux with Docker support
- **Node.js** >= 20.0 (LTS recommended)
- **pnpm** >= 9.0 (`npm install -g pnpm`)
- **Docker** + **Docker Compose** (for PostgreSQL and Redis)
- **Git**

**Strongly recommended:**
- **SMTP server or email service** (e.g., Gmail App Password, Brevo, Mailgun, own SMTP server) — **Users must verify their email after registration before they can log in.** Without a working SMTP setup, the admin has to manually verify every single user in the admin panel (Users > Verify).

> **Proxmox LXC**: If you're running this inside a Proxmox LXC container, make sure **Nesting** is enabled in the container features (Options > Features > Nesting). For unprivileged containers, also enable **keyctl**. A privileged Debian 13 LXC with Nesting works out of the box.

---

## Installation (Debian 13)

The following steps assume a fresh **Debian 13 (Trixie)** installation or LXC container. Adjust package manager commands if you're using a different distribution.

### 1. Install system dependencies

```bash
# Update packages
apt update && apt upgrade -y

# Install essentials
apt install -y curl git ca-certificates gnupg

# Install Node.js 22 LTS (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

Verify everything is installed:

```bash
node -v    # v22.x
pnpm -v    # 10.x
docker -v  # 27.x
```

### 2. Clone the repository

```bash
git clone https://github.com/niklask52t/TactiHub.git
cd TactiHub
```

The default branch is `main`. For the latest development features, use `git checkout dev`.

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure at minimum:
- `APP_URL` — Your public frontend URL (e.g. `https://tactihub.de`). Used for links in emails and the logo. **Must point to the frontend, not the API server.**
- `JWT_SECRET` — A long random string for access tokens (`openssl rand -base64 48`)
- `JWT_REFRESH_SECRET` — A different long random string for refresh tokens (`openssl rand -base64 48`)
- `SMTP_*` — Your email server credentials (**strongly recommended** — without it, users can't verify their email and the admin must manually verify each user)

The default database and Redis URLs work with the included Docker Compose setup.

### 4. Set up and start

**Option A — Script (recommended):**

The `update.sh` script handles everything automatically: starts Docker containers, installs dependencies, builds packages, generates and applies database migrations, and seeds the database.

```bash
bash update.sh
```

Select mode **1 (dev)**. The script will ask for double confirmation since it resets the database, then:
1. Starts PostgreSQL + Redis containers
2. Installs all dependencies (`pnpm install`)
3. Builds the shared package
4. Cleans old migration files and generates fresh ones
5. Applies migrations and seeds the database
6. Builds all packages
7. Asks if you want to start the dev server

> **Tip:** Set up the global command so you can run `tactihub-update` from anywhere:
> ```bash
> sudo ln -sf $(pwd)/update.sh /usr/local/bin/tactihub-update
> ```

**Option B — Manual:**

```bash
# Start PostgreSQL 16 + Redis 7
docker compose up -d

# Install dependencies
pnpm install

# Build shared package (must be built before server/client)
pnpm --filter @tactihub/shared build

# Generate migration files from schema
pnpm db:generate

# Apply migrations to create tables
pnpm db:migrate

# Seed with initial data (admin user + R6 Siege)
pnpm db:seed

# Start dev server
pnpm dev
```

Docker Compose starts:
- **PostgreSQL 16** on port `5432` (user: `tactihub`, password: `tactihub`, db: `tactihub`)
- **Redis 7** on port `6379`

The seed creates:
- **Admin account**: `admin` / `admin@tactihub.local` / `changeme`
- **Rainbow Six Siege**: 21 maps (correct per-map floor counts with Blueprint/Darkprint/Whiteprint image paths), ~78 operators, ~87 gadgets (23 with pre-seeded icons)

All R6 map floor images (165 WebP files) and gadget icons (23 WebP files) are included in the repository under `packages/server/uploads/`. They're available immediately after seeding — no extra import step needed.

### 5. Dev server

`pnpm dev` starts both the server (port 3001) and client (port 5173). The client listens on `0.0.0.0`, so it's accessible from other machines on your network.

The Vite dev server proxies API requests (`/api/*`) and Socket.IO to the Fastify server on port 3001 automatically.

### 6. Open the app

Navigate to `http://localhost:5173` (or `http://<server-ip>:5173` for remote access) in your browser.

Log in with the default admin credentials to access the admin panel and manage games, maps, operators, etc. The login accepts both username and email.

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Email** | `admin@tactihub.local` |
| **Password** | `changeme` |

> **Important:** Change the admin password after your first login.

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both server and client in dev mode |
| `pnpm build` | Build all packages for production |
| `pnpm db:generate` | Generate Drizzle migration files from schema changes |
| `pnpm db:migrate` | Apply pending database migrations |
| `pnpm db:seed` | Seed the database with initial data |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `docker compose up -d` | Start PostgreSQL + Redis containers |
| `docker compose down` | Stop containers (data persists in volumes) |
| `docker compose down -v` | Stop containers and **delete all data** (DB + Redis) |
| `bash update.sh` | Interactive update: 8 modes (update, reset, dev reset, pull main/dev, prod main/dev/reset) |
| `tactihub-update` | Same as above, available system-wide after symlinking (see below) |

### Global `tactihub-update` command

To run the update script from anywhere on the system:

```bash
sudo ln -sf /opt/tactihub/update.sh /usr/local/bin/tactihub-update
```

Replace `/opt/tactihub` with your actual install path. After this, simply run `tactihub-update` from any directory.

---

## Updating

### Option A — Script (recommended)

```bash
tactihub-update
```

Or if not symlinked yet: `bash update.sh`. Select mode **2 (prod)** to pull, install dependencies, run migrations, and rebuild — all in one step. Your data is preserved.

### Option B — Manual

```bash
git pull origin main
pnpm install
pnpm --filter @tactihub/shared build
pnpm db:generate
pnpm db:migrate
pnpm build
```

After either option, restart the server:

```bash
sudo systemctl restart tactihub
```

---

## Database Management

### Reset the database

If you need to start fresh (this **deletes all data** — users, battleplans, everything):

**Option A — Automated (recommended):**

```bash
bash update.sh
```

Select mode **1 (dev)** for a full reset. The script requires double confirmation before deleting data, then pulls the latest dev branch, nukes the database volumes, reinstalls dependencies, and re-runs generate/migrate/seed in one go.

**Option B — Manual:**

```bash
# Stop containers and delete volumes
docker compose down -v

# Restart containers
docker compose up -d

# Wait for PostgreSQL to be ready
sleep 3

# Clean old migration files to avoid conflicts
rm -rf packages/server/drizzle/*

# Re-run migrations and seed
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

> **Why `rm -rf packages/server/drizzle/*`?** Old migration files can conflict with each other when regenerating from scratch (e.g., one migration creates a column, another tries to add it again). Cleaning them ensures a single, clean migration from the current schema.

### Browse the database

```bash
pnpm db:studio
```

This opens Drizzle Studio at `https://local.drizzle.studio` where you can browse and edit tables visually.

---

## Troubleshooting

### "ECONNREFUSED" errors in Vite console / No data loads

The backend server is not running. The Vite client proxies all API requests to `localhost:3001`. Start the server first:

```bash
pnpm --filter @tactihub/server dev
```

### `docker compose down -v` — What gets deleted?

| Volume | Contents | Lost? |
|--------|----------|-------|
| `pgdata` | PostgreSQL database (users, games, maps, battleplans, everything) | **Yes** |
| `redisdata` | Redis data (sessions, refresh tokens) | **Yes** |
| Code / `.env` / uploads on disk | Source code, config, uploaded images | No |

After `down -v`, re-run: `docker compose up -d && pnpm db:generate && pnpm db:migrate && pnpm db:seed`

### `db:migrate` fails with "column already exists"

This happens when old migration files in `packages/server/drizzle/` conflict with each other after a database reset. Clean them and regenerate:

```bash
rm -rf packages/server/drizzle/*
pnpm db:generate
pnpm db:migrate
```

### `db:generate` fails with "Cannot find module './users.js'"

The drizzle-kit scripts must run through `tsx`. Check that `packages/server/package.json` has:
```json
"db:generate": "tsx ./node_modules/drizzle-kit/bin.cjs generate"
```

### `db:migrate` fails with `url: undefined`

The `.env` file is in the project root, but scripts run from `packages/server/`. Make sure `drizzle.config.ts` and `connection.ts` use:
```typescript
import { config } from 'dotenv';
config({ path: '../../.env' });
```

### Login doesn't work

- The login field accepts both **username** (`admin`) and **email** (`admin@tactihub.local`)
- Default password is `changeme`
- On first login with default credentials, you'll be forced to set a new email and password
- The seed user has email already verified. If you registered a new user, you must verify the email first (check SMTP config)

### Email links go to wrong URL / "Route not found" error

Email links (verify, reset password) use the `APP_URL` environment variable. This must point to the **frontend** (your public domain or `http://localhost:5173` for dev), NOT the API server (port 3001):

```bash
# Correct — points to frontend
APP_URL=https://tactihub.de

# Wrong — points to API server, will show "Route not found"
APP_URL=http://localhost:3001
```

### Verification emails not arriving

Check your SMTP configuration in `.env`:

```bash
SMTP_HOST=smtp.example.com     # Your SMTP server hostname
SMTP_PORT=587                   # 587 for STARTTLS, 465 for SSL
SMTP_SECURE=false               # Set to "true" for port 465 (SSL)
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com
```

Common issues:
- **Port 465** requires `SMTP_SECURE=true` (SSL)
- **Port 587** uses STARTTLS — leave `SMTP_SECURE=false` (default)
- **Gmail**: Use an [App Password](https://support.google.com/accounts/answer/185833), not your regular password. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`
- **SMTP_FROM**: Some providers require this to match your authenticated email
- Check server logs (`pnpm --filter @tactihub/server dev`) for SMTP error messages

Test your SMTP connection:
```bash
# From the server, try sending a test email with curl
curl --url "smtp://SMTP_HOST:SMTP_PORT" --ssl-reqd \
  --mail-from "SMTP_FROM" --mail-rcpt "your@email.com" \
  --user "SMTP_USER:SMTP_PASS" \
  -T /dev/null
```

---

## Production Deployment

This guide assumes a fresh **Debian/Ubuntu** server with at least **2 GB RAM**.

### 1. System Requirements

```bash
# Node.js 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs

# pnpm
corepack enable
corepack prepare pnpm@latest --activate

# PostgreSQL + Redis (Docker recommended)
sudo apt-get install -y docker.io docker-compose-plugin
```

If you already installed PostgreSQL and Redis during the [Installation (Debian 13)](#installation-debian-13) section, you can skip the Docker step and use those directly.

### 2. Build the Project

```bash
cd /opt/tactihub          # or wherever you cloned the repo
cp .env.example .env      # then edit .env (see step 3)
pnpm install
pnpm build
```

### 3. Production Environment Variables

Edit `.env` with production values:

```env
# Database + Redis (adjust if not using Docker defaults)
DATABASE_URL=postgresql://tactihub:STRONG_PASSWORD@localhost:5432/tactihub
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=production

# Public URL — MUST match your domain (used in emails and links)
APP_URL=https://yourdomain.com

# JWT secrets — generate with: openssl rand -base64 48
JWT_SECRET=<random-string-1>
JWT_REFRESH_SECRET=<random-string-2>

# SMTP (required for email verification + password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourdomain.com

# Uploads
MAX_FILE_SIZE=5242880

# reCAPTCHA v2 (optional — see "reCAPTCHA Setup" below)
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Client API URL — must match your public domain
VITE_API_URL=https://yourdomain.com
VITE_SOCKET_URL=https://yourdomain.com
```

> **Important:** `VITE_*` variables are baked into the client at build time. After changing them, you must re-run `pnpm build`.

### 4. Database Setup

```bash
# Start PostgreSQL + Redis (Docker)
docker compose up -d

# Run migrations and seed data
pnpm db:migrate
pnpm db:seed
```

### 5. Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/tactihub`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS (after certbot setup)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (managed by certbot — see step 6)
    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;

    # Client SPA (static files)
    root /opt/tactihub/packages/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploaded files (maps, avatars, etc.)
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }

    # Socket.IO — requires WebSocket upgrade headers
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase body size for file uploads
    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/tactihub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 6. SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot will automatically configure SSL in your Nginx config and set up auto-renewal.

> **Note:** For the initial setup, temporarily comment out the `listen 443` server block and the `return 301` redirect, so Nginx serves on port 80 for certbot's HTTP challenge. After certbot completes, restore the full config.

### 7. systemd Service

Create a dedicated system user (no login shell, no home directory):

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin tactihub
sudo chown -R tactihub:tactihub /opt/tactihub
```

Create `/etc/systemd/system/tactihub.service`:

```ini
[Unit]
Description=TactiHub Server
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=tactihub
WorkingDirectory=/opt/tactihub
ExecStart=/usr/bin/node packages/server/dist/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/opt/tactihub/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tactihub
sudo systemctl start tactihub
sudo systemctl status tactihub    # check it's running
```

View logs:

```bash
sudo journalctl -u tactihub -f
```

### 8. Firewall (ufw)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### 9. reCAPTCHA Setup (Optional)

TactiHub supports Google reCAPTCHA v2 on the registration form. If not configured, registration works without CAPTCHA.

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **+** to create a new site
3. Choose **Challenge (v2)** (German: "Aufgabe (v2)")
4. Choose **"I'm not a robot" Checkbox** (German: "Kästchen: Ich bin kein Roboter")
5. Add your domain(s) (e.g. `yourdomain.com`)
6. Copy the **Site Key** and **Secret Key**
7. Add to your `.env`:
   ```env
   RECAPTCHA_SITE_KEY=6Lc...your-site-key...
   RECAPTCHA_SECRET_KEY=6Lc...your-secret-key...
   ```
8. Rebuild the client (the site key is fetched from the server at runtime, no rebuild needed for key changes):
   ```bash
   pnpm build
   ```

The reCAPTCHA widget will automatically appear on the registration form when the keys are configured. No code changes needed.

### 10. Post-Deployment Checklist

- [ ] `APP_URL` matches your actual domain (with `https://`)
- [ ] `VITE_API_URL` and `VITE_SOCKET_URL` match your domain
- [ ] JWT secrets are random and unique (not the defaults!)
- [ ] SMTP credentials are configured and working
- [ ] Database is migrated and seeded (`pnpm db:migrate && pnpm db:seed`)
- [ ] Nginx config passes `sudo nginx -t`
- [ ] SSL certificate is active (`https://` works in browser)
- [ ] Socket.IO connects (check browser DevTools → Network → WS)
- [ ] File uploads work (test in admin panel → Maps → Floors)
- [ ] First user registered and promoted to admin (via DB or by being the first user)

---

## Map Images

All R6 Siege map floor images (Blueprint, Darkprint, Whiteprint variants) and gadget icons are **pre-seeded in the repository** under `packages/server/uploads/maps/` and `packages/server/uploads/gadgets/`. After running `pnpm db:seed`, the database references these files and they work out of the box.

Additional images can be uploaded through the admin panel under Games > Maps > Floors. Admin-uploaded images override the seed paths in the database. Supported formats: PNG, JPG, WebP — all are automatically converted to WebP via Sharp.

To re-process images from an external source folder (e.g. after obtaining new map data):

```bash
pnpm --filter @tactihub/server tsx src/scripts/process-images.ts "/path/to/source/folder"
```

---

## Credits & Acknowledgments

TactiHub is developed by **Niklas Kronig**.

This project is based on and inspired by two original open-source projects:

### [r6-map-planner](https://github.com/prayansh/r6-map-planner) by prayansh
A real-time collaborative map planning tool built with Node.js, Express and Socket.IO. It provided the foundation for the real-time collaboration features, live cursor tracking, color assignment, and the canvas drawing system.

### [r6-maps](https://github.com/jayfoe/r6-maps) by jayfoe
A battle plan management system built with Laravel and Vue.js. It provided the blueprint for user authentication, database persistence, battle plan CRUD, the voting system, operator management, and the admin panel architecture.

Both projects have been inactive for several years. TactiHub merges their best concepts into a modern TypeScript application with a completely rewritten codebase, updated tech stack, and additional features.

---

## Disclaimer

TactiHub is a fan-made tool and is not affiliated with, endorsed by, or connected to Ubisoft or any other game publisher. All game names, logos, and related assets are trademarks of their respective owners. Map images and operator icons are property of their respective game publishers and are used for informational and educational purposes only.
