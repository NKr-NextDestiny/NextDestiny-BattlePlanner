# CLAUDE.md — NextDestiny BattlePlanner Project Guide

This file provides context for AI assistants working on the NextDestiny BattlePlanner codebase.

---

## What is NextDestiny BattlePlanner?

NextDestiny BattlePlanner is a team-scoped, real-time collaborative strategy planning tool for Rainbow Six Siege, built for the NKr-NextDestiny Discord community. Users authenticate via Discord OAuth2, select their team, and collaborate on battle plans within team-isolated spaces. Based on TactiHub.

**Author**: Niklas Kronig
**Version**: 1.0.0
**Repo**: https://github.com/NKr-NextDestiny/NextDestiny-BattlePlanner
**Based on**: [TactiHub](https://github.com/niklask52t/TactiHub)

---

## Repository Structure

This is a **pnpm monorepo** with 3 packages:

```
packages/
  shared/   → @nd-battleplanner/shared  — TypeScript types, enums, constants (incl. APP_VERSION)
  server/   → @nd-battleplanner/server  — Fastify 5 API + Socket.IO 4.8
  client/   → @nd-battleplanner/client  — React 19 + Vite 6 SPA
```

### Package Dependencies
- `shared` has no internal dependencies (standalone types)
- `server` depends on `shared` (workspace:*)
- `client` depends on `shared` (workspace:*)
- Always build `shared` first: `pnpm --filter @nd-battleplanner/shared build`

---

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.7 (strict mode)
- **Package Manager**: pnpm with workspaces
- **Frontend**: React 19, Vite 6, Tailwind CSS v4 (CSS-based config, NOT tailwind.config.js), shadcn/ui, Zustand, TanStack Query, React Router 7, react-hook-form + zod
- **Backend**: Fastify 5 with plugins (@fastify/cors, @fastify/cookie, @fastify/multipart, @fastify/rate-limit, @fastify/static)
- **Database**: PostgreSQL 16 via Drizzle ORM (drizzle-kit for migrations)
- **Cache**: Redis 7 via ioredis (infrastructure only — no auth tokens stored in Redis)
- **Realtime**: Socket.IO 4.8 (JWT auth at handshake, no guest connections)
- **Auth**: Discord OAuth2 only (scopes: identify, guilds.members.read). JWT access tokens (15min) + refresh tokens (7d, httpOnly cookie, stored in DB)
- **Teams**: Discord role ID → team mapping. Content (battleplans, rooms) scoped per team via X-Team-Id header
- **Images**: Sharp (resize + WebP conversion)
- **Infrastructure**: Docker Compose (postgres:16-alpine + redis:7-alpine)

---

## Key Architecture Decisions

### Database Schema
- `draws` table uses a JSONB `data` column instead of polymorphic tables — flexible, no joins needed
- `draw_type` enum: path, line, rectangle, text, icon
- `settings` table is key-value for app-wide config (registration_enabled, etc.)
- `operator_gadgets` is a many-to-many junction table (composite PK)
- `votes` has unique constraint on (user_id, battleplan_id)
- `slot_side` enum: defender, attacker — `operator_slots.side` column with default 'defender'

### Floor Image Variants (Blueprint / Darkprint / Whiteprint)
- Each floor can have up to 3 image variants: `imagePath` (blueprint, required), `darkImagePath`, `whiteImagePath` (optional)
- View mode switcher appears in top-left of canvas when >1 variant is available
- Default is always Blueprint; switching swaps the background image 1:1 (same dimensions)
- Admin can upload variants via Floor Layout management (`/admin/maps/:mapId/floors`)
- Pre-seeded images are committed to repo under `packages/server/uploads/maps/` (165 WebP) and `packages/server/uploads/gadgets/` (23 WebP)
- Re-process from source folder: `pnpm --filter @nd-battleplanner/server tsx src/scripts/process-images.ts <source-folder>`
- **Teams**: `teams` table maps Discord role IDs to team names. `team_members` table for individual Discord user ID assignments. Battleplans and rooms have `teamId` FK.
- **No email/password auth**: Users table has discordId (unique), discordUsername, discordAvatar, discordRoles (jsonb). No email, password, or verification columns.

### Canvas System (modular architecture, v2.0.0 rewrite)
- Old monolithic CanvasLayer.tsx (1,197 lines) replaced with modular architecture in `features/canvas/`
- Subdirs: `rendering/`, `layers/`, `tools/`, `hooks/`, `utils/`
- Main component: `MapCanvas.tsx` (default export) — composed of `BackgroundLayer`, `DrawLayer`, `ActiveLayer`
- Tool hooks pattern: `useDrawTool`, `useSelectTool`, `usePanTool`, `useIconTool`, etc., composed by `useToolRouter`
- Types in `features/canvas/types.ts`: `LaserLineData`, `Floor`, `CursorData`, `MapFloor`
- 3 layer components per floor:
  1. **BackgroundLayer** — Map floor image or SVG Real View (variant based on view mode selector)
  2. **DrawLayer** — All persisted/committed draws
  3. **ActiveLayer** — Current drawing action + peer cursors

### Editor Layout (v2.0.0)
- `EditorShell.tsx` — CSS grid: `gridTemplateRows: 'auto auto 1fr'`, `gridTemplateColumns: '220px 1fr 220px'`
- Row 1: `TopNavBar` (full width) — map name, floor tabs, view mode, phases, layer toggle, tools, zoom
- Row 2: `OperatorStrip` (full width) — 5 ATK + 5 DEF operator slots with popover picker
- Row 3: `SidePanel` (ATK, 220px) | Canvas (1fr) | `SidePanel` (DEF, 220px)
- SidePanel contains: visibility row, color pickers, landscape section, `SidePanelToolGrid` (5-col tool + gadget matrix), operator avatars
- SidePanelToolGrid: 5 columns (one per operator) × tool rows (Pen, Line, Rectangle, Text, Eraser, Select) + gadget rows per operator (unique → secondary → general)
- Clicking a gadget cell sets: `activeOperatorSlotId`, `tool=Icon`, `color=slot.color`, `selectedIcon={gadget}`

### Viewport (Zoom + Pan)
- CSS `transform: translate(${offsetX}px, ${offsetY}px) scale(${scale})` on the canvas container
- `transformOrigin: '0 0'` — zoom/pan works via CSS, not canvas redraw
- Coordinate conversion: `x = (clientX - containerLeft - offsetX) / scale`
- Zoom centered on cursor via `zoomTo(newScale, pivotX, pivotY)` in Zustand store
- Zoom limits: `ZOOM_MIN = 0.25`, `ZOOM_MAX = 4`, `ZOOM_STEP = 0.1`

### Draw Persistence (Socket vs REST)
- **Socket.IO** handlers are **broadcast-only** — they relay events to other room participants
- **REST API** handles database persistence (POST to create draws, POST to soft-delete)
- This avoids the dual-write bug where draws were inserted both via socket and REST

### Optimistic Draw Tracking (v1.8.1)
- Authenticated draws are immediately added to `localDraws` state with `optimistic-*` ID prefix
- After API responds with server IDs, the temp IDs are replaced in `localDraws`
- After `refetchPlan()` returns, a deduplication `useEffect` removes confirmed draws from `localDraws` (by matching server IDs in `planData.floors[].draws`)
- Guest draws use `local-*` ID prefix and are never sent to server
- This ensures eraser, select/move, and floor-switch all work immediately without waiting for API round-trip
- Both `handleDrawCreate` and `handleRedo` follow this pattern for authenticated users

### Undo/Redo
- `myDrawHistory` and `undoStack` in canvas Zustand store
- `DrawHistoryEntry` has `action` discriminator ('create' | 'update') and optional `previousState`
- `pushMyDraw(entry)` after REST create returns IDs (guarded by `isRedoingRef` to prevent double-push) — action defaults to 'create'
- `pushMyUpdate(entry)` for move/resize/rotate operations — stores `previousState` for undo reversal
- `popUndo()` → if action is 'update': restore `previousState` via POST; if 'create': delete via REST + socket broadcast
- `popRedo()` → if action is 'update': re-apply via POST; if 'create': recreate via REST + socket broadcast + `updateDrawId(oldId, newId)`
- `updateDrawId(oldId, newId)` updates both `myDrawHistory` and `undoStack` when redo creates a new draw with a different ID
- Keyboard: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo)

