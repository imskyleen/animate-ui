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
  mode: string;
  shown: Map<HTMLElement, Laid>;
};

type CollapseTimings = {
  duration: number;
  easing: string;
  labelDuration: number;
  labelEasing: string;
  blur: string;
  reduce: boolean;
};

// shadcn-vue marks some parts with data-slot only.
const PARTS = '[data-sidebar], [data-slot^="sidebar-"]';
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

function snapshotCollapse(root: HTMLElement): CollapseSnapshot | null {
  const mode = modeOf(root);
  if (mode === null) return null;
  const shown = new Map<HTMLElement, Laid>();
  for (const element of root.querySelectorAll<HTMLElement>(PARTS)) {
    const laid = laidOut(element);
    if (laid.display !== 'none') shown.set(element, laid);
  }
  return { mode, shown };
}

type Running = {
  animations: Animation[];
  restore: () => void;
  kept: Set<HTMLElement>;
};

const running = new WeakMap<HTMLElement, Running>();

function stopCollapse(root: HTMLElement) {
  const current = running.get(root);
  const shown = new Map<HTMLElement, { opacity: number; height: number }>();
  if (!current) return { shown, kept: new Set<HTMLElement>() };
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
  const blurred = { filter: timings.blur };
  const sharp = { filter: 'blur(0px)' };
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

  for (const label of labelsOf(root)) {
    if (reduce || ![...hidden, ...shown].some((part) => part.contains(label)))
      fade(label, collapsing ? 'forwards' : 'backwards');
    for (const element of [label, ...label.querySelectorAll<HTMLElement>('*')])
      if (getComputedStyle(element).textOverflow === 'ellipsis')
        setInline(element, 'text-overflow', 'clip');
  }

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
      transient.length
        ? undefined
        : new Promise((resolve) => setTimeout(resolve, duration)),
    )
    .then(() => {
      if (running.get(root) !== state) return;
      for (const animation of transient) animation.cancel();
      restore();
      state.animations = persistent;
      state.kept = new Set();
      state.restore = () => {};
    })
    .catch(() => {});
}

export {
  snapshotCollapse,
  runCollapse,
  stopCollapse,
  type CollapseSnapshot,
  type CollapseTimings,
};
