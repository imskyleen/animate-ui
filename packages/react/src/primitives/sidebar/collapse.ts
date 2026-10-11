// What moves inside a sidebar as it collapses to icons or expands back
// (`data-collapsible="icon"` on an ancestor), on the collapse's own timing
// (`transition.collapse`), so nothing drifts from its edge:
//
// - Labels (a menu button's content but its leading icon, and group labels)
//   fade into a light blur in the first half of the collapse
//   (`transition.collapseLabel`), before the buttons get narrow, and fade
//   back in the last half of the expand, once they're nearly wide again.
//   Their ellipses are held off meanwhile (`text-overflow: clip`): a label
//   being cut by its narrowing button never flickers through `…`, `Mo…`,
//   `Model…`.
// - Parts the collapse hides (`group-data-[collapsible=icon]:hidden`: a
//   sub-menu, a menu action or badge, a whole group) fade out with the
//   labels while their height folds on the collapse's curve, kept shown
//   until then; expanding, they unfold the same way and fade in at the end.
//   The items below them move with the sidebar instead of jumping.
//
// Under reduced motion, labels and parts only fade (no blur, no folding).

/** A sidebar part and how it was laid out, before a toggle. */
type Laid = {
  display: string;
  position: string;
  height: number;
  paddingTop: string;
  paddingBottom: string;
  marginTop: string;
  marginBottom: string;
};

type CollapseSnapshot = {
  /** `data-collapsible` before the toggle. */
  mode: string;
  /** The parts shown before it. */
  shown: Map<HTMLElement, Laid>;
};

type CollapseTimings = {
  /** The collapse, ms and CSS easing. */
  duration: number;
  easing: string;
  /** Labels fading, ms and CSS easing. */
  labelDuration: number;
  labelEasing: string;
  /** The light blur labels fade into. */
  blur: string;
  reduce: boolean;
};

/** shadcn/ui's sidebar parts: what the collapse may hide. */
const PARTS = '[data-sidebar]';
const BUTTONS = '[data-sidebar="menu-button"]';
const GROUP_LABELS = '[data-sidebar="group-label"]';

const modeOf = (root: HTMLElement) =>
  root.closest('[data-collapsible]')?.getAttribute('data-collapsible') ?? null;

function laidOut(element: HTMLElement): Laid {
  const style = getComputedStyle(element);
  return {
    display: style.display,
    position: style.position,
    height: element.getBoundingClientRect().height,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    marginTop: style.marginTop,
    marginBottom: style.marginBottom,
  };
}

/** Before a toggle's DOM changes: what's shown, and the mode. */
function snapshotCollapse(root: HTMLElement): CollapseSnapshot | null {
  const mode = modeOf(root);
  // Mobile (a sheet): nothing collapses to icons.
  if (mode === null) return null;
  const shown = new Map<HTMLElement, Laid>();
  for (const element of root.querySelectorAll<HTMLElement>(PARTS)) {
    const laid = laidOut(element);
    if (laid.display !== 'none') shown.set(element, laid);
  }
  return { mode, shown };
}

/** What a toggle runs, to stop it when the next one comes. */
type Running = {
  animations: Animation[];
  /** Puts back the inline styles it set. */
  restore: () => void;
  /** Parts it keeps shown while they fold. */
  kept: Set<HTMLElement>;
};

const running = new WeakMap<HTMLElement, Running>();

/** Stops a toggle's motion; returns what its elements showed then. */
function stopCollapse(root: HTMLElement) {
  const current = running.get(root);
  const shown = new Map<HTMLElement, { opacity: number; height: number }>();
  if (!current) return { shown, kept: new Set<HTMLElement>() };
  // What its animations show right now (those still on: once a toggle is
  // over, only its faded labels are).
  const moved = new Set(
    current.animations.flatMap((animation) => {
      const target = (animation.effect as KeyframeEffect | null)?.target;
      return target instanceof HTMLElement ? [target] : [];
    }),
  );
  for (const element of moved)
    shown.set(element, {
      opacity: Number(getComputedStyle(element).opacity),
      height: element.getBoundingClientRect().height,
    });
  for (const animation of current.animations) animation.cancel();
  current.restore();
  running.delete(root);
  return { shown, kept: current.kept };
}

/** A label: a menu button's content but its leading icon, a group label. */
function labelsOf(root: HTMLElement) {
  const labels: HTMLElement[] = [
    ...root.querySelectorAll<HTMLElement>(GROUP_LABELS),
  ];
  for (const button of root.querySelectorAll<HTMLElement>(BUTTONS)) {
    const children = [...button.children] as HTMLElement[];
    const [first] = children;
    const leadingIcon =
      first &&
      (first.matches('svg, img, [data-slot="avatar"]') ||
        !first.textContent?.trim());
    labels.push(...(leadingIcon ? children.slice(1) : children));
  }
  return labels;
}