### Auth Flow
1. User clicks "Login with Discord" → redirected to Discord OAuth2 (scopes: identify, guilds.members.read)
2. Discord callback → server exchanges code for Discord access token → fetches user + guild member info
3. Server upserts user by discordId (creates on first login, updates username/avatar/roles on subsequent logins)
4. Server resolves teams from Discord roles + individual team member assignments
5. JWT access token (15min) + refresh token (7d httpOnly cookie) issued
6. Client navigates to /teams → user selects team (auto-selects if only one)
7. All subsequent API requests include `X-Team-Id` header for team scoping
8. Token refresh → POST /api/auth/refresh returns new access token + teams
9. No guests — Socket.IO rejects connections without valid JWT
10. Admin access: DB role='admin' OR Discord role IDs from settings OR Discord user IDs from settings

### Laser Pointer (non-persistent, multiplayer)
- **Laser Dot**: Tool.LaserDot — sends cursor position via `cursor:move` with `isLaser: true`, rendered as glowing dot on peers' active canvas
- **Laser Line**: Tool.LaserLine — collects points on drag, sends via `laser:line` socket event, fades over 3 seconds after release
- Both are **not persisted** to database — purely ephemeral broadcast

### Icon Tool (Gadget placement via Side Panels)
- Gadget placement is integrated into the SidePanel tool grid — no separate IconSidebar
- SidePanel fetches operators (with gadgets) from `/api/games/:slug/operators` and general gadgets from `/api/games/:slug/gadgets`
- Each operator column shows their unique + secondary gadgets; general gadgets (Drone, Barricade, etc.) shown for all slots
- All gadgets shown regardless of icon availability — text fallback (3-letter abbreviation) for gadgets without icons
- Clicking a gadget cell sets: `activeOperatorSlotId`, `tool=Icon`, `color=slot.color`, `selectedIcon={gadget}`
- `useIconTool` hook reads `selectedIcon` from canvas store — click places `type: 'icon'` draw with `{ iconUrl, size: 40 }`
- Gadget rows are unified across columns — same gadget occupies same row, unavailable cells are dimmed
- Category headers (Unique, Secondary, General) separate gadget groups

