'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';
import { Label } from '@workspace/ui/components/ui/label';
import { Checkbox } from '@/registry/components/radix/checkbox';

const checkboxItems = [
  {
    id: 1,
    label: 'Code in Assembly 💾',
    defaultChecked: false,
  },
  {
    id: 2,
    label: 'Present a bug as a feature 🪲',
    defaultChecked: false,
  },
  {
    id: 3,
    label: 'Push to prod on a Friday 🚀',
    defaultChecked: false,
  },
];

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: 'easeInOut' },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 1,
  },
});

function PlayfulTodolist() {
  const [checked, setChecked] = React.useState(
    checkboxItems.map((i) => !!i.defaultChecked),
  );

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-6 space-y-6">
      {checkboxItems.map((item, idx) => (
        <div key={item.id} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              variant="accent"
              checked={checked[idx]}
              onCheckedChange={(val) => {
                const updated = [...checked];
                updated[idx] = val === true;
                setChecked(updated);
              }}
              id={`checkbox-${item.id}`}
            />
            <div className="relative inline-block">
              <Label htmlFor={`checkbox-${item.id}`}>{item.label}</Label>
              <motion.svg
                width="340"
                height="32"
                viewBox="0 0 340 32"
                className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-10"
              >
                <motion.path
                  d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeMiterlimit={10}
                  fill="none"
                  initial={false}
                  animate={getPathAnimate(!!checked[idx])}
                  transition={getPathTransition(!!checked[idx])}
                  className="stroke-neutral-900 dark:stroke-neutral-100"
                />
              </motion.svg>
            </div>
          </div>
          {idx !== checkboxItems.length - 1 && (
            <div className="border-t border-neutral-300 dark:border-neutral-700" />
          )}
        </div>
      ))}
    </div>
  );
}

export { PlayfulTodolist };
