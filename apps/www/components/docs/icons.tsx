'use client';

import Fuse from 'fuse.js';
import { useQueryState, parseAsString } from 'nuqs';
import { index } from '@/__registry__';
import { Highlight } from '@/registry/primitives/effects/highlight';
import { AnimateIcon, staticAnimations } from '@/registry/icons/icon';
import { X } from '@/registry/icons/x';
import { Input } from '@workspace/ui/components/ui/input';
import { cn } from '@workspace/ui/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { type HTMLMotionProps, motion } from 'motion/react';
import { CodeTabs } from '@/registry/components/animate/code-tabs';
import { DynamicCodeBlock } from './dynamic-codeblock';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '@/registry/components/animate/tabs';
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
} from '@/registry/components/animate/tooltip';
import { Button } from '@workspace/ui/components/ui/button';
import { RotateCcw } from '@/registry/icons/rotate-ccw';
import { InfinityIcon } from 'lucide-react';
import { Check } from '@/registry/icons/check';

const staticAnimationsLength = Object.keys(staticAnimations).length;

const FILTERS = {
  all: 'All',
  new: 'New',
};

const addedIcons = [
  {
    date: '2025-09-07',
    icons: [
      'icons-accessibility',
      'icons-airplay',
      'icons-binary',
      'icons-terminal',
      'icons-badge-check',
      'icons-cast',
      'icons-cctv',
      'icons-chart-bar',
      'icons-chart-bar-increasing',
      'icons-chart-bar-decreasing',
      'icons-chart-column',
      'icons-chart-column-increasing',
      'icons-chart-column-decreasing',
      'icons-chart-line',
      'icons-chart-no-axes-column',
      'icons-chart-no-axes-column-decreasing',
      'icons-chart-no-axes-column-increasing',
      'icons-chart-scatter',
      'icons-chart-spline',
      'icons-contrast',
      'icons-cross',
      'icons-ellipsis',
      'icons-ellipsis-vertical',
      'icons-party-popper',
    ],
  },
  {
    date: '2025-09-09',
    icons: [
      'icons-cloud-drizzle',
      'icons-cloud-hail',
      'icons-cloud-lightning',
      'icons-cloud-moon',
      'icons-cloud-moon-rain',
      'icons-cloud-rain',
      'icons-cloud-rain-wind',
      'icons-cloud-snow',
      'icons-cloud-sun',
      'icons-cloud-sun-rain',
      'icons-moon',
      'icons-moon-star',
      'icons-orbit',
      'icons-sun',
      'icons-sun-dim',
      'icons-sun-medium',
      'icons-sun-moon',
    ],
  },
  {
    date: '2025-09-13',
    icons: [
      'icons-check',
      'icons-check-check',
      'icons-check-line',
      'icons-circle-check',
      'icons-clapperboard',
      'icons-crop',
      'icons-lock',
      'icons-lock-keyhole',
      'icons-lock-open',
      'icons-lock-keyhole-open',
    ],
  },
  {
    date: '2025-09-24',
    icons: [
      'icons-blocks',
      'icons-frame',
      'icons-plug-zap',
      'icons-radio',
      'icons-radio-tower',
      'icons-nfc',
      'icons-paperclip',
      'icons-unplug',
      'icons-ev-charger',
      'icons-link',
      'icons-sliders-horizontal',
      'icons-sliders-vertical',
      'icons-equal-not',
      'icons-circle-check-big',
      'icons-router',
    ],
  },
];

const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const newIcons = addedIcons
  .filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= thirtyDaysAgo;
  })
  .flatMap((entry) => entry.icons);

type CheckBadgeProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  isActive?: boolean;
  children: React.ReactNode;
};

const CheckBadge = ({
  className,
  children,
  isActive,
  ...props
}: CheckBadgeProps) => {
  return (
    <motion.button
      className={cn(
        'bg-accent overflow-hidden transition-colors duration-200 ease-in-out flex items-center gap-1 py-1 px-3 rounded-full text-sm font-medium text-accent-foreground hover:bg-accent/80',
        isActive && 'pl-2 bg-primary text-primary-foreground hover:bg-primary',
        className,
      )}
      layout
      {...props}
    >
      {isActive && <Check animate className="size-3.5 stroke-3" />}
      <motion.span layout="preserve-aspect">{children}</motion.span>
    </motion.button>
  );
};