### Operator Lineup System
- OperatorStrip (full width, row 2 of EditorShell) shows 5 ATK + 5 DEF slots with blue/red borders
- Click a slot → `OperatorPickerPopover` with searchable 6-column operator grid (banned/assigned operators dimmed)
- `operator_slots` table has `side` column (`slot_side` pgEnum: 'defender' | 'attacker') with default 'defender'
- Optional attacker lineup: POST `/:id/attacker-lineup` creates 5 attacker slots, POST `/:id/attacker-lineup/delete` removes them
- Real-time sync: `operator-slot:update/updated` (includes `side`), `attacker-lineup:create/created` socket events
- BattleplanViewer: read-only lineup display with operator avatar circles (blue border for DEF, orange for ATK)

### Export (PNG + PDF)
- Export utilities in `packages/client/src/features/canvas/utils/exportCanvas.ts`
- **PNG**: `exportFloorAsPng()` — composites current floor background + all draws onto offscreen canvas, triggers download
- **PDF**: `exportAllFloorsAsPdf()` — iterates all floors, composites each onto offscreen canvas, builds multi-page landscape PDF with floor name headers via jsPDF
- Export buttons in CanvasView bottom-right area (Camera icon = PNG, FileDown icon = PDF)
- Available to all users (authenticated and guests), uses `renderDraw()` exported from CanvasLayer
- Client dependency: `jspdf`

### Select, Resize & Rotate Tool
- Tool.Select in toolbar allows selecting, dragging, resizing, and rotating own draws
- Click: hitTest to find draw under cursor (own draws only), highlight with orange dashed bounding box
- **Move**: Drag the selected draw to reposition — offsets all coordinates (originX/Y, destinationX/Y, path points)
- **Resize**: 8 handles (nw/n/ne/e/se/s/sw/w) — drag to scale the draw proportionally. Uses `applyResizeToDraw()` to transform coordinates per draw type
- **Rotate**: Circle handle above bounding box — drag to rotate. Stores `rotation` (radians) in draw data. Rendered via `ctx.translate → ctx.rotate → ctx.translate` around bounding box center
- Release: persists via POST /api/draws/:id + socket broadcast
- `getDrawBounds()` helper in CanvasLayer computes axis-aligned bounding box for all draw types
- `selectedDrawId`, `interactionMode` ('none'|'move'|'resize'|'rotate'), `activeResizeHandle` in Zustand canvas store
- **Auto-switch**: After completing a Line or Rectangle drawing, tool automatically switches to Select and auto-selects the new draw. Pen and Text tools stay active. Icon tool stays active for multi-placement.

