import { TabsContent } from '@radix-ui/react-tabs';
import { EyeOffIcon } from 'lucide-react';
import { type GetStaticPropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import CategoryContent from '@/components/CategoryContent';
import { PageSEO } from '@/components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loading } from '@/components/ui/loading';
import { ScrollAreaHorizontal } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/utils/api';

const HomePage = () => {
  const t = useTranslations('Index');
  const [userId, setUserId] = useState<string>();
  const session = useSession();
  const {
    data: categories,
    isLoading,
    isSuccess,
  } = api.categories.getAll.useQuery({
    userId,
  });
  const categoriesNonEmpty = useMemo(
    () =>
      categories?.filter(
        (x) =>
          x._count.wishlistItems > 0 ||
          x.subCategories?.some((y) => y._count.wishlistItems > 0),
      ) ?? [],
    [categories],
  );

  return (
    <>
      <PageSEO title={t('pageTitle')} />
      <main>
        <div className="flex">
          <h1>{t('title')}</h1>
          {session.data?.user.hasAccessTo &&
            session.data.user.hasAccessTo.length > 0 && (
              <span className="ml-auto">
                <Select
                  defaultValue={session.data?.user.id}
                  onValueChange={(value) => {
                    if (value === session.data?.user.id) {
                      setUserId(undefined);
                      return;
                    }
                    setUserId(value);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={session.data.user.id ?? ''}>
                      {t('myWishlist')}
                    </SelectItem>
                    {session.data.user.hasAccessTo.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name ?? user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </span>
            )}
        </div>
        {isLoading ? (
          <Loading />
        ) : !isSuccess ? (
          <>Error</>
        ) : (
          categories.length > 0 && (
            <Tabs defaultValue={categoriesNonEmpty[0]?.id} className="mt-4">
              <ScrollAreaHorizontal>
                <TabsList>
                  {categoriesNonEmpty.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex gap-1"
                    >
                      {category.name}
                      {!category.public && <EyeOffIcon size={14} />}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollAreaHorizontal>
              {categoriesNonEmpty.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  {
                    <>
                      <CategoryContent
                        categoryId={category.id}
                        userId={userId}
                      />
                      {category.subCategories.length > 0 && (
                        <Accordion type="multiple" className="mt-4">
                          {category.subCategories
                            .filter((x) => x._count.wishlistItems > 0)
                            .map((subCategory) => (
                              <AccordionItem
                                key={subCategory.id}
                                value={subCategory.id}
                              >
                                <AccordionTrigger>
                                  <div className="flex items-center gap-2">
                                    {subCategory.name}
                                    {!subCategory.public && (
                                      <EyeOffIcon size={18} />
                                    )}
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <CategoryContent
                                    categoryId={subCategory.id}
                                    userId={userId}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                        </Accordion>
                      )}
                    </>
                  }
                </TabsContent>
              ))}
            </Tabs>
          )
        )}
      </main>
    </>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      // eslint-disable-next-line
      messages: (await import(`@/messages/${context.locale}.json`)).default,
    },
  };
}

export default HomePage;
