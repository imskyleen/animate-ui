'use client';

import { useShouldReduceMotion } from '@animate-ui/react/utils/motion';
import { AnimateIcon } from '@animate-ui/react/icons';
import { SlidingNumber } from '@animate-ui/react/primitives/texts/sliding-number';
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
import { Progress } from '@/demos/radix-ui/progress';
import { RadioGroup, RadioGroupItem } from '@/demos/radix-ui/radio-group';
import { Switch } from '@/demos/radix-ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/demos/radix-ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/demos/radix-ui/toggle-group';
import { Bell } from '@/registry/icons/bell';
import { Heart } from '@/registry/icons/heart';
import { RefreshCw } from '@/registry/icons/refresh-cw';
import { Send } from '@/registry/icons/send';
import { Settings } from '@/registry/icons/settings';
import { Sparkles } from '@/registry/icons/sparkles';

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

const TABS = ['Overview', 'Analytics', 'Reports'];

function TabsVignette() {
  const [value, setValue] = useState(TABS[0]!);
  useAutoplay(
    () => setValue((v) => TABS[(TABS.indexOf(v) + 1) % TABS.length]!),
    1400,
    300,
  );
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
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
          <AccordionTrigger className="py-2 text-sm">
            {question}
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground">
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

const FORMATS: string[][] = [
  ['bold'],
  ['bold', 'italic'],
  ['italic', 'underline'],
  [],
];

function ToggleVignette() {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<string[] | null>(null);
  useAutoplay(
    () => {
      setValue(null);
      setStep((s) => (s + 1) % FORMATS.length);
    },
    1200,
    400,
  );
  return (
    <ToggleGroup
      type="multiple"
      variant="outline"
      value={value ?? FORMATS[step]!}
      onValueChange={setValue}
    >
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={2} />
      </ToggleGroupItem>
    </ToggleGroup>
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
  ['bell', Bell],
  ['heart', Heart],
  ['settings', Settings],
  ['send', Send],
  ['sparkles', Sparkles],
  ['refresh', RefreshCw],
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
        <span className="text-muted-foreground tabular-nums">
          {STEPS[step]}%
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
  { title: 'Toggle Group', Vignette: ToggleVignette },
  { title: 'Progress', Vignette: ProgressVignette },
];