### Ownership-Based Draw Interaction
- Eraser and Select tools only interact with draws where `draw.userId === currentUserId`
- Others' draws are rendered with reduced opacity (0.6 alpha) as visual distinction
- Server enforces ownership on POST /api/draws/:id and POST /api/draws/:id/delete (403 if not owner)
- `currentUserId` prop passed from RoomPage → CanvasView → CanvasLayer

### Text Font Size Control
- Font size selector (shadcn Select) appears in toolbar when Text tool is active
- Options: 12, 16, 20, 24, 32, 48, 64 px
- Uses existing `fontSize`/`setFontSize` from canvas store

### Battleplan Notes/Description UI
- Create dialog (MyPlansPage) includes optional description textarea
- BattleplanViewer shows editable description + notes sections for plan owner
- Pencil icon to enter edit mode, Save/Cancel buttons, useMutation with apiPut
- Description shown in plan cards on MyPlansPage and PublicPlansPage

### Battleplan Tagging
- `tags` text[] array column on battleplans table (PostgreSQL array, max 10 tags, 30 chars each)
- Tags editable in create dialog (tag input + suggested tags) and BattleplanViewer (owner)
- Tag badges displayed in plan cards on all plan list pages
- Public plans filterable by tag via query parameter (`?tags=Aggressive`)
- Suggested tags: Aggressive, Default, Retake, Rush, Anchor, Roam, Site A, Site B
- Copy endpoint preserves tags

### In-Room Chat
- Ephemeral (not persisted to DB) text messaging between room participants
- `chat:message` client→server event, `chat:messaged` server→client event
- Server handler broadcasts to all room members via `io.to(room).emit()` (includes sender)
- Max 500 chars per message
- ChatPanel component: collapsible overlay (bottom-left), 320x384px
- Unread badge when panel is closed, auto-scroll, username colored by room color
- Guests cannot send messages (input disabled)
- Chat state (chatMessages, unreadCount) in room Zustand store, cleared on room leave

### Socket.IO Events
- Client emits: `room:join`, `room:leave`, `cursor:move`, `draw:create`, `draw:delete`, `draw:update`, `operator-slot:update`, `battleplan:change`, `laser:line`, `chat:message`, `attacker-lineup:create`
- Server emits: `room:joined`, `room:user-joined`, `room:user-left`, `cursor:moved`, `draw:created`, `draw:deleted`, `draw:updated`, `operator-slot:updated`, `battleplan:changed`, `laser:line`, `chat:messaged`, `attacker-lineup:created`
- `operator-slot:updated` includes `side` field ('defender' | 'attacker')
- `cursor:move` now includes optional `isLaser` flag for laser dot rendering
- `laser:line` broadcasts `{ userId, points, color }` — no DB persistence
- 10 colors in pool, assigned to users on room join
- No guest connections — valid JWT required at handshake

---

## File Conventions

### Server
- Route files in `src/routes/` and `src/routes/admin/`
- Each route file exports a Fastify plugin: `export default async function(fastify: FastifyInstance)`
- Business logic in `src/services/`
- Database schema in `src/db/schema/` with barrel export from `src/db/schema/index.ts`
- Database connection singleton in `src/db/connection.ts`
- Socket handlers in `src/socket/handlers/`
- Use `.js` extensions in imports (ESM with TypeScript)

### Client
- Feature-based folder structure under `src/features/`
- Pages are default exports (for lazy loading with `React.lazy`)
- shadcn/ui components in `src/components/ui/`
- Layout components in `src/components/layout/`
- Zustand stores in `src/stores/`
- API/Socket utilities in `src/lib/`
- Path alias: `@/*` → `./src/*`
- Canvas utilities in `src/features/canvas/utils/` (e.g., `hitTest.ts`)

### Shared
- Types in `src/types/` (auth, game, battleplan, room, admin, api, canvas)
- Constants in `src/constants/index.ts` (includes `APP_VERSION`)
- `Tool` enum is in `src/types/canvas.ts` (Pen, Line, Rectangle, Text, Icon, Eraser, Select, Pan, LaserDot, LaserLine)
- Barrel export from `src/index.ts` (uses `export type *` for type-only re-exports)

---

## Theme / Design

- **Dark mode only** (class="dark" on html element)
- **CSS**: Tailwind v4 with CSS theme variables in `src/index.css` using oklch color space
- **Fonts**: Open Sans (body), Montserrat (headings, `.font-heading` class)

### Color Palette

NextDestiny red primary (`#e06161`) with dark blue-gray backgrounds.

