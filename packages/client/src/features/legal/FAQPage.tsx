import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const faqs = [
  {
    q: 'Was ist NextDestiny BattlePlanner?',
    a: 'NextDestiny BattlePlanner ist ein kollaboratives Strategieplanungs-Tool für Rainbow Six Siege. Es ermöglicht Teams, Taktiken auf Karten zu zeichnen, Battle Plans zu speichern und Strategien in Echtzeit zu koordinieren.',
  },
  {
    q: 'Wie melde ich mich an?',
    a: 'Klicke auf "Mit Discord anmelden" auf der Startseite. Du wirst zu Discord weitergeleitet, um die Anmeldung zu bestätigen. Danach wirst du automatisch eingeloggt und kannst dein Team auswählen.',
  },
  {
    q: 'Wie funktionieren Teams?',
    a: 'Nach dem Login wählst du dein Team aus. Teams basieren auf Discord-Rollen oder individuellen Zuweisungen durch einen Admin. Alle Inhalte (Battle Plans, Räume) sind team-isoliert — du siehst nur die Inhalte deines aktuellen Teams.',
  },
  {
    q: 'Kann ich zwischen Teams wechseln?',
    a: 'Ja. Wenn du mehreren Teams zugewiesen bist, erscheint ein Team-Switcher im Navbar. Klicke darauf, um zwischen deinen Teams zu wechseln.',
  },
  {
    q: 'Wie zeichne ich auf der Karte?',
    a: 'Wähle ein Zeichenwerkzeug aus der Toolbar (Stift, Linie, Rechteck oder Text), wähle Farbe und Linienstärke, dann klicke und ziehe auf der Canvas. Mit dem Radierer-Tool kannst du deine eigenen Zeichnungen entfernen.',
  },
  {
    q: 'Wie zoome und verschiebe ich die Karte?',
    a: 'Scrolle mit dem Mausrad zum Zoomen. Nutze das Pan-Tool oder halte die mittlere Maustaste gedrückt und ziehe, um die Karte zu verschieben. Die +/- Buttons unten rechts steuern ebenfalls den Zoom.',
  },
  {
    q: 'Kann ich Zeichnungen rückgängig machen?',
    a: 'Ja. Drücke Strg+Z zum Rückgängigmachen und Strg+Y (oder Strg+Shift+Z) zum Wiederherstellen. Undo/Redo funktioniert für Zeichnen, Verschieben und Größenänderungen.',
  },
  {
    q: 'Wie benutze ich den Laserpointer?',
    a: 'Wähle das Laser-Dot-Tool (Fadenkreuz) für einen leuchtenden Punkt an deinem Cursor, sichtbar für alle im Raum. Das Laser-Linien-Tool zeichnet temporäre Linien, die nach 3 Sekunden verblassen. Laserpointer werden nicht gespeichert.',
  },
  {
    q: 'Wie platziere ich Operator-Gadgets auf der Karte?',
    a: 'In den Seitenpanels (ATK/DEF) zeigt jede Operator-Spalte die verfügbaren Gadgets unterhalb der Zeichenwerkzeuge. Klicke auf ein Gadget, um es auszuwählen, dann klicke auf die Canvas zum Platzieren. Allgemeine Gadgets (Drohne, Barrikade, etc.) sind für alle Slots verfügbar.',
  },
  {
    q: 'Wie funktionieren Räume?',
    a: 'Erstelle einen Raum mit Spiel und Karte. Teile den Raum-Link mit deinen Teammates. Alle im Raum können zusammen in Echtzeit zeichnen und die Cursor der anderen sehen.',
  },
  {
    q: 'Wie teile ich einen Battle Plan?',
    a: 'Öffne deinen Plan, schalte den Public-Toggle ein und klicke auf Teilen, um den Link zu kopieren. Öffentliche Pläne erscheinen im Community-Bereich, wo andere sie ansehen, bewerten und kopieren können.',
  },
  {
    q: 'Was sind Phasen?',
    a: 'Phasen ermöglichen es, eine Strategie in Schritte zu unterteilen (z.B. "Aktionsphase", "Retake"). Nutze das Phasen-Dropdown in der oberen Leiste zum Erstellen, Umbenennen, Löschen und Wechseln. Jede Phase hat eigene Zeichnungen.',
  },
  {
    q: 'Kann ich Zeichnungen verschieben, skalieren oder drehen?',
    a: 'Ja. Wähle das Select-Tool, klicke auf eine eigene Zeichnung. Du siehst 8 Resize-Handles und einen Dreh-Handle. Ziehe zum Verschieben, nutze die Handles zum Skalieren oder Drehen. Nach Linie/Rechteck wechselt das Tool automatisch zu Select.',
  },
  {
    q: 'Warum kann ich die Zeichnung eines anderen nicht löschen?',
    a: 'Radierer und Select funktionieren nur auf eigenen Zeichnungen. Zeichnungen anderer Nutzer erscheinen leicht abgedunkelt, um versehentliches Löschen zu verhindern.',
  },
  {
    q: 'Wie funktioniert der In-Room Chat?',
    a: 'Klicke auf "Chat" unten links im Raum. Nachrichten sind für alle im Raum sichtbar. Chat ist temporär — Nachrichten verschwinden beim Verlassen des Raums.',
  },
  {
    q: 'Wie exportiere ich Zeichnungen?',
    a: 'Nutze die Export-Buttons unten rechts auf der Canvas. Kamera-Icon für PNG (aktuelle Etage), Datei-Icon für PDF (alle Etagen als mehrseitiges Dokument).',
  },
  {
    q: 'Was ist das Operator Lineup?',
    a: 'Der OperatorStrip oben zeigt 5 ATK + 5 DEF Slots. Klicke auf einen Slot, um einen Operator über ein Suchfeld zuzuweisen. Die Seitenpanels zeigen pro Operator die verfügbaren Gadgets und Werkzeuge.',
  },
  {
    q: 'Was ist der Landscape-Bereich?',
    a: 'Der grün getönte Landscape-Bereich in den Seitenpanels ermöglicht Zeichnen ohne Operator-Zuordnung. Hat eigenen Farbwähler und Basis-Tools — nützlich für allgemeine Karten-Annotationen.',
  },
  {
    q: 'Wie melde ich einen Bug?',
    a: 'Erstelle ein Issue im GitHub-Repository unter github.com/NKr-NextDestiny/NextDestiny-BattlePlanner.',
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">FAQ</h1>
      <p className="text-muted-foreground mb-8">Häufig gestellte Fragen zum NextDestiny BattlePlanner.</p>

      <div className="space-y-4">
        {faqs.map(({ q, a }, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
