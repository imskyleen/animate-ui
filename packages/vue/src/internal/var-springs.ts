import {
  animate,
  frame,
  motionValue,
  type MotionValue,
  type Transition,
} from 'motion-v';

import { startOf } from './momentum';

type Tracked = {
  value: MotionValue<number>;
  target: number;
  written: string | null;
  scheduled: boolean;
};

type SpringOptions = {
  transition: Transition;
  reduce: boolean;
  /** Keeps the speed it has when the target changes on the way (a resize). */
  momentum?: boolean;
};

/**
 * CSS variables (in px) on an element that spring to their targets. A target
 * is either set from code or read from what the library renders (`follow`):
 * whatever it writes is taken as the next target and the shown value written
 * back before the frame is painted.
 */
function createVarSprings(
  node: HTMLElement,
  follow: string[],
  options: () => SpringOptions,
) {
  const tracked = new Map<string, Tracked>();

  const write = (name: string) => {
    const own = tracked.get(name);
    if (!own) return;
    const value = `${own.value.get()}px`;
    own.written = value;
    if (node.style.getPropertyValue(name) !== value)
      node.style.setProperty(name, value);
  };

  const set = (name: string, to: number) => {
    const own = tracked.get(name);
    if (!own) {
      const value = motionValue(to);
      tracked.set(name, {
        value,
        target: to,
        written: null,
        scheduled: false,
      });
      value.on('change', () => write(name));
      write(name);
      return;
    }
    if (own.target === to) return;
    own.target = to;
    const { reduce } = options();
    if (reduce) {
      own.value.stop();
      own.value.jump(to);
      write(name);
      return;
    }
    // Started on the frame loop, so it moves from the frame it's shown at.
    if (!own.scheduled) {
      own.scheduled = true;
      frame.update(() => {
        own.scheduled = false;
        retarget(own);
      });
    }
  };

  const retarget = (own: Tracked) => {
    const { transition, momentum } = options();
    const to = own.target;
    if (!momentum) {
      animate(own.value, to, transition);
      return;
    }
    const velocity = own.value.getVelocity() / 1000;
    own.value.stop();
    const offset = own.value.get() - to;
    const speed = startOf(transition, [offset], [velocity]);
    animate(own.value, to, { ...transition, velocity: -offset * speed * 1000 });
  };

  const check = () => {
    for (const name of follow) {
      const raw = node.style.getPropertyValue(name).trim();
      if (raw.endsWith('px') && raw !== tracked.get(name)?.written)
        set(name, parseFloat(raw));
    }
    for (const name of tracked.keys())
      if (node.style.getPropertyValue(name) !== tracked.get(name)!.written)
        write(name);
  };

  const observer = new MutationObserver(check);
  observer.observe(node, { attributes: true, attributeFilter: ['style'] });
  check();

  return {
    set,
    stop() {
      observer.disconnect();
      for (const own of tracked.values()) own.value.stop();
    },
  };
}

export { createVarSprings };
