import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQPage() {
  const { t } = useTranslation();
  const faqItems = Array.from({ length: 19 }, (_, index) => ({
    q: t(`legal.faq.items.${index}.q`),
    a: t(`legal.faq.items.${index}.a`),
  }));

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">{t('legal.faq.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('legal.faq.intro')}</p>

      <div className="space-y-4">
        {faqItems.map(({ q, a }, i) => (
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
