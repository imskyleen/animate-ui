import * as React from 'react';
import { type MotionValue } from 'motion/react';

function useMotionValueState(motionValue: MotionValue): number {
  return React.useSyncExternalStore(
    (callback) => {
      const unsub = motionValue.on('change', callback);
      return unsub;
    },
    () => motionValue.get(),
    () => motionValue.get(),
  );
}

export { useMotionValueState };