/** After a toggle's DOM changes: moves what changed with the collapse. */
function runCollapse(
  root: HTMLElement,
  before: CollapseSnapshot,
  timings: CollapseTimings,
) {
  const mode = modeOf(root);
  const collapsing = mode === 'icon' && before.mode !== 'icon';
  const expanding = before.mode === 'icon' && mode !== 'icon' && mode !== null;
  const interrupted = stopCollapse(root);
  if (!collapsing && !expanding) return;

  const { duration, easing, labelDuration, labelEasing, reduce } = timings;
  const blurred = reduce ? {} : { filter: timings.blur };
  const sharp = reduce ? {} : { filter: 'blur(0px)' };
  // Expanding, labels come back in the last part.
  const labelDelay = expanding && !reduce ? duration - labelDuration : 0;
  const animations: Animation[] = [];
  const restores: (() => void)[] = [];
  const kept = new Set<HTMLElement>();

  const setInline = (
    element: HTMLElement,
    property: string,
    value: string,
    priority = '',
  ) => {
    const previous = element.style.getPropertyValue(property);
    const previousPriority = element.style.getPropertyPriority(property);
    element.style.setProperty(property, value, priority);
    restores.push(() => {
      if (previous)
        element.style.setProperty(property, previous, previousPriority);
      else element.style.removeProperty(property);
    });
  };

  /** Fades out (collapsing) or in (expanding), from where it showed. */
  const fade = (element: HTMLElement, fill: FillMode) => {
    const from = interrupted.shown.get(element)?.opacity;
    animations.push(
      element.animate(
        collapsing
          ? [
              { opacity: from ?? 1, ...sharp },
              { opacity: 0, ...blurred },
            ]
          : [
              { opacity: from ?? 0, ...blurred },
              { opacity: 1, ...sharp },
            ],
        {
          duration: labelDuration,
          easing: labelEasing,
          delay: labelDelay,
          fill,
        },
      ),
    );
  };

  // Parts the collapse hides, or shows again: only the outermost ones move
  // (their content goes with them).
  const hidden: HTMLElement[] = [];
  const shown: HTMLElement[] = [];
  for (const element of root.querySelectorAll<HTMLElement>(PARTS)) {
    const display = getComputedStyle(element).display;
    const was = before.shown.get(element);
    if (collapsing && was && display === 'none') hidden.push(element);
    else if (
      expanding &&
      display !== 'none' &&
      (!was || interrupted.kept.has(element))
    )
      shown.push(element);
  }
  const outermost = (list: HTMLElement[]) =>
    list.filter(
      (element) =>
        !list.some((other) => other !== element && other.contains(element)),
    );

  if (!reduce) {
    for (const element of hidden) {
      // Kept shown until it has folded.
      setInline(
        element,
        'display',
        before.shown.get(element)!.display,
        'important',
      );
      kept.add(element);
    }
    for (const element of outermost(hidden)) {
      const laid = before.shown.get(element)!;
      fade(element, 'forwards');
      if (laid.position === 'absolute' || laid.position === 'fixed') continue;
      setInline(element, 'overflow', 'hidden');
      animations.push(
        element.animate(
          [
            {
              height: `${interrupted.shown.get(element)?.height ?? laid.height}px`,
              paddingTop: laid.paddingTop,
              paddingBottom: laid.paddingBottom,
              marginTop: laid.marginTop,
              marginBottom: laid.marginBottom,
            },
            {
              height: '0px',
              paddingTop: '0px',
              paddingBottom: '0px',
              marginTop: '0px',
              marginBottom: '0px',
            },
          ],
          { duration, easing, fill: 'forwards' },
        ),
      );
    }
    for (const element of outermost(shown)) {
      const laid = laidOut(element);
      fade(element, 'backwards');
      if (laid.position === 'absolute' || laid.position === 'fixed') continue;
      const from = interrupted.shown.get(element)?.height ?? 0;
      setInline(element, 'overflow', 'hidden');
      animations.push(
        element.animate(
          [
            {
              height: `${from}px`,
              ...(from === 0 && {
                paddingTop: '0px',
                paddingBottom: '0px',
                marginTop: '0px',
                marginBottom: '0px',
              }),
            },
            {
              height: `${laid.height}px`,
              paddingTop: laid.paddingTop,
              paddingBottom: laid.paddingBottom,
              marginTop: laid.marginTop,
              marginBottom: laid.marginBottom,
            },
          ],
          { duration, easing, fill: 'backwards' },
        ),
      );
    }
  }

  // Labels: no ellipsis while their button resizes.
  for (const label of labelsOf(root)) {
    // Inside a part that folds, its part fades for it.
    if (reduce || ![...hidden, ...shown].some((part) => part.contains(label)))
      fade(label, collapsing ? 'forwards' : 'backwards');
    for (const element of [label, ...label.querySelectorAll<HTMLElement>('*')])
      if (getComputedStyle(element).textOverflow === 'ellipsis')
        setInline(element, 'text-overflow', 'clip');
  }

  // Once it's all done, the inline styles go: the parts kept shown hide as
  // their own classes say, folded already. Labels faded out stay faded
  // (`fill: forwards`) until the next toggle.
  const persistent = collapsing
    ? animations.filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target instanceof HTMLElement && !kept.has(target);
      })
    : [];
  const transient = animations.filter((a) => !persistent.includes(a));
  const restore = () => {
    for (const undo of restores.splice(0).reverse()) undo();
  };
  const state: Running = { animations, restore, kept };
  running.set(root, state);
  void Promise.all(transient.map((animation) => animation.finished))
    .then(() =>
      // Not before the collapse is over (the widths still move).
      transient.length
        ? undefined
        : new Promise((resolve) => setTimeout(resolve, duration)),
    )
    .then(() => {
      if (running.get(root) !== state) return;
      for (const animation of transient) animation.cancel();
      restore();
      // What stays: the labels faded out.
      state.animations = persistent;
      state.kept = new Set();
      state.restore = () => {};
    })
    .catch(() => {
      // Cancelled: the next toggle took over.
    });
}

export {
  snapshotCollapse,
  runCollapse,
  stopCollapse,
  type CollapseSnapshot,
  type CollapseTimings,
};
