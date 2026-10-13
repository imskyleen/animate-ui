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

type GroupMotion = {
  reflow: Reflow;
  list: React.RefObject<HTMLElement | null>;
};

const GroupMotionContext = React.createContext<GroupMotion | null>(null);

type TagGroupProps = TagGroupPrimitiveProps;

function TagGroup(props: TagGroupProps & React.RefAttributes<HTMLDivElement>) {
  const listRef = React.useRef<HTMLElement | null>(null);
  const reduce = useShouldReduceMotion();
  const glide = useTempoTransition(REFLOW_TRANSITION);
  const fade = useTempoTransition(PLACEHOLDER_TRANSITION);
  const reflow = useReflow({
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
  mounted: React.RefObject<boolean>;
  reflow: Reflow;
};

const TagListContext = React.createContext<TagListMotion | null>(null);

type TagListProps<T> = TagListPrimitiveProps<T>;

function TagList<T extends object>({
  ref,
  ...props
}: TagListProps<T> & React.RefAttributes<HTMLDivElement>) {
  const group = React.use(GroupMotionContext);
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
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

type TagProps = TagPrimitiveProps & {
  transition?: Transition;
  exitTransition?: Transition;
};

function Tag(props: TagProps & React.RefAttributes<HTMLDivElement>) {
  return (
    <ReducedMotionConfig>
      <AnimatedTag {...props} />
    </ReducedMotionConfig>
  );
}

function AnimatedTag({
  transition,
  exitTransition,
  ref,
  ...props
}: TagProps & React.RefAttributes<HTMLDivElement>) {
  const list = React.use(TagListContext);
  const [entering] = React.useState(() => {
    const added = list?.mounted.current === true;
    if (added) list?.reflow.measure();
    return added;
  });
  const reduce = useShouldReduceMotion();
  const spring = useTempoTransition(transition ?? CHIP_TRANSITION);
  const out = useTempoTransition(exitTransition ?? CHIP_EXIT_TRANSITION);
  const motionRef = React.useRef({ spring, out, reduce });
  React.useLayoutEffect(() => {
    motionRef.current = { spring, out, reduce };
  });
  const playedRef = React.useRef(false);
  const elementRef = React.useRef<HTMLElement | null>(null);
  React.useLayoutEffect(() => () => list?.reflow.measure(), [list]);

  const setRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      if (typeof ref === 'function') ref(element);
      else if (ref) ref.current = element;
      if (element === null) {
        const last = elementRef.current;
        if (last)
          list?.reflow.leave(
            last,
            motionRef.current.out,
            motionRef.current.reduce,
          );
        return;
      }
      if (!(element instanceof HTMLElement)) return;
      elementRef.current = element;
      if (!entering || playedRef.current) return;
      playedRef.current = true;
      const from = `scale(${reduce ? 1 : CHIP_SCALE})`;
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
