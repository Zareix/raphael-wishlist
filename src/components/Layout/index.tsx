import { Archive, Home, Plus, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import LoginPage from '@/components/Layout/Login';
import { Button } from '@/components/ui/button';
import { LoadingFullPage } from '@/components/ui/loading';
import { Separator } from '@/components/ui/separator';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('Layout');
  const { data, status } = useSession();

  if (status === 'loading') {
    return <LoadingFullPage />;
  }

  if (!data?.user) {
    return <LoginPage />;
  }

  return (
    <>
      <div className="container mx-auto lg:ml-[18vw] lg:max-w-4xl xl:max-w-5xl">
        {children}
      </div>
      {data?.user && (
        <>
          <nav className="fixed inset-y-4 left-2 right-auto hidden w-[15vw] flex-col border-r pl-2 lg:flex">
            <Link href="/">
              <Button variant="link">
                <Home className="mr-2" />
                {t('nav.home')}
              </Button>
            </Link>
            <Link href="/add">
              <Button variant="link">
                <Plus className="mr-2" />
                {t('nav.add')}
              </Button>
            </Link>
            <Link href="/archive">
              <Button variant="link">
                <Archive className="mr-2" />
                {t('nav.archive')}
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="link">
                <Settings className="mr-2" />
                {t('nav.settings')}
              </Button>
            </Link>
          </nav>
          <nav className="fixed inset-x-4 bottom-4 mx-auto flex max-w-sm items-center justify-center space-x-4 rounded-2xl bg-card py-2 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-950 lg:hidden">
            <Link href="/">
              <Button variant="link">
                <Home />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Link href="/add">
              <Button variant="link">
                <Plus />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Link href="/archive">
              <Button variant="link">
                <Archive />
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <Link href="/settings">
              <Button variant="link">
                <Settings />
              </Button>
            </Link>
          </nav>
        </>
      )}
    </>
  );
};

export default Layout;