'use client';

import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { AnimateIcon } from '@animate-ui/react/icons';
import {
  Tabs as AnimateTabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@animate-ui/react/primitives/tabs';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/demos/radix-ui/accordion';
import { Checkbox } from '@/demos/radix-ui/checkbox';
import {
  createToastManager,
  Toast,
  ToastClose,
  ToastContent,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from '@/demos/base-ui/toast';
import { Progress } from '@/demos/radix-ui/progress';
import { RadioGroup, RadioGroupItem } from '@/demos/radix-ui/radio-group';
import { Switch } from '@/demos/radix-ui/switch';
import { Clapperboard } from '@/registry/hugeicons/clapperboard';
import { Favourite } from '@/registry/hugeicons/favourite';
import { Notification01 } from '@/registry/hugeicons/notification-01';
import { Sent } from '@/registry/hugeicons/sent';
import { Settings02 } from '@/registry/hugeicons/settings-02';
import { Sparkles } from '@/registry/hugeicons/sparkles';

const PausedContext = createContext(false);

export function AutoplayScope({
  paused,
  children,
}: {
  paused: boolean;
  children: ReactNode;
}) {
  return <PausedContext value={paused}>{children}</PausedContext>;
}

function useAutoplay(step: () => void, every: number, offset = 0) {
  const paused = use(PausedContext);
  const reduce = useShouldReduceMotion();
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    if (paused || reduce) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      stepRef.current();
      interval = setInterval(() => stepRef.current(), every);
    }, offset);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [paused, reduce, every, offset]);
}

function SwitchVignette() {
  const [on, setOn] = useState([true, false]);
  useAutoplay(() => setOn(([a, b]) => [!a!, !b!]), 1600);
  return (
    <div className="flex flex-col gap-4">
      {['Airplane Mode', 'Wi-Fi'].map((label, index) => (
        <label key={label} className="flex items-center gap-3 text-sm">
          <Switch
            checked={on[index]}
            onCheckedChange={(value) =>
              setOn((list) => list.map((v, i) => (i === index ? value : v)))
            }
          />
          {label}
        </label>
      ))}
    </div>
  );
}

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    text: '12 active projects, 3 tasks due.',
  },
  {
    value: 'analytics',
    label: 'Analytics',
    text: 'Page views up 25% this week.',
  },
  {
    value: 'reports',
    label: 'Reports',
    text: '5 reports are ready to export.',
  },
];

function TabsVignette() {
  const [value, setValue] = useState(TABS[0]!.value);
  useAutoplay(
    () =>
      setValue((v) => {
        const index = TABS.findIndex((tab) => tab.value === v);
        return TABS[(index + 1) % TABS.length]!.value;
      }),
    1600,
    300,
  );
  return (
    <AnimateTabs value={value} onValueChange={setValue} className="w-60">
      <TabsHighlight className="absolute inset-0 z-0 rounded-[7px] border border-transparent bg-background shadow-sm dark:border-input dark:bg-input/30">
        <TabsList className="inline-flex h-8 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
          {TABS.map((tab) => (
            <TabsHighlightItem key={tab.value} value={tab.value}>
              <TabsTrigger
                value={tab.value}
                className="relative z-10 inline-flex h-full items-center justify-center rounded-[7px] px-2 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors duration-300 hover:text-foreground data-[state=active]:text-foreground dark:text-muted-foreground dark:data-[state=active]:text-foreground"
              >
                {tab.label}
              </TabsTrigger>
            </TabsHighlightItem>
          ))}
        </TabsList>
      </TabsHighlight>
      <TabsContents className="mt-2 rounded-lg text-xs ring-1 ring-foreground/10">
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="p-3">
            <p className="font-medium">{tab.label}</p>
            <p className="text-muted-foreground">{tab.text}</p>
          </TabsContent>
        ))}
      </TabsContents>
    </AnimateTabs>
  );
}

const QUESTIONS = [
  ['Is it accessible?', 'Every primitive keeps its library’s accessibility.'],
  ['Is it animated?', 'Yes, out of the box, with nothing to configure.'],
  ['Can I style it?', 'Your classes and your styles stay as they are.'],
];

