import { cn } from 'cn';

export function Changelog(props: React.ComponentProps<'div'>) {
  return <div className="mt-4 flex flex-col" {...props} />;
}

const formatDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function ChangelogItem({
  major = false,
  date,
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & { date: string; major?: boolean }) {
  return (
    <div
      data-slot="changelog-item"
      data-major={major || undefined}
      className={cn('group flex flex-col gap-x-6 sm:flex-row', className)}
      {...props}
    >
      <div className="relative h-auto w-28 shrink-0 max-sm:mb-2">
        <time
          dateTime={date}
          className="top-24 left-0 text-sm text-muted-foreground sm:sticky"
        >
          {formatDate.format(new Date(date))}
        </time>
      </div>
      <div className="relative hidden h-auto w-2.5 shrink-0 flex-col items-center pt-[5px] sm:flex">
        <div className="relative size-2.5 shrink-0 rounded-full bg-border group-data-major:bg-primary">
          <div className="absolute top-1/2 left-1/2 hidden size-4.5 -translate-1/2 rounded-full border border-primary group-data-major:block" />
        </div>
        <div className="absolute top-[18px] -bottom-[2px] left-1/2 w-px -translate-x-1/2 rounded-full bg-border group-data-major:bg-primary" />
      </div>
      <div className="h-auto min-w-0 flex-1 pb-20">{children}</div>
    </div>
  );
}

export function ChangelogItemVersion(props: React.ComponentProps<'div'>) {
  return <div className="-mt-[3px] [&>h2]:mt-0 [&>h2]:mb-6" {...props} />;
}

export function ChangelogItemTitle(props: React.ComponentProps<'h3'>) {
  return <h3 className="mt-0 mb-2.5 text-lg font-semibold" {...props} />;
}

export function ChangelogItemDescription(props: React.ComponentProps<'div'>) {
  return (
    <div
      className="mt-0 mb-8 text-sm text-muted-foreground last:mb-0"
      {...props}
    />
  );
}
