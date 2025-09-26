'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { cn } from '@workspace/ui/lib/utils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  type TabsProps,
} from '@/registry/primitives/animate/tabs';
import { CopyButton } from '@/registry/components/buttons/copy';

type CodeTabsProps = {
  codes: Record<string, string>;
  lang?: string;
  themes?: { light: string; dark: string };
  copyButton?: boolean;
  onCopiedChange?: (copied: boolean, content?: string) => void;
} & Omit<TabsProps, 'children'>;

function CodeTabs({
  codes,
  lang = 'bash',
  themes = {
    light: 'github-light',
    dark: 'github-dark',
  },
  className,
  defaultValue,
  value,
  onValueChange,
  copyButton = true,
  onCopiedChange,
  ...props
}: CodeTabsProps) {
  const { resolvedTheme } = useTheme();

  const [highlightedCodes, setHighlightedCodes] = React.useState<Record<
    string,
    string
  > | null>(null);
  const [selectedCode, setSelectedCode] = React.useState<string>(
    value ?? defaultValue ?? Object.keys(codes)[0] ?? '',
  );

  React.useEffect(() => {
    async function loadHighlightedCode() {
      try {
        const { codeToHtml } = await import('shiki');
        const newHighlightedCodes: Record<string, string> = {};

        for (const [command, val] of Object.entries(codes)) {
          const highlighted = await codeToHtml(val, {
            lang,
            themes: {
              light: themes.light,
              dark: themes.dark,
            },
            defaultColor: resolvedTheme === 'dark' ? 'dark' : 'light',
          });

          newHighlightedCodes[command] = highlighted;
        }

        setHighlightedCodes(newHighlightedCodes);
      } catch (error) {
        console.error('Error highlighting codes', error);
        setHighlightedCodes(codes);
      }
    }
    loadHighlightedCode();
  }, [resolvedTheme, lang, themes.light, themes.dark, codes]);

  return (
    <Tabs
      data-slot="install-tabs"
      className={cn(
        'w-full gap-0 bg-accent rounded-xl overflow-hidden',
        className,
      )}
      {...props}
      value={selectedCode}
      onValueChange={(val) => {
        setSelectedCode(val);
        onValueChange?.(val);
      }}
    >
      <TabsHighlight className="absolute z-0 inset-0 rounded-none shadow-none bg-transparent after:content-[''] after:absolute after:inset-x-0 after:h-0.5 after:bottom-0 dark:after:bg-white after:bg-black after:rounded-t-full">
        <TabsList
          data-slot="install-tabs-list"
          className="w-full relative flex items-center justify-between rounded-none h-10 text-current py-0 pl-6 pr-4.5"
        >
          <div className="flex gap-x-3 h-full">
            {highlightedCodes &&
              Object.keys(highlightedCodes).map((code) => (
                <TabsHighlightItem
                  key={code}
                  value={code}
                  className="flex items-center justify-center"
                >
                  <TabsTrigger
                    key={code}
                    value={code}
                    className="text-muted-foreground h-full text-sm font-medium data-[state=active]:text-current px-0"
                  >
                    {code}
                  </TabsTrigger>
                </TabsHighlightItem>
              ))}
          </div>

          {copyButton && highlightedCodes && (
            <CopyButton
              content={codes[selectedCode]}
              size="xs"
              variant="ghost"
              className="-me-2.5 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
              onCopiedChange={onCopiedChange}
            />
          )}
        </TabsList>
      </TabsHighlight>

      <div className="px-2 pb-2">
        <TabsContents
          data-slot="install-tabs-contents"
          className="bg-background rounded-md"
        >
          {highlightedCodes &&
            Object.entries(highlightedCodes).map(([code, val]) => (
              <TabsContent
                data-slot="install-tabs-content"
                key={code}
                className="w-full"
                value={code}
              >
                <div
                  className="w-full text-sm overflow-auto flex items-center p-4 [&>pre,_&_code]:!bg-transparent [&_code_.line]:!px-0 [&>pre,_&_code]:[background:transparent_!important] [&>pre,_&_code]:border-none [&_code]:!text-[13px]"
                  dangerouslySetInnerHTML={{ __html: val }}
                />
              </TabsContent>
            ))}
        </TabsContents>
      </div>
    </Tabs>
  );
}

export { CodeTabs, type CodeTabsProps };
