type ChangeType = 'feature' | 'improvement' | 'fix' | 'removed';

interface Change {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  tag?: string;
  subtitle?: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: '2.0.1',
    subtitle: 'Operator Icons & Icon Sizing',
    date: '2026-02-18',
    tag: 'Latest',
    changes: [
      { type: 'feature', text: 'Operator images in OperatorStrip and SidePanel \u2014 assigned operators now show their actual icon instead of just a first letter' },
      { type: 'feature', text: 'Operator badge on placed gadget icons \u2014 small circular operator logo overlay in the bottom-right corner of canvas gadget icons' },
      { type: 'improvement', text: 'Sandbox auto-selects game on load \u2014 no more blank page requiring hard reload' },
      { type: 'improvement', text: 'Gadget/icon placement size reduced from 40px to 20px to fit SVG map proportions' },
      { type: 'fix', text: 'Operator gadgets not loading in sandbox \u2014 incorrect game slug fallback caused 404 on operator/gadget API calls' },
    ],
  },
  {
    version: '2.0.0',
    subtitle: 'Canvas Rewrite & Side Panel Editor',
    date: '2026-02-16',
    changes: [
      { type: 'feature', text: 'Complete canvas system rewrite \u2014 replaced 1197-line monolithic CanvasLayer with modular architecture (MapCanvas, BackgroundLayer, DrawLayer, ActiveLayer, tool hooks)' },
      { type: 'feature', text: 'New editor layout \u2014 CSS grid with TopNavBar, OperatorStrip, and left/right SidePanels (ATK/DEF)' },
      { type: 'feature', text: 'Per-operator gadget toolbar \u2014 each operator column shows unique, secondary, and general gadgets below the standard drawing tools' },
      { type: 'feature', text: 'Inline operator picker \u2014 click operator slots in the OperatorStrip to assign operators via searchable popover grid' },
      { type: 'feature', text: 'SVG Real View as default \u2014 maps now open in interactive SVG view with toggleable layers' },
      { type: 'feature', text: 'Phase management \u2014 create, rename, delete, and switch between strategy phases per battleplan' },
      { type: 'feature', text: 'Strategy config popover and landscape drawing mode (draw without operator slot)' },
      { type: 'feature', text: 'Per-operator visibility toggles and color pickers in the side panels' },
      { type: 'improvement', text: 'Corrected SVG floor mapping \u2014 floor numbers now match SVG group IDs (Basement, 1F, 2F, 3F naming)' },
      { type: 'improvement', text: 'Granular Zustand selectors throughout the editor \u2014 prevents unnecessary re-renders' },
      { type: 'fix', text: 'Infinite re-render crashes fixed \u2014 Zustand selectors and Radix UI composeRefs issues resolved' },
      { type: 'fix', text: 'Operator display, map covers, and game icons now render correctly' },
    ],
  },
  {
    version: '1.8.6',
    subtitle: 'Account Settings & Token Stability',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Email address change \u2014 all users (including admin) can change their email via Account Settings with password confirmation and new-email verification' },
      { type: 'feature', text: 'Password change \u2014 all users can change their password via Account Settings (current password + new password with confirmation)' },
      { type: 'feature', text: 'reCAPTCHA on login page (optional, same as registration \u2014 only active when RECAPTCHA keys are configured)' },
      { type: 'feature', text: 'Admin can resend verification email to unverified users (mail icon in admin user table)' },
      { type: 'feature', text: 'SMTP test script (bash test-smtp.sh) for troubleshooting email delivery' },
      { type: 'improvement', text: 'All auth tokens moved from Redis to database \u2014 refresh tokens, password reset, deletion, and magic link tokens now survive Redis restarts' },
      { type: 'improvement', text: 'Toast close button moved to top-right of notification' },
      { type: 'improvement', text: 'Removed unused Redis dependency from socket module' },
      { type: 'fix', text: 'Random logouts fixed \u2014 concurrent token refresh requests no longer cause race condition' },
    ],
  },
  {
    version: '1.8.5',
    subtitle: 'Production Fixes & Plan Settings',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Plan settings dialog in room view \u2014 edit name, description, notes, tags, and public toggle with manual save' },
      { type: 'feature', text: 'Resend verification email option on login page when email is not yet verified' },
      { type: 'improvement', text: 'Email verification tokens stored in database instead of Redis (survives Redis restarts)' },
      { type: 'improvement', text: 'Registration no longer fails when SMTP is unavailable (best-effort email)' },
      { type: 'improvement', text: 'Dismissable toast notifications (close button on all toasts)' },
      { type: 'improvement', text: 'Ubisoft screenshot disclaimer added to Impressum and About pages' },
      { type: 'fix', text: 'All API endpoints changed from PUT/DELETE to POST (fixes nginx 403 blocking in production)' },
      { type: 'fix', text: 'Battleplan delete now works correctly (was silently failing)' },
      { type: 'fix', text: 'Public toggle on battleplans works in production' },
      { type: 'fix', text: 'Non-public plans show "not found" message instead of infinite loading for anonymous users' },
      { type: 'fix', text: 'Admin manual user verification works in production' },
      { type: 'fix', text: 'Draw operations (move, resize, erase) work in production' },
    ],
  },
  {
    version: '1.8.4',
    subtitle: 'Map Names & Laser Fixes',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Map name displayed in room and sandbox header bar' },
      { type: 'improvement', text: 'Map name included in battleplan API response' },
      { type: 'improvement', text: 'Sandbox header: Exit button, sandbox warning, Login/Register buttons' },
      { type: 'fix', text: 'PDF export now generates pages top-to-bottom (highest floor first)' },
      { type: 'fix', text: 'Laser line persists while fading \u2014 new lines no longer clear old fading lines' },
      { type: 'fix', text: 'Sandbox mode layout matches logged-in room layout (single header bar, no scrollbar)' },
      { type: 'fix', text: 'Sandbox warning text now matches game selection banner with "Log in" link' },
      { type: 'fix', text: 'Sandbox game/map selection pages now show grid background like other pages' },
      { type: 'fix', text: 'Laser line flickering when drawing new line while old one is fading' },
      { type: 'fix', text: 'Removed redundant version badge from Changelog page header' },
    ],
  },
  {
    version: '1.8.3',
    subtitle: 'Move/Resize Undo & Sandbox Fixes',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Undo/redo now covers move and resize operations' },
      { type: 'feature', text: 'Rainbow Six Siege game logo added' },
      { type: 'improvement', text: 'Auto-switch to Select only for shapes (Line, Rectangle), not Pen/freehand' },
      { type: 'fix', text: 'Sandbox lineup \u2014 operator slot selection now works in sandbox mode' },
      { type: 'fix', text: 'Logout redirects to homepage instead of login page' },
      { type: 'fix', text: 'Sandbox scrollbar removed \u2014 info banner merged into toolbar row' },
      { type: 'fix', text: 'Move/resize ghost eliminated \u2014 original draw hidden during drag' },
      { type: 'fix', text: 'Laser line no longer jumps when restarting during fade' },
    ],
  },
  {
    version: '1.8.2',
    subtitle: 'R6 Siege Focus',
    date: '2026-02-14',
    changes: [
      { type: 'improvement', text: 'Updated all documentation to reflect R6 Siege-only focus' },
      { type: 'removed', text: 'Valorant game data removed from seed \u2014 TactiHub now focuses exclusively on Rainbow Six Siege' },
    ],
  },
  {
    version: '1.8.1',
    subtitle: 'Visual Lineup Picker & Optimistic Draws',
    date: '2026-02-13',
    changes: [
      { type: 'feature', text: 'Visual operator lineup picker \u2014 clickable image grid replaces dropdown selectors' },
      { type: 'improvement', text: 'Sandbox mode matches room layout \u2014 full-screen canvas with icon sidebar and toolbar' },
      { type: 'improvement', text: 'Server-side admin deletion guard \u2014 request-deletion endpoint rejects admin-role users' },
      { type: 'fix', text: 'Session persistence \u2014 sessions now survive page reload' },
      { type: 'fix', text: 'Admin self-deletion protection \u2014 admin role users can no longer see or trigger account deletion' },
      { type: 'fix', text: 'Eraser tool now works immediately \u2014 optimistic draw tracking makes draws erasable before API response' },
      { type: 'fix', text: 'Select/Move tool works immediately \u2014 draws are selectable and movable right after creation' },
      { type: 'fix', text: 'Draws persist on floor switch \u2014 optimistic draws stay visible while awaiting server confirmation' },
    ],
  },
  {
    version: '1.8.0',
    subtitle: 'Operator Lineup System',
    date: '2026-02-13',
    changes: [
      { type: 'feature', text: 'Operator Lineup System \u2014 select 5 defenders per battleplan to filter the icon sidebar' },
      { type: 'feature', text: 'Optional Attacker Lineup \u2014 add 5 attacker slots on demand, remove when not needed' },
      { type: 'feature', text: 'Lineup tab in Icon Sidebar \u2014 3-tab layout (Lineup / Operators / Gadgets) with dropdown selectors' },
      { type: 'feature', text: 'Smart sidebar filtering \u2014 operators and gadgets auto-filter to lineup members' },
      { type: 'feature', text: '"Show all" toggle \u2014 reveals all operators/gadgets with "Nicht im Lineup" warning' },
      { type: 'feature', text: 'Lineup display on BattleplanViewer \u2014 read-only operator avatars with DEF/ATK labels' },
      { type: 'feature', text: 'Real-time lineup sync \u2014 slot changes broadcast via Socket.IO to all room participants' },
      { type: 'improvement', text: 'Gadget filtering uses operator-gadget relationships for precise results' },
      { type: 'improvement', text: 'Duplicate prevention \u2014 already-assigned operators hidden from lineup dropdowns' },
    ],
  },
  {
    version: '1.7.0',
    subtitle: 'Resize, Rotate & Full Operator Roster',
    date: '2026-02-13',
    changes: [
      { type: 'feature', text: 'Resize & Rotate for selected drawings \u2014 8 resize handles (corners + edges) and a rotate handle above the bounding box' },
      { type: 'feature', text: 'All R6 Siege operators added (~78 total) \u2014 complete roster through Year 10' },
      { type: 'feature', text: 'All gadgets now visible in sidebar \u2014 text fallback for gadgets without icons, grouped by category' },
      { type: 'feature', text: 'Auto-switch to Select tool after drawing \u2014 immediately shows resize/rotate handles' },
      { type: 'improvement', text: 'Sticky footer \u2014 footer stays at bottom of viewport even when page content is short' },
      { type: 'fix', text: 'Fixed undo/redo system \u2014 corrected payload indexing, prevented redo from clearing undo stack' },
      { type: 'fix', text: 'Fixed z-index overlaps \u2014 chat panel no longer hidden behind compass or icon sidebar' },
      { type: 'fix', text: 'Added missing draw:updated socket listener \u2014 peer draw updates now sync correctly' },
    ],
  },
  {
    version: '1.6.0',
    subtitle: 'Chat, Tags & Select Tool',
    date: '2026-02-13',
    changes: [
      { type: 'feature', text: 'In-room text chat \u2014 ephemeral messaging between room participants with unread badge' },
      { type: 'feature', text: 'Select & Drag tool \u2014 click to select your own drawings, drag to reposition them' },
      { type: 'feature', text: 'Ownership-based draw interaction \u2014 eraser and select only affect your own drawings, others\u2019 draws are dimmed' },
      { type: 'feature', text: 'Adjustable font size for Text tool (12\u201364px selector in toolbar)' },
      { type: 'feature', text: 'Battleplan tagging \u2014 add tags like "Rush", "Default", "Retake" to organize and filter plans' },
      { type: 'feature', text: 'Battleplan description and notes \u2014 inline-editable fields for plan owners' },
      { type: 'feature', text: 'Tag filtering on public plans page' },
      { type: 'feature', text: 'Separate Changelog page' },
      { type: 'improvement', text: 'Server-side ownership checks on draw update and delete endpoints' },
      { type: 'improvement', text: 'Replaced dev-reset.sh with interactive update.sh (dev/prod mode selector)' },
    ],
  },
  {
    version: '1.5.2',
    subtitle: 'Magic Link & Guest Drawing',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Magic Link (passwordless) login via email \u2014 enter email or username, receive a login link, click to log in' },
      { type: 'feature', text: 'Guests can now draw locally in rooms (full toolbar, icons, undo/redo \u2014 drawings not persisted or shared)' },
      { type: 'feature', text: 'PNG export (current floor) and PDF export (all floors as multi-page landscape) for all users including guests' },
      { type: 'feature', text: 'Icon sidebar with vertical "Icons" label and pulse animation for first-visit discoverability' },
      { type: 'improvement', text: 'Icon image cache to prevent flicker on re-renders' },
      { type: 'fix', text: 'Improved map centering with ResizeObserver (fixes top-flush/bottom-gap issue)' },
    ],
  },
  {
    version: '1.5.1',
    subtitle: 'Account Deletion & reCAPTCHA',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Account self-deletion with double confirmation, email verification, and 30-day grace period' },
      { type: 'feature', text: 'Google reCAPTCHA v2 on registration (optional, works without configuration)' },
      { type: 'feature', text: 'Account Settings page with account info and danger zone' },
      { type: 'feature', text: 'Admin: reactivate deactivated users, self-delete protection' },
      { type: 'feature', text: 'Admin: deactivated user status and days-left countdown in user table' },
      { type: 'feature', text: 'Complete production deployment guide in README (Nginx, SSL, systemd, ufw)' },
      { type: 'improvement', text: 'Removed redundant admin username bar in admin panel' },
      { type: 'improvement', text: 'User menu moved to far right in navbar' },
      { type: 'fix', text: 'Fixed DELETE request Content-Type bug (Fastify empty body error)' },
    ],
  },
  {
    version: '1.5.0',
    subtitle: 'Laser Pointer & Icon Placement',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Laser Pointer tools: Laser Dot (pulsating point) and Laser Line (fading trail, 3s)' },
      { type: 'feature', text: 'Operator and gadget icon placement on canvas via Icon tool' },
      { type: 'feature', text: 'Map cover images for all 21 R6 maps' },
      { type: 'improvement', text: 'Drawings now stay permanent after releasing the mouse button' },
      { type: 'improvement', text: 'README table of contents with anchor links' },
      { type: 'fix', text: 'Fixed Settings link in Tokens page causing logout' },
      { type: 'fix', text: 'Removed grey loading bar at bottom of page' },
      { type: 'fix', text: 'Fixed infinite horizontal scroll bug' },
      { type: 'fix', text: 'Fixed black canvas on initial plan load' },
    ],
  },
  {
    version: '1.4.0',
    subtitle: 'Floor Image Import',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Batch image import script for floor images and gadget icons' },
      { type: 'feature', text: 'Added 3 new R6 maps: Fortress, Nighthaven Labs, Outback' },
      { type: 'feature', text: 'Gadget icon import from source folder' },
      { type: 'fix', text: 'Correct floor names and counts per map (was generic 4-floor placeholder)' },
    ],
  },
  {
    version: '1.3.0',
    subtitle: 'Admin Verification & Gaming Design',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Admin manual user verification (with confirmation dialog and notification email)' },
      { type: 'feature', text: 'Floor layout management UI (upload, reorder, rename, delete per map)' },
      { type: 'feature', text: 'Gaming-style design across all pages (HUD corners, particles, glow effects)' },
      { type: 'feature', text: 'Styled HTML email templates with dark theme, logo, and branded buttons' },
      { type: 'feature', text: 'New APP_URL env variable for correct email link generation' },
      { type: 'improvement', text: 'Improved settings page layout clarity' },
      { type: 'improvement', text: 'Admin username moved to top-right corner' },
      { type: 'fix', text: 'Fixed "Input Buffer is empty" crash when toggling game/map status without file upload' },
      { type: 'fix', text: 'Fixed gadget category dropdown visibility in dark mode' },
      { type: 'fix', text: 'Fixed Radix Switch form values not correctly sent as "true"/"false"' },
    ],
  },
  {
    version: '1.2.2',
    subtitle: 'First Login & Token Registration',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Forced credential change on first login with default admin account' },
      { type: 'feature', text: 'Login accepts username or email' },
      { type: 'feature', text: 'Token-gated registration flow (separate token entry step when public reg is off)' },
      { type: 'feature', text: 'SMTP SSL/TLS support (SMTP_SECURE env var)' },
      { type: 'improvement', text: 'Improved admin tables (proper HTML tables with aligned columns)' },
      { type: 'improvement', text: 'Tokens page shows info banner when public registration is enabled' },
      { type: 'improvement', text: 'Back to Homepage links on auth pages' },
      { type: 'improvement', text: 'Larger logo throughout the app' },
    ],
  },
  {
    version: '1.2.1',
    subtitle: 'Zoom, Pan & Core Tools',
    date: '2026-02-11',
    changes: [
      { type: 'feature', text: 'Zoom + Pan (mouse wheel, pan tool, middle-click, zoom limits 25%-400%)' },
      { type: 'feature', text: 'Eraser tool (click to delete drawings)' },
      { type: 'feature', text: 'Undo/Redo (Ctrl+Z / Ctrl+Y, toolbar buttons)' },
      { type: 'feature', text: 'Share battle plans by link (public toggle, share button)' },
      { type: 'feature', text: 'Guest access (sandbox mode, room viewing)' },
      { type: 'feature', text: 'Compass overlay on canvas' },
      { type: 'feature', text: 'Help page, FAQ page, and versioned Impressum' },
      { type: 'improvement', text: 'Improved room creation with game/map selection flow' },
    ],
  },
  {
    version: '1.1.0',
    subtitle: 'Branding & Documentation',
    date: '2026-02-11',
    changes: [
      { type: 'feature', text: 'Branding update (TactiHub logo, orange/red color scheme)' },
      { type: 'feature', text: 'Impressum page with credits to original projects' },
      { type: 'feature', text: 'README and CLAUDE.md documentation' },
    ],
  },
  {
    version: '1.0.0',
    subtitle: 'Initial Release',
    date: '2026-02-11',
    changes: [
      { type: 'feature', text: 'Initial release' },
      { type: 'feature', text: 'Rainbow Six Siege support with full map and operator data' },
      { type: 'feature', text: 'Real-time collaboration rooms with Socket.IO' },
      { type: 'feature', text: 'Canvas drawing (pen, line, rectangle, text, icons)' },
      { type: 'feature', text: 'Battle plan CRUD with voting system' },
      { type: 'feature', text: 'Admin panel for game/map/operator management' },
      { type: 'feature', text: 'JWT authentication with email verification' },
    ],
  },
];

