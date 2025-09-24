import packageJson from '../../../../../package.json' with { type: 'json' };

export const Footer = () => {
  return (
    <div className="h-14">
      <div className="absolute z-10 bottom-0 left-0 right-0 sm:h-[54px] border-t max-sm:py-1.5">
        <div className="size-full px-4 md:px-6 flex sm:flex-row flex-col-reverse items-center justify-between prose prose-sm text-sm text-muted-foreground">
          <div className="flex items-center gap-2 max-sm:pb-4 max-sm:-mt-1">
            <span className="text-sm text-muted-foreground leading-none sm:block md:hidden lg:block">
              Lastest version:
            </span>
            <a
              href="/docs/changelog"
              className="text-foreground px-1.5 py-0.5 text-xs rounded-sm bg-muted border no-underline"
            >
              {packageJson.version}
            </a>
          </div>

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
      </div>
    </div>
  );
};