| Role | Hex | OKLCH | Usage |
|------|-----|-------|-------|
| **Primary** | `#e06161` | `oklch(0.60 0.15 20)` | Buttons, links, accents, ring, glow effects |
| **Primary Foreground** | `#ffffff` | `oklch(0.98 0 0)` | Text on primary backgrounds |
| **Destructive** | — | `oklch(0.50 0.20 25)` | Errors, delete actions, warnings |
| **Background** | `#2a2f38` | `oklch(0.185 0.01 250)` | Page background |
| **Foreground** | `#c3c9cc` | `oklch(0.88 0.005 250)` | Primary text |
| **Card** | `#323842` | `oklch(0.22 0.012 250)` | Card backgrounds |
| **Secondary** | `#3c4653` | `oklch(0.28 0.015 250)` | Secondary backgrounds, muted areas |
| **Muted Foreground** | — | `oklch(0.65 0.01 250)` | Secondary text, labels |
| **Border / Input** | — | `oklch(0.32 0.015 250)` | Borders, input outlines |
| **Chart 1–5** | — | red, deep-red, amber, teal, purple | Data visualization |

---

## Common Commands

```bash
pnpm dev                    # Start server (3001) + client (5173) concurrently
pnpm build                  # Build shared → server → client
pnpm db:generate            # Generate Drizzle migration files
pnpm db:migrate             # Apply database migrations
pnpm db:seed                # Seed admin user + game data
pnpm db:push                # Push schema changes directly (dev only)
pnpm db:studio              # Open Drizzle Studio
# Map/gadget images are pre-seeded in repo (uploads/maps/ + uploads/gadgets/)
docker compose up -d        # Start PostgreSQL + Redis
docker compose down         # Stop containers (data stays in volumes)
docker compose down -v      # Stop + delete ALL data (pgdata + redisdata volumes)
bash update.sh              # Interactive: 8 modes (update, reset, dev reset, pull main/dev, prod main/dev, prod reset)
battleplanner-update        # Same, if symlinked
```

---

## Development Notes

- Vite dev server proxies `/api` and `/socket.io` to localhost:3001
- The client uses `tsc -b` (project references) for build — `shared` must have `composite: true`
- `tsconfig.node.json` in client is for vite.config.ts only
- `noUnusedLocals` and `noUnusedParameters` are enabled in client — remove unused imports
- Seed data includes: 1 admin user, 1 game (R6 Siege), 21 maps with correct floor counts + cover thumbnails, ~78 operators (complete Y1-Y10 roster), ~87 gadgets (23 with pre-seeded icons)
- Admin login after seed: user created from DISCORD_ADMIN_ID env variable (no password — Discord OAuth only)
- Upload directory structure: `uploads/{games,maps,operators,gadgets}/` — all directories are tracked in git (pre-seeded images committed to repo)
- Pre-seeded images: 165 map floor WebP + 23 gadget icon WebP + 21 map cover WebP committed to repo, referenced by seed via deterministic names (`{slug}-{num}-{variant}.webp`, `{slug}-cover.webp`)
- Images uploaded via admin panel are processed by Sharp (resized, converted to WebP) and override the seed paths in the DB
- `processUpload()` returns `null` for empty file buffers (e.g. form submits without selecting a file) — callers skip processing
- Radix UI Switch sends "on" in FormData, not "true" — client normalizes to "true"/"false" before sending
- Admin floor management: `/admin/maps/:mapId/floors` — upload blueprint, darkprint, and whiteprint images per floor
- `map_floors` table has: `imagePath` (blueprint, required), `darkImagePath`, `whiteImagePath` (both nullable)
- Process script: `packages/server/src/scripts/process-images.ts` — converts source images to WebP with deterministic names (no DB access needed)

---

## Known Gotchas / Deployment Notes

### Stale Drizzle migration files cause "already exists" errors
When resetting the database (`docker compose down -v`), the old migration files in `packages/server/drizzle/` still exist. If the schema evolved across multiple migrations (e.g., one creates a table, another adds a column), regenerating on top of stale files produces conflicts. **Always clean migrations before regenerating from scratch:**
```bash
rm -rf packages/server/drizzle/*
pnpm db:generate
```
The `update.sh` script (mode 1: dev) does this automatically.

### drizzle-kit cannot resolve .js extensions
drizzle-kit uses CJS `require()` internally which cannot resolve `.js` → `.ts` imports. All `db:generate`, `db:migrate`, `db:seed`, and `db:studio` scripts run through `tsx` to handle this. Do NOT remove the `tsx` prefix from these scripts in `packages/server/package.json`.

