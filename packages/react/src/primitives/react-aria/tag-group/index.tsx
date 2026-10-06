'use client';

import * as React from 'react';
import {
  Tag as TagPrimitive,
  TagGroup as TagGroupPrimitive,
  TagList as TagListPrimitive,
  type TagGroupProps as TagGroupPrimitiveProps,
  type TagListProps as TagListPrimitiveProps,
  type TagProps as TagPrimitiveProps,
} from 'react-aria-components';
import { animate, type Transition } from 'motion/react';

import {
  ReducedMotionConfig,
  useShouldReduceMotion,
  useTempoTransition,
} from '../../../utils/motion';
import { mergeRefs } from '../../../internal/anchored';
import {
  CHIP_EXIT_TRANSITION,
  CHIP_SCALE,
  CHIP_TRANSITION,
  PLACEHOLDER_TRANSITION,
  REFLOW_STYLE,
  REFLOW_TRANSITION,
  layoutBox,
  useReflow,
  type Reflow,
} from '../../../internal/reflow';

// Same API as React Aria's TagGroup, TagList and Tag (shadcn/ui's combobox
// chips). Animate UI v1 had no tag group: a tag added to the list pops in,
// opacity from 0 and scale from 0.5, on the popovers' spring (stiffness 300,
// damping 25), and a removed one shrinks out in place, out of the flow, in
// 0.15s. The others (an input after them too) glide to make room or close
// the gap, on a quick spring (internal/reflow), and the input's placeholder
// showing up fades in once the input is there. Tags already there when the
// list mounts don't animate.
//
// Tags are collection items: React Aria renders the TagList and the tags the
// user writes in a hidden tree, to build its collection, then renders the
// real elements from it. So the entrance is played from the ref, when the
// real element attaches, and the exit when it detaches; and the TagGroup,
// around both trees, holds what the tags and the real list share.

/** What the hidden tree's tags and the real TagList share. */
type GroupMotion = {
  reflow: Reflow;
  /** The real TagList element: its tags are laid out in its box. */
  list: React.RefObject<HTMLElement | null>;
};

const GroupMotionContext = React.createContext<GroupMotion | null>(null);

/** React Aria's props. */
type TagGroupProps = TagGroupPrimitiveProps;

function TagGroup(props: TagGroupProps & React.RefAttributes<HTMLDivElement>) {
  const listRef = React.useRef<HTMLElement | null>(null);
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition(REFLOW_TRANSITION);
  const fade = useTempoTransition(PLACEHOLDER_TRANSITION);
  const reflow = useReflow({
    // The list, or the element laying its tags out when it's `display:
    // contents` (shadcn/ui's, beside the input).
    container: () => listRef.current && layoutBox(listRef.current),
    glide,
    fade,
    reduce,
  });
  const motion = React.useMemo(() => ({ reflow, list: listRef }), [reflow]);

  return (
    <GroupMotionContext value={motion}>
      <style href={REFLOW_STYLE.href} precedence="animate-ui">
        {REFLOW_STYLE.css}
      </style>
      <TagGroupPrimitive {...props} />
    </GroupMotionContext>
  );
}

type TagListMotion = {
  /** True once the TagList has mounted: later tags were just added. */
  mounted: React.RefObject<boolean>;
  reflow: Reflow;
};

const TagListContext = React.createContext<TagListMotion | null>(null);

/** React Aria's props. */
type TagListProps<T> = TagListPrimitiveProps<T>;

function TagList<T extends object>({
  ref,
  ...props
}: TagListProps<T> & React.RefAttributes<HTMLDivElement>) {
  const group = React.use(GroupMotionContext);
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
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition(REFLOW_TRANSITION);
  const fade = useTempoTransition(PLACEHOLDER_TRANSITION);
  // In React Aria's own TagGroup: a removed tag's parent box.
  const ownReflow = useReflow({
    container: () => null,
    glide,
    fade,
    reduce,
  });
  const mergedRef = React.useMemo(
    () => mergeRefs<HTMLElement>(ref as React.Ref<HTMLElement>, group?.list),
    [ref, group],
  );
  const motion = React.useMemo(
    () => ({ mounted: mountedRef, reflow: group?.reflow ?? ownReflow }),
    [group, ownReflow],
  );

  return (
    <TagListContext value={motion}>
      <TagListPrimitive {...props} ref={mergedRef} />
    </TagListContext>
  );
}

/** React Aria's props, plus Animate UI's `transition` and `exitTransition`. */
type TagProps = TagPrimitiveProps & {
  /**
   * Transition of a tag being added: it pops in from half its size. Defaults
   * to a spring (stiffness 300, damping 25).
   */
  transition?: Transition;
  /**
   * Transition of a removed tag shrinking out. Defaults to 0.15s on a strong
   * ease-out.
   */
  exitTransition?: Transition;
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
  exitTransition,
  ref,
  ...props
}: TagProps & React.RefAttributes<HTMLDivElement>) {
  const list = React.use(TagListContext);
  const [entering] = React.useState(() => {
    const added = list?.mounted.current === true;
    // Where the others are, before this tag pushes them.
    if (added) list?.reflow.measure();
    return added;
  });
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? CHIP_TRANSITION);
  const out = useTempoTransition(exitTransition ?? CHIP_EXIT_TRANSITION);
  // Read when the tag enters or leaves: a new transition object each render
  // (a tempo) mustn't change the ref callback.
  const motionRef = React.useRef({ spring, out, reduce });
  React.useLayoutEffect(() => {
    motionRef.current = { spring, out, reduce };
  });
  const playedRef = React.useRef(false);
  const elementRef = React.useRef<HTMLElement | null>(null);
  // Removed from the collection: React Aria removes the real tag right after,
  // once the page around it changed (an input's placeholder showing up).
  // Where everything is, before.
  React.useLayoutEffect(() => () => list?.reflow.measure(), [list]);

  // Memoized, so React Aria doesn't update the collection node on each render.
  const setRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
      if (element === null) {
        // Detached: removed from the list, it leaves through a copy while the
        // others close the gap. (React Aria also detaches its collection's
        // own node, and a handed-over ref detaches too: still on the page,
        // nothing leaves.)
        const last = elementRef.current;
        if (last)
          list?.reflow.leave(
            last,
            motionRef.current.out,
            motionRef.current.reduce,
          );
        return;
      }
      // The collection's own (non-DOM) nodes go through here too.
      if (!(element instanceof HTMLElement)) return;
      elementRef.current = element;
      if (!entering || playedRef.current) return;
      playedRef.current = true;
      const from = `scale(${reduce ? 1 : CHIP_SCALE})`;
      // Hidden on this very frame: the animation only starts on the next one.
      element.style.opacity = '0';
      element.style.transform = from;
      animate(
        element,
        { opacity: [0, 1], transform: [from, 'scale(1)'] },
        motionRef.current.spring,
      );
      list?.reflow.settle();
    },
    [ref, entering, reduce, list],
  );

  return <TagPrimitive {...props} ref={setRef} />;
}

export {
  Tag,
  TagGroup,
  TagList,
  type TagGroupProps,
  type TagProps,
  type TagListProps,
};
