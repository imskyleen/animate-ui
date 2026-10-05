import { Highlight } from '@/registry/primitives/effects/highlight';

const TABS = [
  {
    value: 'tab-1',
    title: 'Tab 1',
    description: 'Tab 1 description',
  },
  {
    value: 'tab-2',
    title: 'Tab 2',
    description: 'Tab 2 description',
  },
  {
    value: 'tab-3',
    title: 'Tab 3',
    description: 'Tab 3 description',
  },
];

type HighlightDemoProps = {
  mode?: 'children' | 'parent';
  exitDelay?: number;
  hover?: boolean;
};

export const HighlightDemo = ({
  mode = 'children',
  exitDelay = 200,
  hover = false,
}: HighlightDemoProps) => {
  return (
    <div className="flex border rounded-full p-1">
      {/* @ts-ignore */}
      <Highlight
        defaultValue={TABS[0]?.value}
        className="rounded-full bg-accent inset-0"
        {...(mode === 'parent' && {
          containerClassName: 'flex',
        })}
        mode={mode}
        exitDelay={exitDelay}
        hover={hover}
      >
        {TABS.map((tab) => (
          <div
            key={tab.value}
            data-value={tab.value}
            className="px-3 h-8 flex items-center cursor-pointer justify-center rounded-full text-sm data-[active=true]:text-current data-[active=true]:font-medium text-muted-foreground transition-all duration-300"
          >
            {tab.title}
          </div>
        ))}
      </Highlight>
    </div>
  );
};
