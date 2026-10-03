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
  ReducedMotionConfig,
  useMotionTokens,
  useShouldReduceMotion,
} from '../../../utils/motion';

// Same API as React Aria's TagList and Tag (shadcn/ui's combobox chips). A tag
// added to the list pops in; tags already there when the list mounts don't.
// Removing a tag is instant: React Aria drops it from the collection at once
// (and it's often Backspace), while its neighbours reflow.
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
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <ListMountedContext value={mountedRef}>
      <TagListPrimitive {...props} />
    </ListMountedContext>
  );
}

/** React Aria's props, plus Animate UI's `transition`. */
type TagProps = TagPrimitiveProps & {
  /** Transition of a tag being added. Defaults to `transition.change` (600ms). */
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
  const tokens = useMotionTokens();
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
      animate(
        element,
        {
          opacity: [0, 1],
          transform: [`scale(${reduce ? 1 : tokens.scale.enter})`, 'scale(1)'],
        },
        transition ?? tokens.transition.change,
      );
    },
    [ref, entering, reduce, tokens, transition],
  );

  return <TagPrimitive {...props} ref={setRef} />;
}

export { Tag, TagList, type TagProps, type TagListProps };
