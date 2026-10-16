import { HomeHeader } from '@/components/home/home-header';
import { IntroProvider } from '@/components/home/intro';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <IntroProvider>
      <HomeHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </IntroProvider>
  );
}
