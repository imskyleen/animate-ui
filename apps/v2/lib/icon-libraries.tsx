import type { ComponentProps, ReactNode } from 'react';

/** Lucide's logo: two interlocking curves. */
export function LucideLogo(props: ComponentProps<'svg'>) {
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
        stroke="#F56565"
      />
    </svg>
  );
}

/** The logo shown before each icon library's name, by docs URL. */
export const ICON_LIBRARY_LOGOS: Record<string, ReactNode> = {
  '/docs/icons/lucide-icons': <LucideLogo className="size-4 shrink-0" />,
};
