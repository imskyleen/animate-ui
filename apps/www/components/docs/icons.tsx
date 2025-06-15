'use client';

import Fuse from 'fuse.js';
import { index } from '@/__registry__';
import { MotionHighlight } from '@/registry/effects/motion-highlight';
import { AnimateIcon, staticAnimations } from '@/registry/icons/icon';
import { X } from '@/registry/icons/x';
import { Input } from '@workspace/ui/components/ui/input';
import { cn } from '@workspace/ui/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CodeTabs } from '@/registry/components/code-tabs';
import { DynamicCodeBlock } from './dynamic-codeblock';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '@/registry/components/tabs';
import ReactIcon from '@workspace/ui/components/icons/react-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/components/tooltip';
import { Button } from '@workspace/ui/components/ui/button';
import { RotateCcw } from '@/registry/icons/rotate-ccw';

const staticAnimationsLength = Object.keys(staticAnimations).length;

const NEW_ICONS = ['accessibility-icon', 'airplay-icon'];

export const Icons = () => {
  const [search, setSearch] = useState('');
  const [animationKey, setAnimationKey] = useState(0);
  const [activeIcon, setActiveIcon] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('cli');
  const [isCopied, setIsCopied] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string>('default');

  const icons = Object.values(index).filter((icon) =>
    icon.name.endsWith('-icon'),
  );

  const fuse = useMemo(() => {
    return new Fuse(icons, {
      keys: ['name', 'keywords'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [icons]);

  const filteredIcons = useMemo(() => {
    const q = search.trim();
    if (!q) return icons;
    return fuse.search(q).map((result) => result.item);
  }, [search, fuse, icons]);

  const icon = useMemo(
    () => icons.find((icon) => icon.name === activeIcon),
    [activeIcon, icons],
  );
  const iconName = useMemo(
    () =>
      icon?.name
        .replace('-icon', '')
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(''),
    [icon],
  );

  useEffect(() => {
    setActiveAnimation('default');
  }, [activeIcon]);

  return (
    <div className="-mt-4.5 text-black dark:text-white">
      <p className="text-sm text-muted-foreground">
        {filteredIcons.length} icons {search.length ? 'found' : 'available'}
      </p>

      <Input
        placeholder="Search icons"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div>
        {filteredIcons.length ? (
          <div className="grid lg:grid-cols-11 sm:grid-cols-9 xs:grid-cols-7 grid-cols-5 gap-4 mt-6">
            <TooltipProvider>
              <MotionHighlight
                hover
                className="ring-2 ring-blue-500 bg-transparent rounded-lg -z-1"
              >
                {filteredIcons.map((icon) => {
                  const animationsLength = Object.keys(
                    icon?.component?.animations ?? {},
                  ).length;
                  return (
                    <Tooltip side="bottom" key={icon.name}>
                      <TooltipTrigger>
                        <div>
                          <AnimateIcon animateOnHover>
                            <button
                              data-value={icon.name}
                              onClick={() => setActiveIcon(icon.name)}
                              className="relative group flex items-center justify-center size-full aspect-square rounded-lg p-3.5"
                            >
                              {icon?.component && (
                                <icon.component className="text-current size-full" />
                              )}
                              <div
                                className={cn(
                                  'absolute inset-0 bg-muted rounded-lg -z-2 transition-colors duration-200',
                                  activeIcon === icon.name && 'bg-blue-500/20',
                                )}
                              />

                              {NEW_ICONS.includes(icon.name) && (
                                <div className="absolute -top-1 -right-1 size-2.5 border border-background bg-blue-500 rounded-full" />
                              )}

                              <div className="absolute -bottom-2.5 -right-2.5 flex items-center justify-center text-muted-foreground font-medium size-5 bg-background border group-hover:border-blue-500 group-hover:ring group-hover:ring-blue-500 transition-colors duration-200 rounded-full">
                                <span className="text-[11px] leading-none">
                                  {staticAnimationsLength + animationsLength}
                                </span>
                              </div>
                            </button>
                          </AnimateIcon>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{icon.name.replace('-icon', '')}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </MotionHighlight>
            </TooltipProvider>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-muted-foreground">No icons found</p>
          </div>
        )}
      </div>

      <motion.div
        className="fixed z-50 w-[325px] right-0 inset-y-12 rounded-l-2xl border-l border-y bg-background shadow-sm p-4"
        initial={{ opacity: 0, x: '100%' }}
        animate={activeIcon ? { opacity: 1, x: 0 } : { opacity: 0, x: '100%' }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
      >
        <h2 className="text-lg font-medium mt-1.5">
          {activeIcon?.replace('-icon', '')}
        </h2>
        <AnimateIcon animateOnHover>
          <button
            onClick={() => setActiveIcon(null)}
            className="absolute cursor-pointer top-5 right-5 size-8 rounded-full flex items-center justify-center bg-background hover:bg-muted transition-colors duration-200"
          >
            <X className="size-5 text-neutral-500" />
          </button>
        </AnimateIcon>

        <div className="h-[calc(100%-3.25rem)] overflow-y-auto">
          <div className="h-full flex flex-col justify-between gap-y-4">
            <div>
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value)}
                className="gap-0"
              >
                <div className="w-full flex justify-between items-center mb-3">
                  <h3 className="text-base font-medium pt-0 pb-0 mt-0 mb-0">
                    Installation
                  </h3>
                  <TabsList>
                    <TabsTrigger value="cli" className="w-[70px]">
                      CLI
                    </TabsTrigger>
                    <TabsTrigger value="manual" className="w-[70px]">
                      Manual
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContents>
                  <TabsContent value="cli">
                    <CodeTabs
                      codes={{
                        npm: `npx shadcn@latest add "https://animate-ui.com/r/${activeIcon}.json"`,
                        pnpm: `pnpm dlx shadcn@latest add "https://animate-ui.com/r/${activeIcon}.json"`,
                        yarn: `npx shadcn@latest add "https://animate-ui.com/r/${activeIcon}.json"`,
                        bun: `bun x --bun shadcn@latest add "https://animate-ui.com/r/${activeIcon}.json"`,
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="manual" className="relative group">
                    {activeIcon && (
                      <DynamicCodeBlock
                        code={icon?.files?.[0]?.content}
                        lang="jsx"
                        title={`${icon?.name}.tsx`}
                        icon={<ReactIcon />}
                        className="max-h-[92px]"
                      />
                    )}

                    <div
                      role="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          icon?.files?.[0]?.content ?? '',
                        );
                        setIsCopied(true);
                        setTimeout(() => {
                          setIsCopied(false);
                        }, 2000);
                      }}
                      className="absolute cursor-pointer inset-px top-[41px] rounded-b-[13px] bg-black/20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center"
                    >
                      <p className="text-sm font-medium text-white">
                        {isCopied ? 'Copied' : 'Copy'}
                      </p>
                    </div>
                  </TabsContent>
                </TabsContents>
              </Tabs>

              <h3 className="text-base font-medium mt-4">Usage</h3>
              {activeIcon && (
                <DynamicCodeBlock
                  code={`<${iconName} animateOnHover />
// Or use with the AnimateIcon component
<AnimateIcon animateOnHover>
  <${iconName} />
</AnimateIcon>`}
                  lang="jsx"
                />
              )}
            </div>

            <div className="space-y-4">
              {activeIcon && (
                <>
                  <div className="relative h-[200px] w-full mx-auto rounded-2xl aspect-square bg-muted/50 border flex items-center justify-center">
                    {icon?.component && (
                      <icon.component
                        key={`${activeAnimation}-${activeIcon}-${animationKey}`}
                        animate
                        animation={activeAnimation}
                        className="text-current size-[100px]"
                      />
                    )}

                    <AnimateIcon animateOnHover>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="absolute right-2 top-2 z-[2] backdrop-blur-md bg-transparent hover:bg-black/5 dark:hover:bg-white/10 size-6"
                        onClick={() => setAnimationKey((prev) => prev + 1)}
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    </AnimateIcon>
                  </div>

                  <Select
                    value={activeAnimation}
                    onValueChange={(value) => setActiveAnimation(value)}
                  >
                    <SelectTrigger className="w-full !h-11 px-1.5 rounded-lg">
                      <SelectValue placeholder="Select an animation" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="space-y-1.5 p-0.5">
                        {Object.keys({
                          ...staticAnimations,
                          ...(icon?.component?.animations ?? {}),
                        }).map((animation) => (
                          <SelectItem
                            key={animation}
                            value={animation}
                            className="!h-8 rounded-md px-0 focus:bg-muted"
                          >
                            <div className="gap-2 flex items-center">
                              <div className="size-8 rounded-md p-1.5 bg-muted">
                                {icon?.component && (
                                  <icon.component className="text-current size-full" />
                                )}
                              </div>
                              <span>{animation}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
