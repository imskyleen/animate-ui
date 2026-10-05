'use client';

import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/radix/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';

const isDev = process.env.NODE_ENV === 'development';

// The docs versions, as in the v2 docs. In development they point to the
// local servers (v2 on 3300, v1 on 3200); NEXT_PUBLIC_V2_URL and
// NEXT_PUBLIC_V1_URL override them.
const VERSIONS = [
  {
    id: 'v2',
    label: 'v2.0',
    url:
      process.env.NEXT_PUBLIC_V2_URL ??
      (isDev ? 'http://localhost:3300' : 'https://animate-ui.com'),
  },
  {
    id: 'v1',
    label: 'v1.0.27',
    url:
      process.env.NEXT_PUBLIC_V1_URL ??
      (isDev ? 'http://localhost:3200' : 'https://v1.animate-ui.com'),
  },
];

const CURRENT = 'v1';

export const VersionMenu = ({ className }: { className?: string }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-6 items-center gap-1 rounded-md bg-accent px-2 text-xs font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:text-foreground outline-none',
          className,
        )}
      >
        {VERSIONS.find((version) => version.id === CURRENT)?.label}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {VERSIONS.map((version) => (
          <DropdownMenuItem
            key={version.id}
            onSelect={() => {
              window.location.href = version.url;
            }}
            className="justify-between"
          >
            {version.label}
            {version.id === CURRENT && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