### dotenv path resolution
When `pnpm --filter` runs scripts, cwd is `packages/server/`, not project root. The `.env` file lives in the project root. All server entry points (`index.ts`, `connection.ts`, `seed.ts`, `drizzle.config.ts`) must use:
```typescript
import { config } from 'dotenv';
config({ path: '../../.env' });
```
Do NOT use `import 'dotenv/config'` — it loads `.env` from cwd which is wrong.

### docker compose down -v deletes everything
`-v` removes named volumes. This deletes:
- `pgdata` — the entire PostgreSQL database (users, games, maps, battleplans, everything)
- `redisdata` — Redis persistence (currently unused for auth, available for future caching)

Code, `.env`, and upload files on disk are NOT affected. After `down -v` you must re-run `db:generate`, `db:migrate`, `db:seed`.

### Server must be running for client to work
The Vite dev client proxies all `/api/*` and `/socket.io` requests to `localhost:3001`. If the server is not running, you get `ECONNREFUSED` errors and no data loads. Always start the server before/alongside the client.

---

## Versioning

- Version is defined in two places: `package.json` (root) and `APP_VERSION` in `packages/shared/src/constants/index.ts`
- Both must be kept in sync when bumping versions
- Version is displayed in the footer (AppLayout) and Impressum page
- Version history is maintained in three places that **must all be updated** when releasing a new version:
  1. `CHANGELOG.md` (root) — plain Markdown, used for external homepage sync
  2. `packages/client/src/features/legal/ChangelogPage.tsx` — the `/changelog` page in the app
  3. Keep both in sync with identical content

---

## API Endpoints Overview

### Auth: `/api/auth/`
GET discord/url, me
POST discord/callback, refresh, logout

### Admin Users: `/api/admin/users/`
GET (paginated), POST/:id/role, POST/:id/delete

### Admin Teams: `/api/admin/teams/`
GET (list with member count), POST (create), POST/:id (update), POST/:id/delete
GET /:id/members, POST /:id/members (add), POST /:id/members/:memberId/delete (remove)

### Public: `/api/`
GET games, games/:slug, games/:slug/maps/:mapSlug, games/:slug/operators, games/:slug/gadgets

### Battleplans: `/api/battleplans/`
GET (public, paginated), GET mine, POST create, GET/:id (optionalAuth), POST/:id (update), POST/:id/delete, POST/:id/copy, POST/:id/vote

### Draws: `/api/`
POST battleplan-floors/:id/draws (batch), POST draws/:id (update), POST draws/:id/delete (soft delete)

### Rooms: `/api/rooms/`
POST create (supports gameId+mapId for auto-battleplan), GET/:connString (optionalAuth), POST/:connString/battleplan (update), POST/:connString/delete

### Admin: `/api/admin/`
Full CRUD for games, maps, map-floors, operators, gadgets, operator-gadgets, users, tokens, settings, stats

### HTTP Method Convention
All mutating endpoints use POST only (no PUT or DELETE). This ensures compatibility with reverse proxies that restrict HTTP methods. The `apiPut()` client helper internally sends POST. The `apiDelete()` helper sends POST to `path + '/delete'`.

---

## Client Routes

| Path | Page | Auth |
|------|------|------|
| `/` | HomePage | Public (shows Discord login if unauthenticated) |
| `/auth/discord/callback` | DiscordCallbackPage | Public (OAuth redirect handler) |
| `/teams` | TeamSelectionPage | Protected |
| `/help` | HelpPage | Public |
| `/faq` | FAQPage | Public |
| `/changelog` | ChangelogPage | Public |
| `/about` | AboutPage | Public |
| `/impressum` | ImpressumPage | Public |
| `/agb` | AGBPage | Public |
| `/:gameSlug` | GameDashboard | Team required |
| `/:gameSlug/plans/public` | PublicPlansPage | Team required |
| `/:gameSlug/plans/:planId` | BattleplanViewer | Team required |
| `/:gameSlug/plans` | MyPlansPage | Team required |
| `/room/create` | CreateRoomPage | Team required |
| `/room/:connectionString` | RoomPage | Team required |
| `/account` | AccountSettingsPage | Team required |
| `/admin` | AdminDashboard | Admin only |
| `/admin/users` | AdminUsers | Admin only |
| `/admin/teams` | AdminTeams | Admin only |
| `/admin/settings` | AdminSettings | Admin only |