function AccordionVignette() {
  const [value, setValue] = useState('0');
  useAutoplay(() => setValue((v) => String((Number(v) + 1) % 3)), 2000, 600);
  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className="w-64"
    >
      {QUESTIONS.map(([question, answer], index) => (
        <AccordionItem key={question} value={String(index)}>
          {/* Open, its answer sits closer (the card is short): the gap shrinks with the trigger's own transition. */}
          <AccordionTrigger className="py-2 text-sm aria-expanded:pb-1">
            {question}
          </AccordionTrigger>
          <AccordionContent className="pb-2 text-xs text-muted-foreground">
            {answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const TASKS = ['Book the studio', 'Send the estimate', 'Pick a typeface'];

function ChecklistVignette() {
  const [done, setDone] = useState(0);
  useAutoplay(
    () => setDone((count) => (count + 1) % (TASKS.length + 1)),
    1100,
    200,
  );
  return (
    <div className="flex flex-col gap-3">
      {TASKS.map((task, index) => (
        <label key={task} className="flex items-center gap-3 text-sm">
          <Checkbox
            checked={index < done}
            onCheckedChange={(value) => setDone(value ? index + 1 : index)}
          />
          <span
            className={
              index < done
                ? 'text-muted-foreground line-through transition-colors'
                : 'transition-colors'
            }
          >
            {task}
          </span>
        </label>
      ))}
    </div>
  );
}

const DENSITIES = ['Default', 'Comfortable', 'Compact'];

function RadioVignette() {
  const [value, setValue] = useState(DENSITIES[1]!);
  useAutoplay(
    () =>
      setValue(
        (v) => DENSITIES[(DENSITIES.indexOf(v) + 1) % DENSITIES.length]!,
      ),
    1300,
    500,
  );
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      {DENSITIES.map((density) => (
        <label key={density} className="flex items-center gap-3 text-sm">
          <RadioGroupItem value={density} />
          {density}
        </label>
      ))}
    </RadioGroup>
  );
}

const NOTIFICATIONS = [
  { title: 'Event created' },
  { title: 'Changes saved' },
  { title: 'Invite sent' },
];

function ToastStack() {
  const { toasts } = useToastManager();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent className="py-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
        </div>
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function ToastVignette() {
  const [manager] = useState(() => createToastManager());
  const nextRef = useRef(0);
  const shownRef = useRef<string[]>([]);
  useAutoplay(
    () => {
      const shown = shownRef.current;
      shown.push(
        manager.add({ ...NOTIFICATIONS[nextRef.current]!, timeout: 4200 }),
      );
      while (shown.length > 3) manager.close(shown.shift()!);
      nextRef.current = (nextRef.current + 1) % NOTIFICATIONS.length;
    },
    1600,
    300,
  );
  return (
    <ToastProvider toastManager={manager} limit={2}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        <ToastViewport className="absolute inset-x-4 bottom-4 w-auto max-w-none sm:right-4 sm:left-4 sm:w-auto">
          <ToastStack />
        </ToastViewport>
      </div>
    </ToastProvider>
  );
}

function CounterVignette() {
  const [count, setCount] = useState(12480);
  useAutoplay(
    () => setCount((c) => c + 37 + Math.round(Math.random() * 90)),
    1500,
  );
  return (
    <div className="flex flex-col items-center gap-1">
      <SlidingNumber
        number={count}
        thousandSeparator=","
        className="text-4xl font-semibold tabular-nums"
      />
      <span className="text-xs text-muted-foreground">installs this week</span>
    </div>
  );
}

const ICONS: [string, ComponentType<{ size?: number }>][] = [
  ['notification', Notification01],
  ['favourite', Favourite],
  ['settings', Settings02],
  ['sent', Sent],
  ['sparkles', Sparkles],
  ['clapperboard', Clapperboard],
];

function IconsVignette() {
  const paused = use(PausedContext);
  const reduce = useShouldReduceMotion();
  return (
    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
      {ICONS.map(([name, Icon], index) => (
        <AnimateIcon
          key={name}
          animate={!paused && !reduce}
          loop
          loopDelay={600 + index * 150}
          animateOnHover={paused}
        >
          <span className="inline-flex">
            <Icon size={26} />
          </span>
        </AnimateIcon>
      ))}
    </div>
  );
}

const STEPS = [18, 46, 74, 100];

function ProgressVignette() {
  const [step, setStep] = useState(0);
  useAutoplay(() => setStep((s) => (s + 1) % STEPS.length), 1000, 100);
  return (
    <div className="flex w-56 flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span>Uploading</span>
        <span className="inline-flex text-muted-foreground tabular-nums">
          <SlidingNumber number={STEPS[step]!} />%
        </span>
      </div>
      <Progress value={STEPS[step]} />
    </div>
  );
}

export const VIGNETTES: { title: string; Vignette: ComponentType }[] = [
  { title: 'Switch', Vignette: SwitchVignette },
  { title: 'Tabs', Vignette: TabsVignette },
  { title: 'Accordion', Vignette: AccordionVignette },
  { title: 'Checkbox', Vignette: ChecklistVignette },
  { title: 'Sliding Number', Vignette: CounterVignette },
  { title: 'Radio Group', Vignette: RadioVignette },
  { title: 'Icons', Vignette: IconsVignette },
  { title: 'Toast', Vignette: ToastVignette },
  { title: 'Progress', Vignette: ProgressVignette },
];
