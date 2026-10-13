import type { ComponentProps, ReactNode } from 'react';

export function LucideLogo({
  monochrome = false,
  ...props
}: ComponentProps<'svg'> & {
  monochrome?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M14 12a4 4 0 0 0-4-4 4 4 0 0 0-4 4 8 8 0 0 0 8 8 8 8 0 0 0 8-8 11.96 11.96 0 0 0-4-8.94"
        stroke="currentColor"
      />
      <path
        d="M10 12a4 4 0 0 0 4 4 4 4 0 0 0 4-4 8 8 0 0 0-8-8 8 8 0 0 0-8 8c0 3.58 1.57 6.8 4.06 9"
        stroke={monochrome ? 'currentColor' : '#F56565'}
      />
    </svg>
  );
}

export function HugeiconsLogo(props: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2 9.5H22" />
      <path d="M20.5 9.5H3.5L4.23353 15.3682C4.59849 18.2879 4.78097 19.7477 5.77343 20.6239C6.76589 21.5 8.23708 21.5 11.1795 21.5H12.8205C15.7629 21.5 17.2341 21.5 18.2266 20.6239C19.219 19.7477 19.4015 18.2879 19.7665 15.3682L20.5 9.5Z" />
      <path d="M5 9C5 5.41015 8.13401 2.5 12 2.5C15.866 2.5 19 5.41015 19 9" />
    </svg>
  );
}

export const ICON_LIBRARY_LOGOS: Record<string, ReactNode> = {
  '/docs/icons/lucide-icons': (
    <LucideLogo monochrome className="size-4 shrink-0 text-muted-foreground" />
  ),
  '/docs/icons/hugeicons': (
    <HugeiconsLogo className="size-4 shrink-0 text-muted-foreground" />
  ),
};
