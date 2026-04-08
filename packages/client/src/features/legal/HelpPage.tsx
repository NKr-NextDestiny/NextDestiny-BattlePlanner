import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Keyboard, Mouse, Pencil, Move, ZoomIn, Eraser, Type, Minus, Square, Users, Share2, Shield, Crosshair, Presentation, Sticker, Settings, Wand2, Camera, FileDown, MousePointer2, MessageSquare, Tag, UserCheck } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Help</h1>
      <p className="text-muted-foreground mb-8">Learn how to use TactiHub's canvas, tools, and collaboration features.</p>

      <div className="space-y-8">
        {/* Drawing Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Drawing Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Pencil className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Pen</p>
                  <p className="text-sm text-muted-foreground">Freehand drawing. Click and drag to draw paths.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Minus className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Line</p>
                  <p className="text-sm text-muted-foreground">Click start point, drag to end point for straight lines.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Square className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Rectangle</p>
                  <p className="text-sm text-muted-foreground">Click and drag to draw rectangular shapes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Type className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Text</p>
                  <p className="text-sm text-muted-foreground">Click on the canvas, then type your text in the prompt.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eraser className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Eraser</p>
                  <p className="text-sm text-muted-foreground">Click on a drawing to delete it. You can only erase your own drawings — others&apos; draws appear dimmed.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MousePointer2 className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Select, Resize &amp; Rotate</p>
                  <p className="text-sm text-muted-foreground">Click on your own drawing to select it. Drag to reposition. Use the 8 square handles (corners and edges) to resize. Use the circle handle above the selection to rotate. After drawing a line or rectangle, the tool automatically switches to Select mode so you can immediately adjust.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sticker className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Gadget Icons</p>
                  <p className="text-sm text-muted-foreground">Place operator gadgets on the map. In the side panels (ATK/DEF), each operator column shows their available gadgets below the drawing tools. Click a gadget cell to select it, then click on the canvas to place the icon. General gadgets (Drone, Barricade, etc.) are available for all slots.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Move className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Pan</p>
                  <p className="text-sm text-muted-foreground">Click and drag to move around the map. Also works with middle mouse button.</p>
                </div>
              </div>
            </div>

            <Separator />

            <p className="font-medium">Laser Pointer Tools</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Crosshair className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Laser Dot</p>
                  <p className="text-sm text-muted-foreground">Shows a glowing dot at your cursor position, visible to all room members. Useful for pointing at specific spots.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Presentation className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Laser Line</p>
                  <p className="text-sm text-muted-foreground">Click and drag to draw a temporary line visible to all room members. The line fades out over 3 seconds after releasing.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">
                Use the <strong>color picker</strong> to change the drawing color and the <strong>slider</strong> to adjust line width.
                When the Text tool is active, a <strong>font size selector</strong> appears in the toolbar (12–64px).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ZoomIn className="h-5 w-5" /> Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Mouse className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Zoom</p>
                <p className="text-sm text-muted-foreground">Scroll the mouse wheel to zoom in/out, centered on your cursor. Zoom range: 25% to 400%.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Move className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Pan</p>
                <p className="text-sm text-muted-foreground">Use the Pan tool or hold middle mouse button and drag to move around the map.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ZoomIn className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Zoom Controls</p>
                <p className="text-sm text-muted-foreground">Use the +/- buttons in the bottom-right corner, or click the reset button to return to 100%.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5" /> Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Ctrl + Z', 'Undo last action'],
                ['Ctrl + Y', 'Redo last action'],
                ['Ctrl + Shift + Z', 'Redo (alternative)'],
                ['K', 'Go to floor above'],
                ['J', 'Go to floor below'],
                ['Middle Mouse', 'Pan (drag)'],
                ['Scroll Wheel', 'Zoom in/out'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50">
                  <kbd className="text-xs font-mono bg-background px-2 py-0.5 rounded border">{key}</kbd>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collaboration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Collaboration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Create a room by choosing a game and map. Share the invite link with your teammates — they can join by clicking the link or entering the room code.</p>
            <p>Everyone in the room sees each other's drawings and cursor positions in real-time. Each user gets assigned a unique color.</p>
            <p>Guests can view and draw in rooms without logging in. Guest drawings are local only and won&apos;t be saved or visible to other room members. Log in to persist and share your drawings.</p>
          </CardContent>
        </Card>

        {/* Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Sharing Battle Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Battle plans are private by default. To share a plan:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Open the plan in the viewer</li>
              <li>Toggle the <strong>Public</strong> switch to make it visible to everyone</li>
              <li>Click <strong>Share</strong> to copy the direct link</li>
            </ol>
            <p>Public plans appear in the community section where others can view, vote, and copy them.</p>
          </CardContent>
        </Card>

        {/* Sandbox */}
        <Card>
          <CardHeader>
            <CardTitle>Sandbox Mode</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Want to try TactiHub without creating an account? Use the <strong>Sandbox</strong> to draw on any map locally.
              Sandbox drawings are not saved — log in and create a room or battle plan to persist your work.
            </p>
          </CardContent>
        </Card>

        {/* Magic Link Login */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wand2 className="h-5 w-5" /> Magic Link Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Magic Link is a passwordless login option. Instead of entering a password, you receive a one-time login link via email.</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>On the login page, click <strong>Login with Magic Link</strong></li>
              <li>Enter your email address or username</li>
              <li>Check your email and click the login link</li>
              <li>You'll be logged in automatically</li>
            </ol>
            <p>The link expires after 15 minutes and can only be used once. If the link expires, simply request a new one.</p>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Export Drawings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Export your strategy drawings using the buttons in the bottom-right corner of the canvas (next to the zoom controls).</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">PNG Export</p>
                  <p>Downloads the current floor as a PNG image with all drawings composited onto the map background.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileDown className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">PDF Export</p>
                  <p>Downloads all floors as a multi-page landscape PDF with floor names as headers. Great for printing or sharing a complete strategy.</p>
                </div>
              </div>
            </div>
            <p>Export is available to all users, including guests.</p>
          </CardContent>
        </Card>

        {/* In-Room Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> In-Room Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Use the chat panel to send text messages to everyone in the room. Click the <strong>Chat</strong> button in the bottom-left corner to open the panel.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Messages are <strong>ephemeral</strong> — they are not saved and disappear when you leave the room</li>
              <li>Each user&apos;s name is shown in their assigned room color</li>
              <li>An <strong>unread badge</strong> appears on the chat button when new messages arrive while the panel is closed</li>
              <li>Guests can read messages but must log in to send</li>
            </ul>
          </CardContent>
        </Card>

        {/* Battleplan Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Battleplan Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Organize your battle plans with tags like &quot;Rush&quot;, &quot;Default&quot;, &quot;Retake&quot;, &quot;Aggressive&quot;, etc.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Add tags when creating a plan or edit them later in the plan viewer</li>
              <li>Use suggested tags or type your own (up to 10 tags, max 30 characters each)</li>
              <li>Public plans can be <strong>filtered by tag</strong> on the community page</li>
              <li>Tags are shown as colored badges on plan cards</li>
            </ul>
          </CardContent>
        </Card>

        {/* Operator Lineup & Side Panels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Operator Lineup &amp; Side Panels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The editor has an <strong>OperatorStrip</strong> at the top showing 5 ATK + 5 DEF operator slots. Click a slot to assign an operator via a searchable popover grid.</p>
            <p>The left and right <strong>Side Panels</strong> (Attackers / Defenders) contain:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Visibility toggles</strong> and <strong>color pickers</strong> per operator slot</li>
              <li><strong>Landscape section</strong> — draw without a specific operator using a separate color</li>
              <li><strong>Tool grid</strong> — 5 columns (one per operator) × drawing tools (Pen, Line, Rectangle, Text, Eraser, Select). Clicking a cell activates that tool with that operator&apos;s color.</li>
              <li><strong>Gadget rows</strong> — below the tools, each column shows operator-specific gadgets (unique, secondary) plus general gadgets (Drone, Barricade, etc.). Click a gadget to activate Icon tool and place it on the canvas.</li>
              <li><strong>Operator avatars</strong> — bottom row showing assigned operators with active slot highlight</li>
            </ul>
            <Separator />
            <p className="font-medium text-foreground">Phases</p>
            <p>Use the <strong>Phase dropdown</strong> in the top bar to create, rename, delete, and switch between strategy phases. Each phase can have its own set of drawings.</p>
            <Separator />
            <p>Lineup changes are synced in real-time to all room participants via Socket.IO.</p>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Access your account settings from the user menu in the top-right corner of the navbar.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Account Info</strong> — View your username, email, role, and registration date</li>
              <li><strong>Delete Account</strong> — Request account deletion with a two-step confirmation process and email verification. After confirming via email, your account is deactivated for 30 days. During this grace period, an administrator can reactivate your account. After 30 days, your account and all associated data (battle plans, drawings, rooms) are permanently deleted.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Admin Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Admins have access to the admin panel for managing the platform:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Games</strong> — Add/edit games with name, slug, icon, and active status</li>
              <li><strong>Maps</strong> — Add maps per game with thumbnail, competitive/active toggles</li>
              <li><strong>Floor Layouts</strong> — Manage floor definitions for each map (reorder, rename, delete, optional image upload)</li>
              <li><strong>Operators &amp; Gadgets</strong> — Manage operators and their gadgets with icons</li>
              <li><strong>Users</strong> — View all users, toggle roles, manually verify emails (important if no SMTP is set up!), delete users</li>
              <li><strong>Tokens</strong> — Create single-use registration tokens when public registration is disabled</li>
              <li><strong>Settings</strong> — Toggle public registration on/off</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
