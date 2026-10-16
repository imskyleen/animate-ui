'use client';

import { Button } from '@animate-ui/react/primitives/buttons/button';
import { AnimateIcon } from '@animate-ui/react/icons';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { ShimmeringText } from '@animate-ui/react/primitives/texts/shimmering';
import { TypingText } from '@animate-ui/react/primitives/texts/typing';
import {
  blur,
  ease,
  scale,
  spring,
  useShouldReduceMotion,
} from '@animate-ui/react/utils/motion';
import {
  FloppyDiskIcon,
  Loading03Icon,
  SparklesIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentType } from 'react';

import { CopyCommand } from '@/components/home/hero';
import { ArrowRight01 } from '@/registry/hugeicons/arrow-right-01';
import { CheckmarkCircle02 } from '@/registry/hugeicons/checkmark-circle-02';
import { Loading03 } from '@/registry/hugeicons/loading-03';
import { Notification01 } from '@/registry/hugeicons/notification-01';

const TYPE_MS = 26;
const STEP_MS = 750;
const HOLD_MS = 5600;

function Rich({ text }: { text: string }) {
  return text.split('`').map((part, index) =>
    index % 2 ? (
      <code
        key={index}
        className="rounded bg-foreground/[0.06] px-1 py-px font-mono text-[0.92em] text-foreground"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}

type Scenario = {
  id: string;
  label: string;
  prompt: string;
  steps: string[];
  result: string;
  Preview: ComponentType<{ playing: boolean; working: boolean }>;
};

function SavePreview({ playing }: { playing: boolean }) {
  const [state, setState] = useState<'idle' | 'loading' | 'saved'>('idle');
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = (at: number) => {
      timers.push(setTimeout(() => setPressed(true), at));
      timers.push(
        setTimeout(() => {
          setPressed(false);
          setState('loading');
        }, at + 140),
      );
      timers.push(setTimeout(() => setState('saved'), at + 1500));
      timers.push(setTimeout(() => setState('idle'), at + 2900));
    };
    run(300);
    run(3600);
    return () => {
      timers.forEach(clearTimeout);
      setState('idle');
      setPressed(false);
    };
  }, [playing]);

  const content = {
    idle: { icon: FloppyDiskIcon, label: 'Save changes' },
    loading: { icon: Loading03Icon, label: 'Saving…' },
    saved: { icon: Tick02Icon, label: 'Saved' },
  }[state];

  return (
    <motion.button
      type="button"
      tabIndex={-1}
      animate={{ scale: pressed ? scale.press : 1 }}
      transition={spring.press}
      className="inline-flex h-11 w-44 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary text-sm font-medium text-primary-foreground"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 8, filter: blur.surface }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{
            opacity: 0,
            y: -8,
            filter: blur.surface,
            transition: { duration: 0.15, ease: ease.out },
          }}
          transition={{ duration: 0.3, ease: ease.out, delay: 0.06 }}
          className="inline-flex items-center gap-2"
        >
          <motion.span
            className="inline-flex"
            animate={state === 'loading' ? { rotate: 360 } : { rotate: 0 }}
            transition={
              state === 'loading'
                ? { duration: 0.8, ease: 'linear', repeat: Infinity }
                : { duration: 0 }
            }
          >
            <HugeiconsIcon icon={content.icon} strokeWidth={2} size={16} />
          </motion.span>
          {content.label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function BellPreview({ playing }: { playing: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <AnimateIcon animate={playing} loop loopDelay={700} animateOnHover>
        <span className="flex size-20 items-center justify-center rounded-2xl border bg-background">
          <Notification01 size={36} />
        </span>
      </AnimateIcon>
      <span className="text-xs text-muted-foreground">
        hover · tap · in view · loop
      </span>
    </div>
  );
}

const TASKS = [
  'Write the release notes',
  'Ship v2',
  'Review the pull request',
  'Reply to issues',
  'Update the changelog',
];

function TodoPreview({ playing }: { playing: boolean }) {
  const [tasks, setTasks] = useState([TASKS[0]!, TASKS[2]!]);
  useEffect(() => {
    if (!playing) return;
    let next = 0;
    const moves: ((list: string[]) => string[])[] = [
      (list) => [...list, TASKS[1]!],
      (list) => list.filter((task) => task !== TASKS[0]),
      (list) => [...list, TASKS[3]!],
      (list) => list.filter((task) => task !== TASKS[2]),
      (list) => [TASKS[4]!, ...list],
      (list) => list.filter((task) => task !== TASKS[1]),
    ];
    const id = setInterval(() => {
      setTasks(moves[next % moves.length]!);
      next += 1;
    }, 950);
    return () => {
      clearInterval(id);
      setTasks([TASKS[0]!, TASKS[2]!]);
    };
  }, [playing]);

  return (
    <ul className="flex w-64 flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {tasks.map((task) => (
          <motion.li
            key={task}
            layout
            initial={{ opacity: 0, y: 10, filter: blur.surface }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: blur.surface }}
            transition={{
              layout: spring.reflow,
              default: { duration: 0.3, ease: ease.out },
            }}
            className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm"
          >
            <span className="size-4 shrink-0 rounded-[5px] border-2 border-muted-foreground/40" />
            {task}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

const FINDINGS = [
  {
    where: 'Dropdown menu',
    fact: 'ease-in entrance, opened all day',
    verdict: 'Fix first',
    tone: 'text-red-500',
  },
  {
    where: 'Modal',
    fact: '600ms to open',
    verdict: 'Shorten',
    tone: 'text-amber-500',
  },
  {
    where: 'Pricing card',
    fact: 'scales on hover',
    verdict: 'Lift instead',
    tone: 'text-amber-500',
  },
  {
    where: 'Toast',
    fact: 'no reduced-motion path',
    verdict: 'Add one',
    tone: 'text-amber-500',
  },
  {
    where: 'Hero',
    fact: '1.2s entrance, seen once',
    verdict: 'Fine',
    tone: 'text-emerald-500',
  },
];

function ReviewPreview({
  playing,
  working,
}: {
  playing: boolean;
  working: boolean;
}) {
  return (
    <div className="flex min-h-[18rem] w-full max-w-sm flex-col justify-center text-sm">
      <AnimatePresence mode="popLayout" initial={false}>
        {playing ? (
          <motion.div
            key="report"
            initial="hidden"
            animate="shown"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, filter: blur.surface },
              shown: {
                opacity: 1,
                filter: 'blur(0px)',
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="flex flex-col gap-1"
          >
            <motion.div
              variants={ROW}
              className="mb-2 flex items-center justify-between px-1 text-xs text-muted-foreground"
            >
              <span>14 animations</span>
              <span>4 to fix</span>
            </motion.div>
            {FINDINGS.map((finding) => (
              <motion.div
                key={finding.where}
                variants={ROW}
                className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{finding.where}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {finding.fact}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-xs font-medium ${finding.tone}`}
                >
                  {finding.verdict}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : working ? (
          <motion.div
            key="working"
            initial={{ opacity: 0, filter: blur.surface }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: blur.surface }}
            transition={{ duration: 0.3, ease: ease.out }}
            className="text-center"
          >
            <ShimmeringText text="Reviewing your app…" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

const ROW = {
  hidden: { opacity: 0, y: 8, filter: blur.surface },
  shown: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: ease.out },
  },
};

const SCENARIOS: Scenario[] = [
  {
    id: 'button',
    label: 'Save button',
    prompt: "Make my save button show it's loading, then a quick Saved.",
    steps: [
      'Read `components.json`: shadcn/ui on Radix UI',
      'A plain button: the loading then success pattern',
      'Icon and label swap through a blur, press scale from the tokens',
      'Checked reduced motion, the keyboard and a second click mid-save',
    ],
    result: 'Edited `components/save-button.tsx`',
    Preview: SavePreview,
  },
  {
    id: 'icon',
    label: 'Bell icon',
    prompt: 'Turn this bell into an animated icon that rings on hover.',
    steps: [
      'Hugeicons Notification 01, outline on a 24px grid',
      'The bell swings from its top, the clapper follows',
      'Wrapped for `AnimateIcon`: hover, tap, in view and loop',
      'Checked it comes back exactly to rest',
    ],
    result: 'Created `components/icons/notification.tsx`',
    Preview: BellPreview,
  },
  {
    id: 'list',
    label: 'Todo list',
    prompt: 'Animate my todo list when I add or remove a task.',
    steps: [
      'Read `package.json`: React and Motion',
      'A list that adds and removes: the list pattern',
      'New tasks rise out of a blur, the others glide into place',
      'Checked reduced motion: the fade stays, the movement goes',
    ],
    result: 'Edited `components/todo-list.tsx`',
    Preview: TodoPreview,
  },
  {
    id: 'review',
    label: 'Review',
    prompt: 'Review the animations in my app: what feels slow or janky?',
    steps: [
      'Ran `npx @animate-ui/cli audit`: 14 animations',
      'Weighed each one by how often it’s seen and what it’s for',
      'Kept the hero’s long entrance: it plays once',
      'Ranked 4 fixes, the menu first: it opens all day',
    ],
    result: 'Report ready, nothing edited until you say so',
    Preview: ReviewPreview,
  },
];

function useScenarioClock(
  scenario: Scenario,
  running: boolean,
  onDone: () => void,
) {
  const reduce = useShouldReduceMotion();
  const total = scenario.steps.length;
  const [progress, setProgress] = useState(-1);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (!running || reduce) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const typed = scenario.prompt.length * TYPE_MS + 450;
    for (let step = 0; step <= total; step++)
      timers.push(setTimeout(() => setProgress(step), typed + step * STEP_MS));
    timers.push(
      setTimeout(() => doneRef.current(), typed + total * STEP_MS + HOLD_MS),
    );
    return () => {
      timers.forEach(clearTimeout);
      setProgress(-1);
    };
  }, [running, reduce, scenario, total]);

  if (!running) return -1;
  return reduce ? total : progress;
}

function StepIcon({ done }: { done: boolean }) {
  return (
    <span className="relative flex h-5 w-4 shrink-0 items-center justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={spring.pop}
            className="inline-flex text-emerald-500"
          >
            <CheckmarkCircle02 animate size={16} />
          </motion.span>
        ) : (
          <motion.span
            key="running"
            exit={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
            transition={{ duration: 0.15, ease: ease.out }}
            className="inline-flex text-muted-foreground"
          >
            <Loading03 animate size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

const STEP_IN = {
  initial: { opacity: 0, y: 6, filter: blur.icon },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.35, ease: ease.out },
};

function ScenarioPane({
  scenario,
  running,
  onDone,
}: {
  scenario: Scenario;
  running: boolean;
  onDone: () => void;
}) {
  const progress = useScenarioClock(scenario, running, onDone);
  const total = scenario.steps.length;
  const finished = progress >= total;
  const { Preview } = scenario;

  return (
    <div className="grid min-h-[380px] md:grid-cols-[1.05fr_1fr]">
      <div className="flex flex-col gap-4 border-b p-5 md:border-r md:border-b-0 md:p-6">
        <div className="flex items-start gap-2.5 rounded-xl bg-accent/60 px-4 py-3 text-sm leading-5">
          <span className="flex h-5 shrink-0 items-center text-muted-foreground">
            <ArrowRight01
              animate={progress >= 0}
              animation="default-loop"
              size={16}
            />
          </span>
          {running ? (
            <TypingText
              key={`${scenario.id}-typing`}
              text={scenario.prompt}
              duration={TYPE_MS}
              className="font-medium"
            />
          ) : (
            <span className="font-medium">{scenario.prompt}</span>
          )}
        </div>
        <ol className="flex flex-col gap-3 text-sm">
          {scenario.steps.map((step, index) =>
            progress >= index ? (
              <motion.li
                key={step}
                {...STEP_IN}
                className="flex items-start gap-3 leading-5 text-muted-foreground"
              >
                <StepIcon done={progress > index} />
                <span className={progress > index ? 'text-foreground' : ''}>
                  <Rich text={step} />
                </span>
              </motion.li>
            ) : null,
          )}
        </ol>
        <AnimatePresence>
          {finished && (
            <motion.div
              {...STEP_IN}
              className="mt-auto flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground"
            >
              <HugeiconsIcon
                icon={SparklesIcon}
                strokeWidth={2}
                size={14}
                className="text-foreground"
              />
              <span>
                <Rich text={scenario.result} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="relative flex flex-col bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="flex items-center gap-2 px-5 pt-4">
          <span className="rounded-md border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            localhost:3000
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <Preview
            playing={running && finished}
            working={running && !finished}
          />
        </div>
      </div>
    </div>
  );
}

const reveal = (index: number) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: ease.out, delay: index * 0.09 },
});

export function AISection() {
  const [active, setActive] = useState(SCENARIOS[0]!.id);
  const [auto, setAuto] = useState(true);
  const windowRef = useRef<HTMLDivElement>(null);
  const started = useInView(windowRef, { margin: '-120px', once: true });

  const advance = () => {
    if (!auto) return;
    const index = SCENARIOS.findIndex((scenario) => scenario.id === active);
    setActive(SCENARIOS[(index + 1) % SCENARIOS.length]!.id);
  };

  return (
    <section
      data-slot="home-ai"
      className="mx-auto mt-32 flex w-full max-w-[1100px] flex-col items-center px-5 text-center"
    >
      <motion.span
        {...reveal(0)}
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground"
      >
        <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} size={14} />
        Animate UI skill
      </motion.span>
      <motion.h2
        {...reveal(1)}
        className="mt-5 text-4xl font-medium text-balance md:text-6xl"
      >
        Ask for motion in plain words.
      </motion.h2>
      <motion.p
        {...reveal(2)}
        className="mt-5 max-w-[620px] text-lg text-balance text-muted-foreground"
      >
        Your AI agent finds what each component is built on, takes the shortest
        path to animate it, moves it with Animate UI&apos;s springs and checks
        the details before it&apos;s done.
      </motion.p>

      <motion.div
        {...reveal(3)}
        ref={windowRef}
        data-slot="ai-demo"
        className="mt-10 w-full text-left"
      >
        <Tabs
          value={active}
          onValueChange={(value) => {
            setAuto(false);
            setActive(value);
          }}
          className="flex flex-col items-center gap-4"
        >
          <TabsHighlight className="absolute inset-0 z-0 rounded-md bg-accent">
            <TabsList
              aria-label="Example request"
              className="inline-flex flex-wrap items-center justify-center gap-1 text-sm"
            >
              {SCENARIOS.map((scenario) => (
                <TabsHighlightItem key={scenario.id} value={scenario.id}>
                  <TabsTrigger
                    value={scenario.id}
                    className="relative z-10 rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-300 hover:text-foreground data-[state=active]:text-foreground"
                  >
                    {scenario.label}
                  </TabsTrigger>
                </TabsHighlightItem>
              ))}
            </TabsList>
          </TabsHighlight>
          <div className="w-full overflow-hidden rounded-2xl border bg-background shadow-[0_24px_60px_-32px_rgb(0_0_0/0.35)] dark:bg-neutral-900 dark:shadow-[0_24px_60px_-28px_rgb(0_0_0/0.9)]">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
                <span className="size-2.5 rounded-full bg-foreground/15" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                ~/my-app
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} size={12} />
                Animate UI skill
              </span>
            </div>
            <TabsContents>
              {SCENARIOS.map((scenario) => (
                <TabsContent key={scenario.id} value={scenario.id}>
                  <ScenarioPane
                    scenario={scenario}
                    running={started && active === scenario.id}
                    onDone={advance}
                  />
                </TabsContent>
              ))}
            </TabsContents>
          </div>
        </Tabs>
      </motion.div>

      <motion.div
        {...reveal(4)}
        className="mt-12 flex max-w-full flex-col items-center gap-4"
      >
        <span className="text-sm text-muted-foreground">
          Works in Claude Code, Cursor, Codex and any agent that reads skills.
        </span>
        <CopyCommand
          command={(dlx) => `${dlx} skills add imskyleen/animate-ui`}
        />
        <div className="flex gap-3">
          <Button
            asChild
            className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Link href="/docs/skills">Read the skill docs</Link>
          </Button>
          <Button
            asChild
            className="inline-flex h-10 items-center rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Link href="/docs/cli">Audit with the CLI</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
