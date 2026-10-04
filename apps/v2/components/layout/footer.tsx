/** The end of every docs page, as in v1: credits and the last update. */
export function Footer({ lastUpdate }: { lastUpdate?: Date }) {
  return (
    <footer className="mt-16 mb-7 flex w-full flex-col-reverse justify-between gap-2 text-sm text-muted-foreground lg:flex-row lg:items-center">
      <p className="truncate">
        Built by{' '}
        <a
          href="https://x.com/imskyleen"
          rel="noopener noreferrer"
          target="_blank"
          className="font-medium text-foreground underline decoration-2 underline-offset-4"
        >
          Skyleen
        </a>
        . The source code is available on{' '}
        <a
          href="https://github.com/imskyleen/animate-ui"
          rel="noopener noreferrer"
          target="_blank"
          className="font-medium text-foreground underline decoration-2 underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>
      {lastUpdate && (
        <p className="flex items-center gap-1 text-nowrap">
          Last updated:{' '}
          <span className="rounded-sm bg-accent px-1.5 py-[3px] text-[13px] font-medium text-foreground">
            {lastUpdate.toLocaleDateString('en-US')}
          </span>
        </p>
      )}
    </footer>
  );
}