function getTypeBadge(type: ChangeType) {
  switch (type) {
    case 'feature': return { label: 'New', cls: 'bg-primary/20 text-primary border-primary/30' };
    case 'improvement': return { label: 'Improved', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'fix': return { label: 'Fix', cls: 'bg-green-500/20 text-green-400 border-green-500/30' };
    case 'removed': return { label: 'Removed', cls: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
}

function countByType(changes: Change[]) {
  const counts = { feature: 0, improvement: 0, fix: 0, removed: 0 };
  for (const c of changes) counts[c.type]++;
  return counts;
}

function summaryParts(counts: { feature: number; improvement: number; fix: number; removed: number }) {
  const parts: { text: string; cls: string }[] = [];
  if (counts.feature > 0) parts.push({ text: `${counts.feature} new`, cls: 'bg-primary/15 text-primary border-primary/30' });
  if (counts.improvement > 0) parts.push({ text: `${counts.improvement} improved`, cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' });
  if (counts.fix > 0) parts.push({ text: `${counts.fix} fixed`, cls: 'bg-green-500/15 text-green-400 border-green-500/30' });
  if (counts.removed > 0) parts.push({ text: `${counts.removed} removed`, cls: 'bg-red-500/15 text-red-400 border-red-500/30' });
  return parts;
}

export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Changelog</h1>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-3 top-2 bottom-0 w-px bg-gradient-to-b from-primary via-border to-transparent" />

        <div className="space-y-8">
          {releases.map((release, i) => {
            const counts = countByType(release.changes);
            const parts = summaryParts(counts);
            return (
              <div key={release.version} className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />

                <details className="group" open={i === 0}>
                  <summary className="cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
                    {/* Version header */}
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-xl font-bold">v{release.version}</h2>
                      {release.tag && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                          {release.tag}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">{release.date}</span>
                      {release.subtitle && (
                        <span className="text-sm text-muted-foreground font-normal">— {release.subtitle}</span>
                      )}
                      <svg
                        className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {/* Summary badges (visible when collapsed) */}
                    <div className="flex items-center gap-2 flex-wrap group-open:hidden">
                      {parts.map((part) => (
                        <span key={part.text} className={`px-2 py-0.5 rounded text-xs font-medium border ${part.cls}`}>
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </summary>

                  {/* Changes (expanded) */}
                  <div className="mt-3 rounded-lg border bg-card p-4 space-y-2.5">
                    {release.changes.map((change, j) => {
                      const badge = getTypeBadge(change.type);
                      return (
                        <div key={j} className="flex items-start gap-3">
                          <span className={`shrink-0 min-w-[70px] text-center px-2 py-0.5 rounded text-xs font-medium border ${badge.cls}`}>
                            {badge.label}
                          </span>
                          <span className="text-sm">{change.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