export const Icons = () => {
  const [animationKey, setAnimationKey] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('cli');
  const [isCopied, setIsCopied] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<string>('default');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [filter, setFilter] = useState<keyof typeof FILTERS>('all');

  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withOptions({
      history: 'replace',
      throttleMs: 150,
    }),
  );
  const [activeIconWithoutPrefix, setActiveIconWithoutPrefix] = useQueryState(
    'icon',
    parseAsString.withOptions({
      history: 'replace',
      throttleMs: 150,
    }),
  );
  const activeIcon = useMemo(
    () => (activeIconWithoutPrefix ? `icons-${activeIconWithoutPrefix}` : null),
    [activeIconWithoutPrefix],
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    if (activeIcon) {
      setIsPanelOpen(true);
    }
  }, [activeIcon]);

  useEffect(() => {
    if (!isPanelOpen && activeIcon) {
      setTimeout(() => {
        setActiveIconWithoutPrefix(null);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelOpen]);

  const icons = Object.values(index).filter(
    (icon) => icon.name.startsWith('icons-') && icon.name !== 'icons-icon',
  );

  const filteredIcons = useMemo(() => {
    if (filter === 'all') return icons;
    return icons.filter((icon) => newIcons.includes(icon.name));
  }, [icons, filter]);

  const fuse = useMemo(() => {
    return new Fuse(icons, {
      keys: ['name', 'keywords'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [icons]);

  const searchedIcons = useMemo(() => {
    const q = search?.trim();
    if (!q) return filteredIcons;
    return fuse.search(q).map((result) => result.item);
  }, [search, fuse, filteredIcons]);

  const searchedNewIcons = useMemo(() => {
    if (!search?.trim()) return newIcons;
    return searchedIcons.filter((icon) => newIcons.includes(icon.name));
  }, [search, searchedIcons]);

  const icon = useMemo(
    () => icons.find((icon) => icon.name === activeIcon),
    [activeIcon, icons],
  );
  const iconName = useMemo(
    () =>
      icon?.name
        .replace('icons-', '')
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(''),
    [icon],
  );

  useEffect(() => {
    setActiveAnimation('default');
  }, [activeIcon]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="-mt-4.5 text-black dark:text-white">
      <p className="text-sm text-muted-foreground">
        {searchedIcons.length} icons {search?.length ? 'found' : 'available'}{' '}
        {searchedNewIcons.length ? (
          <span>
            •{' '}
            <span className="text-foreground">{`${searchedNewIcons.length} new icons`}</span>
          </span>
        ) : (
          ''
        )}
      </p>

      <Input
        placeholder="Search icons"
        value={search ?? ''}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex items-center gap-2 mt-4">
        {Object.keys(FILTERS).map((f) => (
          <CheckBadge
            key={f}
            onClick={() => setFilter(f as keyof typeof FILTERS)}
            isActive={f === filter}
          >
            {FILTERS[f as keyof typeof FILTERS]}
          </CheckBadge>
        ))}
      </div>

      <div>
        {searchedIcons.length ? (
          <div className="grid lg:grid-cols-11 sm:grid-cols-9 xs:grid-cols-7 grid-cols-5 gap-4 mt-6">
            <TooltipProvider>
              <Highlight
                hover
                className="absolute inset-0 ring-2 ring-foreground bg-transparent rounded-lg -z-1"
              >
                {searchedIcons.map((icon) => {
                  const animationsLength = Object.keys(
                    icon?.component?.animations ?? {},
                  ).length;
                  const totalAnimationsLength =
                    staticAnimationsLength + animationsLength;
                  return (
                    <Tooltip side="bottom" sideOffset={14} key={icon.name}>
                      <TooltipTrigger>
                        <div>
                          <AnimateIcon asChild animateOnHover>
                            <button
                              data-value={icon.name}
                              onClick={() => {
                                setActiveIconWithoutPrefix(
                                  icon.name.replace('icons-', ''),
                                );
                              }}
                              className="relative group flex items-center justify-center size-full aspect-square rounded-lg p-3.5"
                            >
                              {icon?.component && (
                                <icon.component className="text-current size-full" />
                              )}
                              <div
                                className={cn(
                                  'absolute inset-0 bg-muted rounded-lg -z-2 transition-colors duration-200',
                                  activeIcon === icon.name &&
                                    'bg-foreground/20',
                                )}
                              />

                              {newIcons.includes(icon.name) && (
                                <div className="absolute -top-1 -right-1 size-2.5 border border-background bg-foreground rounded-full" />
                              )}

                              <div className="absolute z-10 -bottom-2.5 -right-2.5 flex items-center justify-center text-muted-foreground font-medium size-5 bg-background border group-hover:border-foreground group-hover:ring group-hover:ring-foreground transition-colors duration-200 rounded-full">
                                <span className="text-[11px] leading-none">
                                  {totalAnimationsLength}
                                </span>
                              </div>
                            </button>
                          </AnimateIcon>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{icon.name.replace('icons-', '')}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </Highlight>
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
        animate={isPanelOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: '100%' }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
      >
        <h2 className="text-lg font-medium mt-1.5">
          {activeIcon?.replace('icons-', '')}
        </h2>
        <AnimateIcon asChild animateOnHover>
          <button
            onClick={() => setIsPanelOpen(false)}
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
                        npm: `npx shadcn@latest add @animate-ui/${activeIcon}`,
                        pnpm: `pnpm dlx shadcn@latest add @animate-ui/${activeIcon}`,
                        yarn: `npx shadcn@latest add @animate-ui/${activeIcon}`,
                        bun: `bun x --bun shadcn@latest add @animate-ui/${activeIcon}`,
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="manual" className="relative group">
                    {activeIcon && (
                      <DynamicCodeBlock
                        code={icon?.files?.[0]?.content}
                        lang="jsx"
                        title={`${icon?.name.replace('icons-', '')}.tsx`}
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
                  <div className="relative h-[150px] w-full mx-auto rounded-2xl aspect-square bg-muted/50 border flex items-center justify-center">
                    {icon?.component && (
                      <icon.component
                        key={`${activeAnimation}-${activeIcon}-${animationKey}-${isLoop}`}
                        animate
                        animation={activeAnimation}
                        loop={isLoop}
                        className="text-current size-[100px]"
                      />
                    )}

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className={cn(
                        'absolute left-2 top-2 z-[2] backdrop-blur-md bg-transparent hover:bg-black/5 dark:hover:bg-white/10 size-6',
                        isLoop &&
                          'bg-black/10 dark:bg-white/15 hover:bg-black/15 dark:hover:bg-white/20',
                      )}
                      onClick={() => setIsLoop(!isLoop)}
                    >
                      <InfinityIcon className="size-3.5" />
                    </Button>

                    <AnimateIcon asChild animateOnHover>
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
