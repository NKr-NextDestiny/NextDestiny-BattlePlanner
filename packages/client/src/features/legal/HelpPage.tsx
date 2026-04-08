import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Keyboard, Mouse, Pencil, Move, ZoomIn, Eraser, Type, Minus, Square, Users, Share2, Shield, Crosshair, Presentation, Sticker, Settings, Camera, FileDown, MousePointer2, MessageSquare, Tag, UserCheck } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Help</h1>
      <p className="text-muted-foreground mb-8">Erfahre, wie du Canvas, Tools und Zusammenarbeit im NextDestiny BattlePlanner nutzt.</p>

      <div className="space-y-8">
        {/* Drawing Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> Zeichenwerkzeuge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Pencil className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Stift</p>
                  <p className="text-sm text-muted-foreground">Freihandzeichnen. Klicke und ziehe, um Pfade zu zeichnen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Minus className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Linie</p>
                  <p className="text-sm text-muted-foreground">Klicke auf den Startpunkt und ziehe zum Endpunkt für gerade Linien.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Square className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Rechteck</p>
                  <p className="text-sm text-muted-foreground">Klicke und ziehe, um rechteckige Formen zu zeichnen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Type className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Text</p>
                  <p className="text-sm text-muted-foreground">Klicke auf die Canvas und gib deinen Text ein.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eraser className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Radierer</p>
                  <p className="text-sm text-muted-foreground">Klicke auf eine Zeichnung, um sie zu löschen. Du kannst nur eigene Zeichnungen löschen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MousePointer2 className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Auswählen, Skalieren &amp; Drehen</p>
                  <p className="text-sm text-muted-foreground">Klicke auf eine eigene Zeichnung zum Auswählen. Ziehe zum Verschieben. Nutze die 8 Handles zum Skalieren und den Kreis-Handle oben zum Drehen. Nach Linie/Rechteck wechselt das Tool automatisch zu Select.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sticker className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Gadget-Icons</p>
                  <p className="text-sm text-muted-foreground">Platziere Operator-Gadgets auf der Karte. In den Seitenpanels zeigt jede Operator-Spalte die verfügbaren Gadgets. Klicke auf ein Gadget und dann auf die Canvas.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Move className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Verschieben</p>
                  <p className="text-sm text-muted-foreground">Klicke und ziehe, um die Karte zu bewegen. Funktioniert auch mit der mittleren Maustaste.</p>
                </div>
              </div>
            </div>

            <Separator />

            <p className="font-medium">Laserpointer</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Crosshair className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Laser Dot</p>
                  <p className="text-sm text-muted-foreground">Zeigt einen leuchtenden Punkt an deiner Cursor-Position, sichtbar für alle im Raum.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Presentation className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Laser Line</p>
                  <p className="text-sm text-muted-foreground">Zeichne temporäre Linien, die nach 3 Sekunden verblassen. Sichtbar für alle im Raum.</p>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">
                Nutze den <strong>Farbwähler</strong> für die Zeichenfarbe und den <strong>Regler</strong> für die Linienstärke.
                Beim Text-Tool erscheint ein <strong>Schriftgrößen-Selector</strong> in der Toolbar (12–64px).
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
                <p className="text-sm text-muted-foreground">Scrolle mit dem Mausrad zum Zoomen, zentriert auf deinen Cursor. Zoombereich: 25% bis 400%.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Move className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Pan</p>
                <p className="text-sm text-muted-foreground">Nutze das Pan-Tool oder halte die mittlere Maustaste gedrückt und ziehe.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ZoomIn className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">Zoom-Controls</p>
                <p className="text-sm text-muted-foreground">Nutze die +/- Buttons unten rechts oder den Reset-Button für 100%.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5" /> Tastenkürzel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Strg + Z', 'Rückgängig'],
                ['Strg + Y', 'Wiederherstellen'],
                ['Strg + Shift + Z', 'Wiederherstellen (Alt.)'],
                ['K', 'Etage hoch'],
                ['J', 'Etage runter'],
                ['Mittlere Maustaste', 'Verschieben (ziehen)'],
                ['Scrollrad', 'Rein-/Rauszoomen'],
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
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Zusammenarbeit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Erstelle einen Raum mit Spiel und Karte. Teile den Einladungslink mit deinen Teammates — sie können über den Link oder den Raum-Code beitreten.</p>
            <p>Alle im Raum sehen die Zeichnungen und Cursor-Positionen der anderen in Echtzeit. Jedem Nutzer wird eine eigene Farbe zugewiesen.</p>
          </CardContent>
        </Card>

        {/* Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Battle Plans teilen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Battle Plans sind standardmäßig privat. Zum Teilen:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Öffne den Plan im Viewer</li>
              <li>Schalte den <strong>Public</strong>-Toggle ein</li>
              <li>Klicke <strong>Teilen</strong>, um den Link zu kopieren</li>
            </ol>
            <p>Öffentliche Pläne erscheinen im Community-Bereich, wo andere sie ansehen, bewerten und kopieren können.</p>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> Zeichnungen exportieren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Exportiere deine Strategie-Zeichnungen mit den Buttons unten rechts auf der Canvas (neben den Zoom-Controls).</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">PNG Export</p>
                  <p>Lädt die aktuelle Etage als PNG-Bild mit allen Zeichnungen auf dem Kartenhintergrund herunter.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileDown className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">PDF Export</p>
                  <p>Lädt alle Etagen als mehrseitiges Landscape-PDF mit Etagennamen als Überschriften herunter.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* In-Room Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> In-Room Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Nutze das Chat-Panel, um Textnachrichten an alle im Raum zu senden. Klicke auf <strong>Chat</strong> unten links zum Öffnen.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nachrichten sind <strong>temporär</strong> — sie verschwinden beim Verlassen des Raums</li>
              <li>Jeder Nutzername wird in der zugewiesenen Raum-Farbe angezeigt</li>
              <li>Ein <strong>Unread-Badge</strong> erscheint bei neuen Nachrichten, wenn das Panel geschlossen ist</li>
            </ul>
          </CardContent>
        </Card>

        {/* Battleplan Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Battleplan Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Organisiere deine Battle Plans mit Tags wie &quot;Rush&quot;, &quot;Default&quot;, &quot;Retake&quot;, &quot;Aggressive&quot;, etc.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Füge Tags beim Erstellen eines Plans hinzu oder bearbeite sie später im Viewer</li>
              <li>Nutze vorgeschlagene Tags oder tippe eigene (bis zu 10 Tags, max 30 Zeichen)</li>
              <li>Öffentliche Pläne können <strong>nach Tag gefiltert</strong> werden</li>
              <li>Tags werden als farbige Badges auf den Plan-Karten angezeigt</li>
            </ul>
          </CardContent>
        </Card>

        {/* Operator Lineup & Side Panels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Operator Lineup &amp; Seitenpanels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Der Editor hat einen <strong>OperatorStrip</strong> oben mit 5 ATK + 5 DEF Operator-Slots. Klicke auf einen Slot, um einen Operator über ein durchsuchbares Popover zuzuweisen.</p>
            <p>Die linken und rechten <strong>Seitenpanels</strong> (Angreifer / Verteidiger) enthalten:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Sichtbarkeits-Toggles</strong> und <strong>Farbwähler</strong> pro Operator-Slot</li>
              <li><strong>Landscape-Bereich</strong> — Zeichnen ohne spezifischen Operator mit eigener Farbe</li>
              <li><strong>Tool-Grid</strong> — 5 Spalten (eine pro Operator) × Zeichenwerkzeuge. Klick aktiviert Tool mit Operator-Farbe.</li>
              <li><strong>Gadget-Reihen</strong> — unter den Tools zeigt jede Spalte operator-spezifische Gadgets (einzigartig, sekundär) plus allgemeine Gadgets</li>
              <li><strong>Operator-Avatare</strong> — untere Reihe mit zugewiesenen Operatoren</li>
            </ul>
            <Separator />
            <p className="font-medium text-foreground">Phasen</p>
            <p>Nutze das <strong>Phasen-Dropdown</strong> in der oberen Leiste zum Erstellen, Umbenennen, Löschen und Wechseln zwischen Strategie-Phasen.</p>
            <Separator />
            <p>Lineup-Änderungen werden in Echtzeit an alle Raum-Teilnehmer synchronisiert.</p>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Account-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Öffne deine Account-Einstellungen über das Benutzermenü oben rechts im Navbar.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Account Info</strong> — Zeigt deinen Discord-Username, -Avatar, Rolle und Team-Zugehörigkeiten</li>
            </ul>
          </CardContent>
        </Card>

        {/* Admin Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Admin Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Admins haben Zugang zum Admin Panel:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Games</strong> — Spiele hinzufügen/bearbeiten mit Name, Slug, Icon und Aktivstatus</li>
              <li><strong>Maps</strong> — Karten pro Spiel mit Thumbnail und Competitive/Active-Toggles</li>
              <li><strong>Floor Layouts</strong> — Etagenlayouts pro Karte verwalten (sortieren, umbenennen, löschen, Bild-Upload)</li>
              <li><strong>Operators &amp; Gadgets</strong> — Operatoren und ihre Gadgets mit Icons verwalten</li>
              <li><strong>Teams</strong> — Teams erstellen, Discord-Rollen zuweisen, individuelle Mitglieder verwalten</li>
              <li><strong>Users</strong> — Alle Nutzer anzeigen, Rollen ändern, Nutzer löschen</li>
              <li><strong>Settings</strong> — Admin-Rollen und Discord-User-IDs konfigurieren</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
