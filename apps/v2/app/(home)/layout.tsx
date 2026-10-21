import { Hero } from '@/components/home/hero';
import { HomeHeader } from '@/components/home/home-header';
import { IntroProvider } from '@/components/home/intro';
import { getGitHubStars } from '@/lib/github-stars';

export default async function Layout({ children }: LayoutProps<'/'>) {
  const stars = await getGitHubStars();
  return (
    <IntroProvider>
      <HomeHeader stars={stars} />
      <main className="flex flex-1 flex-col">
        <Hero />
        {children}
      </main>
    </IntroProvider>
  );
}
