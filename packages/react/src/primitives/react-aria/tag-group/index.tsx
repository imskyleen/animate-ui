'use client';

import * as React from 'react';
import {
  Tag as TagPrimitive,
  TagList as TagListPrimitive,
  type TagListProps as TagListPrimitiveProps,
  type TagProps as TagPrimitiveProps,
} from 'react-aria-components';
import { animate, type Transition } from 'motion/react';

import {
  motionTokens,
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';

// Same API as React Aria's TagList and Tag (shadcn/ui's combobox chips). Animate
// UI v1 had no tag group: a tag added to the list pops in, opacity from 0
// and scale from 0.5, on the popovers' spring (stiffness 300, damping 25). Tags already there when the list
// mounts don't. Removing a tag is instant: React Aria drops it from the
// collection at once (and it's often Backspace), while its neighbours reflow.
//
// Tags are collection items: the component the user renders only builds the
// collection, and React Aria renders the real element later. So the entrance
// is played from the ref, when the real element attaches.

/** True once the TagList has mounted: later tags were just added. */
const ListMountedContext = React.createContext<React.RefObject<boolean> | null>(
  null,
);

/** React Aria's props. */
type TagListProps<T> = TagListPrimitiveProps<T>;

function TagList<T extends object>(
  props: TagListProps<T> & React.RefAttributes<HTMLDivElement>,
) {
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    // React Aria renders the items once its collection is built, after the
    // list mounted (and again when a server-rendered page hydrates): tags
    // rendered before the list has painted twice were already there.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        mountedRef.current = true;
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      mountedRef.current = false;
    };
  }, []);

  return (
    <ListMountedContext value={mountedRef}>
      <TagListPrimitive {...props} />
    </ListMountedContext>
  );
}

/** The popovers' spring. */
const TAG_TRANSITION: Transition = motionTokens.spring.pop;

/** React Aria's props, plus Animate UI's `transition`. */
type TagProps = TagPrimitiveProps & {
  /**
   * Transition of a tag being added. Defaults to a spring (stiffness 300,
   * damping 25).
   */
  transition?: Transition;
};

function Tag(props: TagProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <ReducedMotionConfig>
      <AnimatedTag {...props} />
    </ReducedMotionConfig>
  );
}

// Inside ReducedMotionConfig, so useShouldReduceMotion() sees it.
function AnimatedTag({
  transition,
  ref,
  ...props
}: TagProps & React.RefAttributes<HTMLDivElement>) {
  const list = React.use(ListMountedContext);
  const [entering] = React.useState(() => list?.current === true);
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? TAG_TRANSITION);
  // Read when the tag enters: a new transition object each render (a tempo)
  // mustn't change the ref callback.
  const springRef = React.useRef(spring);
  React.useLayoutEffect(() => {
    springRef.current = spring;
  });
  const playedRef = React.useRef(false);

  // Memoized, so React Aria doesn't update the collection node on each render.
  const setRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
      // The collection's own (non-DOM) nodes go through here too.
      if (!entering || playedRef.current || !(element instanceof HTMLElement))
        return;
      playedRef.current = true;
      const from = `scale(${reduce ? 1 : 0.5})`;
      // Hidden on this very frame: the animation only starts on the next one.
      element.style.opacity = '0';
      element.style.transform = from;
      animate(
        element,
        { opacity: [0, 1], transform: [from, 'scale(1)'] },
        springRef.current,
      );
    },
    [ref, entering, reduce],
  );

  return <TagPrimitive {...props} ref={setRef} />;
}

export { Tag, TagList, type TagProps, type TagListProps };
