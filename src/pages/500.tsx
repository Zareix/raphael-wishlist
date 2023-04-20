import { type GetStaticPropsContext } from 'next';
import { useTranslations } from 'next-intl';

import { PageSEO } from '@/components/SEO';

export default function Custom500() {
  const t = useTranslations('500');
  return (
    <>
      <PageSEO title={t('pageTitle')} />
      <main>
        <h1>500 - {t('title')}</h1>
      </main>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      // eslint-disable-next-line
      messages: (await import(`@/messages/${context.locale}.json`)).default,
    },
  };
}
