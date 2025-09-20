'use client';

import { getStrictContext } from '@/registry/lib/get-strict-context';
import { cn } from '@workspace/ui/lib/utils';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

type ChangelogItemContextType = {
  major: boolean;
};

const [ChangelogItemProvider, useChangelogItem] =
  getStrictContext<ChangelogItemContextType>('ChangelogItemContext');

type ChangelogProps = React.ComponentProps<'div'>;

export function Changelog(props: ChangelogProps) {
  return <div className="flex flex-col mt-4" {...props} />;
}

type ChangelogItemProps = React.ComponentProps<'div'> & {
  date: string;
  major: boolean;
};

export const ChangelogItem = ({
  major = false,
  children,
  date,
  ...props
}: ChangelogItemProps) => {
  return (
    <ChangelogItemProvider value={{ major }}>
      <div className="flex flex-row gap-x-6" {...props}>
        <div className="relative w-28 shrink-0 h-auto">
          <p className="mt-0 top-6 left-0 sticky text-sm dark:text-neutral-600 text-neutral-400">
            {format(new Date(date), 'MMM d, yyyy', { locale: enUS })}
          </p>
        </div>
        <div className="relative w-2.5 shrink-0 h-auto pt-[5px] flex flex-col items-center">
          <div
            className={cn(
              'relative size-2.5 shrink-0 rounded-full',
              major ? 'bg-primary' : 'dark:bg-neutral-700 bg-neutral-300',
            )}
          >
            {major && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4.5 shrink-0 rounded-full border border-primary" />
            )}
          </div>
          <div
            className={cn(
              'absolute w-px rounded-full top-[18px] left-1/2 -translate-x-1/2 -bottom-[2px]',
              major ? 'bg-primary' : 'dark:bg-neutral-700 bg-neutral-300',
            )}
          />
        </div>
        <div className="flex-1 h-auto pb-24">{children}</div>
      </div>
    </ChangelogItemProvider>
  );
};

type ChangelogItemVersionProps = React.ComponentProps<'div'>;

export const ChangelogItemVersion = ({
  children,
  ...props
}: ChangelogItemVersionProps) => {
  const { major } = useChangelogItem();

  return (
    <div
      className={cn(
        '-mt-[3px] [&>h2]:mt-0 [&>h2]:mb-6 [&>h2]:w-fit [&_a]:font-normal [&_a]:text-sm [&_a]:text-foreground [&_a]:bg-accent [&_a]:rounded-md [&_a]:px-1.5 [&_a]:py-0.5 [&_a]:border',
        major &&
          '[&_a]:bg-primary [&_a]:text-primary-foreground [&_a]:border-neutral-600 dark:[&_a]:border-neutral-300',
      )}
      {...props}
    >
      {children}
    </div>
  );
};

type ChangelogItemTitleProps = React.ComponentProps<'h3'>;

export const ChangelogItemTitle = ({
  children,
  ...props
}: ChangelogItemTitleProps) => {
  return (
    <h3 className="mt-0 mb-2.5 text-lg font-semibold" {...props}>
      {children}
    </h3>
  );
};

type ChangelogItemDescriptionProps = React.ComponentProps<'div'>;

export const ChangelogItemDescription = ({
  children,
  ...props
}: ChangelogItemDescriptionProps) => {
  return (
    <div className="mt-0 text-sm text-muted-foreground" {...props}>
      {children}
    </div>
  );
};
