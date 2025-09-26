export const Footer = ({ lastUpdate }: { lastUpdate?: Date }) => {
  return (
    <div className="mb-7 -mt-2 w-full flex lg:flex-row flex-col-reverse lg:gap-2 justify-between lg:items-center">
      <div className="size-full flex items-center justify-start prose prose-sm text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <p className="text-start truncate">
            Built by{' '}
            <a
              href="https://x.com/imskyleen"
              rel="noopener noreferrer"
              target="_blank"
            >
              Skyleen
            </a>
            . The source code is available on{' '}
            <a
              href="https://github.com/imskyleen/animate-ui"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-sm text-muted-foreground flex gap-1 items-center text-nowrap">
          Last updated:{' '}
          <span className="text-foreground font-medium px-1.5 py-[3px] bg-accent text-[13px] rounded-sm">
            {lastUpdate?.toLocaleDateString()}
          </span>
        </p>
      )}
    </div>
  );
};
