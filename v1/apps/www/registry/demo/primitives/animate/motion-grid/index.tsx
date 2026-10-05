import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

import {
  MotionGrid,
  MotionGridCells,
  type Frames,
} from '@/registry/primitives/animate/motion-grid';
import {
  RotatingText,
  RotatingTextContainer,
} from '@/registry/primitives/texts/rotating';

const importingFrames = [
  [[2, 2]],
  [
    [1, 2],
    [2, 1],
    [2, 3],
    [3, 2],
  ],
  [
    [2, 2],
    [0, 2],
    [1, 1],
    [1, 3],
    [2, 0],
    [2, 4],
    [3, 1],
    [3, 3],
    [4, 2],
  ],
  [
    [0, 1],
    [0, 3],
    [1, 0],
    [1, 2],
    [1, 4],
    [2, 1],
    [2, 3],
    [3, 0],
    [3, 2],
    [3, 4],
    [4, 1],
    [4, 3],
  ],
  [
    [0, 0],
    [0, 2],
    [0, 4],
    [1, 1],
    [1, 3],
    [2, 0],
    [2, 2],
    [2, 4],
    [3, 1],
    [3, 3],
    [4, 0],
    [4, 2],
    [4, 4],
  ],
  [
    [0, 1],
    [0, 3],
    [1, 0],
    [1, 2],
    [1, 4],
    [2, 1],
    [2, 3],
    [3, 0],
    [3, 2],
    [3, 4],
    [4, 1],
    [4, 3],
  ],
  [
    [0, 0],
    [0, 2],
    [0, 4],
    [1, 1],
    [1, 3],
    [2, 0],
    [2, 4],
    [3, 1],
    [3, 3],
    [4, 0],
    [4, 2],
    [4, 4],
  ],
  [
    [0, 1],
    [1, 0],
    [3, 0],
    [4, 1],
    [0, 3],
    [1, 4],
    [3, 4],
    [4, 3],
  ],
  [
    [0, 0],
    [0, 4],
    [4, 0],
    [4, 4],
  ],
  [],
] as Frames;

