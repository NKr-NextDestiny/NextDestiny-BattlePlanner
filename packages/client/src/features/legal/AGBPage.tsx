import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: '§ 1 Geltungsbereich',
    paragraphs: [
      '(1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für die Nutzung der Webanwendung TactiHub (nachfolgend „Dienst"), bereitgestellt von Niklas Kronig (nachfolgend „Betreiber").',
      '(2) Mit der Registrierung oder Nutzung des Dienstes erklärt sich der Nutzer mit diesen AGB einverstanden.',
      '(3) Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Betreiber stimmt ihrer Geltung ausdrücklich schriftlich zu.',
    ],
  },
  {
    title: '§ 2 Nutzungsbedingungen',
    paragraphs: [
      '(1) TactiHub ist ein kostenloses, quelloffenes Werkzeug zur kollaborativen Strategieplanung für kompetitive Spiele.',
      '(2) Die Nutzung des Dienstes ist ausschließlich zu legalen Zwecken gestattet. Der Nutzer verpflichtet sich, den Dienst nicht missbräuchlich zu verwenden.',
      '(3) Der Betreiber behält sich das Recht vor, Nutzerkonten bei Verstoß gegen diese AGB ohne Vorankündigung zu sperren oder zu löschen.',
    ],
  },
  {
    title: '§ 3 Registrierung & Benutzerkonto',
    paragraphs: [
      '(1) Bestimmte Funktionen des Dienstes erfordern eine Registrierung mit Benutzername, E-Mail-Adresse und Passwort.',
      '(2) Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen und seine Zugangsdaten vertraulich zu behandeln.',
      '(3) Der Nutzer ist für alle Aktivitäten unter seinem Konto verantwortlich.',
      '(4) Der Nutzer kann sein Konto jederzeit über die Kontoeinstellungen löschen lassen. Nach Bestätigung per E-Mail wird das Konto deaktiviert und nach einer Frist von 30 Tagen endgültig gelöscht.',
    ],
  },
  {
    title: '§ 4 Inhalte & Verantwortlichkeit',
    paragraphs: [
      '(1) Der Nutzer ist für alle von ihm erstellten Inhalte (Battleplans, Zeichnungen, Texte, Chat-Nachrichten) selbst verantwortlich.',
      '(2) Es ist untersagt, rechtswidrige, beleidigende, diskriminierende oder anderweitig unangemessene Inhalte zu erstellen oder zu verbreiten.',
      '(3) Der Betreiber behält sich das Recht vor, Inhalte ohne Angabe von Gründen zu entfernen.',
    ],
  },
  {
    title: '§ 5 Verfügbarkeit',
    paragraphs: [
      '(1) Der Betreiber bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit des Dienstes. Ein Anspruch auf ständige Verfügbarkeit besteht jedoch nicht.',
      '(2) Der Betreiber behält sich das Recht vor, den Dienst jederzeit ganz oder teilweise einzustellen, zu ändern oder zu erweitern.',
      '(3) Wartungsarbeiten oder technische Störungen können zu vorübergehenden Einschränkungen der Verfügbarkeit führen.',
    ],
  },
  {
    title: '§ 6 Haftungsbeschränkung',
    paragraphs: [
      '(1) Der Dienst wird „wie besehen" (as-is) bereitgestellt. Der Betreiber übernimmt keine Garantie für die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Funktionen.',
      '(2) Der Betreiber haftet nur für Schäden, die auf vorsätzlichem oder grob fahrlässigem Verhalten beruhen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, soweit keine wesentlichen Vertragspflichten betroffen sind.',
      '(3) Der Betreiber haftet nicht für den Verlust von Nutzerdaten, insbesondere Battleplans, Zeichnungen oder Kontoeinstellungen.',
    ],
  },
  {
    title: '§ 7 Datenschutz',
    paragraphs: [
      '(1) Der Betreiber erhebt und verarbeitet personenbezogene Daten nur im Rahmen der geltenden Datenschutzgesetze, insbesondere der DSGVO.',
      '(2) Zur Nutzung des Dienstes werden Benutzername, E-Mail-Adresse und ein gehashtes Passwort gespeichert. Weitere personenbezogene Daten werden nicht erhoben.',
      '(3) Zugriffstoken und Sitzungsdaten werden temporär in Redis gespeichert und nach Ablauf automatisch gelöscht.',
      '(4) Der Nutzer hat das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung seiner personenbezogenen Daten. Anfragen können per E-Mail an den Betreiber gerichtet werden.',
    ],
  },
  {
    title: '§ 8 Urheberrecht & geistiges Eigentum',
    paragraphs: [
      '(1) Der Quellcode von TactiHub ist unter der MIT-Lizenz veröffentlicht und frei verfügbar.',
      '(2) Spielnamen, Logos, Kartenbilder und Operator-Icons sind Eigentum der jeweiligen Spielehersteller (Ubisoft u.a.) und werden ausschließlich zu informativen und Bildungszwecken verwendet.',
      '(3) Vom Nutzer erstellte Inhalte verbleiben im Eigentum des jeweiligen Nutzers.',
    ],
  },
  {
    title: '§ 9 Änderungen der AGB',
    paragraphs: [
      '(1) Der Betreiber behält sich das Recht vor, diese AGB jederzeit zu ändern.',
      '(2) Änderungen werden auf der Website veröffentlicht. Bei wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert.',
      '(3) Die fortgesetzte Nutzung des Dienstes nach Änderung der AGB gilt als Zustimmung zu den geänderten Bedingungen.',
    ],
  },
  {
    title: '§ 10 Schlussbestimmungen',
    paragraphs: [
      '(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
      '(2) Gerichtsstand ist, soweit gesetzlich zulässig, der Wohnsitz des Betreibers.',
      '(3) Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder nach Vertragsschluss unwirksam oder undurchführbar werden, bleibt davon die Wirksamkeit der AGB im Übrigen unberührt (Salvatorische Klausel).',
      '(4) An die Stelle der unwirksamen oder undurchführbaren Bestimmung soll diejenige wirksame und durchführbare Regelung treten, deren Wirkungen der wirtschaftlichen Zielsetzung am nächsten kommen.',
    ],
  },
];

export default function AGBPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Legal</p>
        <h1 className="text-3xl font-bold mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p className="text-muted-foreground text-sm">Stand: Februar 2026</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{p}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
