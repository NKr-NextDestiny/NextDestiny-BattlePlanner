import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('legal.about.title')}</h1>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('legal.about.developer.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-lg font-medium">Niklas Kronig</p>
            <p className="text-muted-foreground">{t('legal.about.developer.passion')}</p>
            <p className="text-muted-foreground">{t('legal.about.developer.esports')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('legal.about.project.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{t('legal.about.project.summary')}</p>
            <p className="text-muted-foreground">{t('legal.about.project.origins')}</p>
          </CardContent>
        </Card>

        <Separator />

        <div>
          <h2 className="text-2xl font-bold mb-4">{t('legal.about.basedOn.title')}</h2>
          <p className="text-muted-foreground mb-6">{t('legal.about.basedOn.intro')}</p>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  r6-map-planner
                  <a
                    href="https://github.com/prayansh/r6-map-planner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">prayansh</span>
                </p>
                <p className="text-sm text-muted-foreground">{t('legal.about.basedOn.projects.r6Planner')}</p>
                <a
                  href="https://github.com/prayansh/r6-map-planner"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  github.com/prayansh/r6-map-planner
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  r6-maps
                  <a
                    href="https://github.com/jayfoe/r6-maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  by <span className="font-medium text-foreground">jayfoe</span>
                </p>
                <p className="text-sm text-muted-foreground">{t('legal.about.basedOn.projects.r6Maps')}</p>
                <a
                  href="https://github.com/jayfoe/r6-maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  github.com/jayfoe/r6-maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {t('legal.about.changelog.prefix')}{' '}
              <Link to="/changelog" className="text-primary hover:underline font-medium">{t('legal.about.changelog.link')}</Link>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('legal.about.technology.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{t('legal.about.technology.intro')}</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{t('legal.about.technology.items.frontend')}</li>
              <li>{t('legal.about.technology.items.backend')}</li>
              <li>{t('legal.about.technology.items.realtime')}</li>
              <li>{t('legal.about.technology.items.database')}</li>
              <li>{t('legal.about.technology.items.cache')}</li>
              <li>{t('legal.about.technology.items.ui')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('legal.about.sourceCode')}</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="https://github.com/NKr-NextDestiny/NextDestiny-BattlePlanner"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              github.com/NKr-NextDestiny/NextDestiny-BattlePlanner
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('legal.about.disclaimer.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{t('legal.about.disclaimer.p1')}</p>
            <p>{t('legal.about.disclaimer.p2')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
