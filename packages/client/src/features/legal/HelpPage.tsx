import { useTranslation } from 'react-i18next';
import { Camera, Crosshair, Eraser, FileDown, Keyboard, MessageSquare, Minus, Mouse, MousePointer2, Move, Pencil, Presentation, Settings, Share2, Shield, Square, Sticker, Tag, Type, UserCheck, Users, ZoomIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function HelpPage() {
  const { t } = useTranslation();
  const drawTools = [
    { icon: Pencil, title: t('legal.help.tools.items.pen.title'), body: t('legal.help.tools.items.pen.body') },
    { icon: Minus, title: t('legal.help.tools.items.line.title'), body: t('legal.help.tools.items.line.body') },
    { icon: Square, title: t('legal.help.tools.items.rectangle.title'), body: t('legal.help.tools.items.rectangle.body') },
    { icon: Type, title: t('legal.help.tools.items.text.title'), body: t('legal.help.tools.items.text.body') },
    { icon: Eraser, title: t('legal.help.tools.items.eraser.title'), body: t('legal.help.tools.items.eraser.body') },
    { icon: MousePointer2, title: t('legal.help.tools.items.select.title'), body: t('legal.help.tools.items.select.body') },
    { icon: Sticker, title: t('legal.help.tools.items.gadgets.title'), body: t('legal.help.tools.items.gadgets.body') },
    { icon: Move, title: t('legal.help.tools.items.pan.title'), body: t('legal.help.tools.items.pan.body') },
  ];
  const shortcuts = [
    ['Ctrl + Z', t('legal.help.shortcuts.items.undo')],
    ['Ctrl + Y', t('legal.help.shortcuts.items.redo')],
    ['Ctrl + Shift + Z', t('legal.help.shortcuts.items.redoAlt')],
    ['K', t('legal.help.shortcuts.items.floorUp')],
    ['J', t('legal.help.shortcuts.items.floorDown')],
    [t('legal.help.shortcuts.middleMouse'), t('legal.help.shortcuts.items.pan')],
    [t('legal.help.shortcuts.scrollWheel'), t('legal.help.shortcuts.items.zoom')],
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{t('legal.help.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('legal.help.intro')}</p>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pencil className="h-5 w-5" /> {t('legal.help.tools.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {drawTools.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <p className="font-medium">{t('legal.help.laser.title')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Crosshair className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{t('legal.help.laser.dotTitle')}</p>
                  <p className="text-sm text-muted-foreground">{t('legal.help.laser.dotBody')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Presentation className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{t('legal.help.laser.lineTitle')}</p>
                  <p className="text-sm text-muted-foreground">{t('legal.help.laser.lineBody')}</p>
                </div>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">{t('legal.help.tools.footer')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ZoomIn className="h-5 w-5" /> {t('legal.help.navigation.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Mouse className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">{t('legal.help.navigation.zoomTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('legal.help.navigation.zoomBody')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Move className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">{t('legal.help.navigation.panTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('legal.help.navigation.panBody')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ZoomIn className="h-5 w-5 mt-0.5 text-primary shrink-0" />
              <div>
                <p className="font-medium">{t('legal.help.navigation.controlsTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('legal.help.navigation.controlsBody')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Keyboard className="h-5 w-5" /> {t('legal.help.shortcuts.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {shortcuts.map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5 px-2 rounded bg-muted/50">
                  <kbd className="text-xs font-mono bg-background px-2 py-0.5 rounded border">{key}</kbd>
                  <span className="text-sm text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> {t('legal.help.collaboration.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.collaboration.p1')}</p>
            <p>{t('legal.help.collaboration.p2')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> {t('legal.help.sharing.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.sharing.intro')}</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>{t('legal.help.sharing.steps.open')}</li>
              <li>{t('legal.help.sharing.steps.public')}</li>
              <li>{t('legal.help.sharing.steps.share')}</li>
            </ol>
            <p>{t('legal.help.sharing.outro')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5" /> {t('legal.help.export.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.export.intro')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Camera className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{t('legal.help.export.pngTitle')}</p>
                  <p>{t('legal.help.export.pngBody')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileDown className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{t('legal.help.export.pdfTitle')}</p>
                  <p>{t('legal.help.export.pdfBody')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> {t('legal.help.chat.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.chat.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('legal.help.chat.items.ephemeral')}</li>
              <li>{t('legal.help.chat.items.color')}</li>
              <li>{t('legal.help.chat.items.unread')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> {t('legal.help.tags.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.tags.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('legal.help.tags.items.create')}</li>
              <li>{t('legal.help.tags.items.custom')}</li>
              <li>{t('legal.help.tags.items.filter')}</li>
              <li>{t('legal.help.tags.items.badges')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> {t('legal.help.lineup.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.lineup.intro')}</p>
            <p>{t('legal.help.lineup.panels')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('legal.help.lineup.items.visibility')}</li>
              <li>{t('legal.help.lineup.items.landscape')}</li>
              <li>{t('legal.help.lineup.items.toolGrid')}</li>
              <li>{t('legal.help.lineup.items.gadgets')}</li>
              <li>{t('legal.help.lineup.items.avatars')}</li>
            </ul>
            <Separator />
            <p>{t('legal.help.lineup.config')}</p>
            <p>{t('legal.help.lineup.variants')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> {t('legal.help.account.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.account.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('legal.help.account.info')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t('legal.help.admin.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.admin.intro')}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t('legal.help.admin.items.games')}</li>
              <li>{t('legal.help.admin.items.maps')}</li>
              <li>{t('legal.help.admin.items.floors')}</li>
              <li>{t('legal.help.admin.items.operators')}</li>
              <li>{t('legal.help.admin.items.teams')}</li>
              <li>{t('legal.help.admin.items.users')}</li>
              <li>{t('legal.help.admin.items.settings')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t('legal.help.security.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{t('legal.help.security.p1')}</p>
            <p>{t('legal.help.security.p2')}</p>
            <p>{t('legal.help.security.p3')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> {t('legal.help.tips.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>{t('legal.help.tips.items.phases')}</p>
            <p>{t('legal.help.tips.items.docs')}</p>
            <p>{t('legal.help.tips.items.laser')}</p>
            <p>{t('legal.help.tips.items.export')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