const arrowDownFrames = [
  [[2, 0]],
  [
    [1, 0],
    [2, 0],
    [3, 0],
    [2, 1],
  ],
  [
    [2, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [2, 2],
  ],
  [
    [2, 0],
    [2, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [2, 3],
  ],
  [
    [2, 1],
    [2, 2],
    [1, 3],
    [2, 3],
    [3, 3],
    [2, 4],
  ],
  [
    [2, 2],
    [2, 3],
    [1, 4],
    [2, 4],
    [3, 4],
  ],
  [
    [2, 3],
    [2, 4],
  ],
  [[2, 4]],
  [],
] as Frames;

const arrowUpFrames = [
  [[2, 4]],
  [
    [1, 4],
    [2, 4],
    [3, 4],
    [2, 3],
  ],
  [
    [2, 4],
    [1, 3],
    [2, 3],
    [3, 3],
    [2, 2],
  ],
  [
    [2, 4],
    [2, 3],
    [1, 2],
    [2, 2],
    [3, 2],
    [2, 1],
  ],
  [
    [2, 3],
    [2, 2],
    [1, 1],
    [2, 1],
    [3, 1],
    [2, 0],
  ],
  [
    [2, 2],
    [2, 1],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [2, 1],
    [2, 0],
  ],
  [[2, 0]],
  [],
] as Frames;

const syncingFrames = [...arrowDownFrames, ...arrowUpFrames] as Frames;

const searchingFrames = [
  [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ],
  [
    [2, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [2, 2],
  ],
  [
    [3, 0],
    [2, 1],
    [3, 1],
    [4, 1],
    [3, 2],
  ],
  [
    [3, 1],
    [2, 2],
    [3, 2],
    [4, 2],
    [3, 3],
  ],
  [
    [3, 2],
    [2, 3],
    [3, 3],
    [4, 3],
    [3, 4],
  ],
  [
    [1, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [1, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
  [],
] as Frames;

const busyFrames = [
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [4, 1],
    [4, 2],
    [4, 3],
  ],
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [2, 3],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [3, 4],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [2, 3],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [2, 1],
    [4, 1],
    [4, 2],
    [4, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [3, 0],
    [4, 0],
    [4, 1],
    [4, 2],
  ],
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [2, 1],
    [4, 0],
    [4, 1],
    [4, 2],
  ],
] as Frames;

const savingFrames = [
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 0],
    [1, 1],
    [1, 2],
    [1, 3],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [2, 4],
    [3, 0],
    [3, 1],
    [3, 2],
    [3, 3],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
    [4, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
    [3, 0],
    [3, 1],
    [3, 2],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 0],
    [2, 1],
    [2, 2],
    [3, 0],
    [3, 1],
    [4, 0],
    [4, 1],
    [4, 2],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [2, 0],
    [2, 1],
    [3, 0],
    [4, 0],
    [4, 1],
    [4, 3],
    [3, 3],
    [2, 3],
    [1, 3],
    [0, 3],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [2, 0],
    [4, 0],
    [4, 2],
    [3, 2],
    [2, 2],
    [1, 2],
    [0, 2],
    [4, 3],
    [3, 3],
    [2, 3],
    [1, 3],
    [0, 3],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [4, 2],
    [3, 2],
    [2, 2],
    [1, 2],
    [0, 2],
    [4, 3],
    [3, 3],
    [2, 3],
    [1, 3],
    [0, 3],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [4, 2],
    [3, 2],
    [2, 2],
    [1, 2],
    [0, 2],
    [4, 3],
    [3, 3],
    [2, 3],
    [1, 3],
    [0, 3],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [4, 1],
    [3, 1],
    [2, 1],
    [1, 1],
    [0, 1],
    [4, 2],
    [3, 2],
    [2, 2],
    [1, 2],
    [0, 2],
    [4, 3],
    [3, 3],
    [2, 3],
    [1, 3],
    [0, 3],
    [4, 4],
    [3, 4],
    [2, 4],
    [1, 4],
    [0, 4],
  ],
] as Frames;

const initializingFrames = [
  [],
  [
    [1, 0],
    [3, 0],
  ],
  [
    [1, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
  ],
  [
    [1, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
  ],
  [
    [1, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [1, 3],
    [2, 3],
    [3, 3],
  ],
  [
    [1, 0],
    [3, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [1, 3],
    [2, 3],
    [3, 3],
    [2, 4],
  ],
  [
    [1, 2],
    [2, 1],
    [2, 2],
    [2, 3],
    [3, 2],
  ],
  [[2, 2]],
  [],
] as Frames;

const states = {
  importing: {
    frames: importingFrames,
    label: 'Importing',
  },
  syncing: {
    frames: syncingFrames,
    label: 'Syncing',
  },
  searching: {
    frames: searchingFrames,
    label: 'Searching',
  },
  busy: {
    frames: busyFrames,
    label: 'Busy',
  },
  saving: {
    frames: savingFrames,
    label: 'Saving',
  },
  initializing: {
    frames: initializingFrames,
    label: 'Initializing',
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MotionGridDemo = () => {
  const [state, setState] = useState<keyof typeof states>('importing');

  const runStates = async () => {
    while (true) {
      for (const state of Object.keys(states) as (keyof typeof states)[]) {
        setState(state);
        await sleep(3000);
      }
    }
  };

  useEffect(() => {
    runStates();
  }, []);

  return (
    <motion.button
      layout
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-3 h-11 gap-x-3 relative bg-primary inline-flex items-center justify-center"
    >
      <motion.div layout="preserve-aspect">
        <MotionGrid
          gridSize={[5, 5]}
          frames={states[state].frames}
          className="w-fit gap-0.5"
        >
          <MotionGridCells className="size-[3px] rounded-full aspect-square bg-white/20 dark:bg-black/20 data-[active=true]:bg-white/70 dark:data-[active=true]:bg-black/70" />
        </MotionGrid>
      </motion.div>

      <RotatingTextContainer
        text={states[state].label}
        className="absolute left-[46px] top-1/2 -translate-y-1/2"
      >
        <RotatingText
          layout="preserve-aspect"
          className="text-primary-foreground"
        />
      </RotatingTextContainer>

      <span className="invisible opacity-0" aria-hidden>
        {states[state].label}
      </span>
    </motion.button>
  );
};
