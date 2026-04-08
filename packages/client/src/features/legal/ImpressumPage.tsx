import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function ImpressumPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Legal</p>
        <h1 className="text-3xl font-bold">Impressum</h1>
      </div>

      <div className="space-y-6">
        {/* § 5 TMG */}
        <Card>
          <CardHeader>
            <CardTitle>Angaben gemäß § 5 TMG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-medium">Niklas Kronig</p>
            <p className="text-muted-foreground">Musterstraße 1</p>
            <p className="text-muted-foreground">12345 Musterstadt</p>
            <p className="text-muted-foreground">Deutschland</p>
          </CardContent>
        </Card>

        {/* Kontakt */}
        <Card>
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="text-muted-foreground">E-Mail: </span>
              <a href="mailto:kontakt@tactihub.de" className="text-primary hover:underline">
                kontakt@tactihub.de
              </a>
            </p>
            <p>
              <span className="text-muted-foreground">GitHub: </span>
              <a href="https://github.com/niklask52t/TactiHub" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                github.com/niklask52t/TactiHub
              </a>
            </p>
            <p>
              <span className="text-muted-foreground">Website: </span>
              <a href="https://tactihub.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                tactihub.de
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Haftungsausschluss */}
        <Card>
          <CardHeader>
            <CardTitle>Haftungsausschluss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Haftung für Inhalte (§ 7 TMG)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Haftung für Links (§ 8 TMG)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Urheberrecht */}
        <Card>
          <CardHeader>
            <CardTitle>Urheberrecht</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Der Quellcode von TactiHub ist unter der{' '}
              <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                MIT-Lizenz
              </a>{' '}
              veröffentlicht.
            </p>
          </CardContent>
        </Card>

        {/* Weitere rechtliche Informationen */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Unsere allgemeinen Geschäftsbedingungen finden Sie auf der{' '}
              <Link to="/agb" className="text-primary hover:underline font-medium">AGB-Seite</Link>.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card>
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              TactiHub is a fan-made tool and is not affiliated with, endorsed by, or connected to Ubisoft or any other game publisher. All game names, logos, and related assets are trademarks of their respective owners.
            </p>
            <p>
              Some images used on this website are screenshots from the game Tom Clancy&apos;s Rainbow Six Siege, developed and published by Ubisoft.
              Map images and operator icons used in this application are property of their respective game publishers and are used for informational and educational purposes only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
