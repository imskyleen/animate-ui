'use client';

import { Button } from '@animate-ui/react/primitives/buttons/button';
import {
  ReducedMotionConfig,
  useMotionTokens,
} from '@animate-ui/react/utils/motion';
import { RefreshIcon, SlidersHorizontalIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { AnimatePresence, motion } from 'motion/react';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from 'react';

import { InCodeTabsContext } from './codeblock';
import {
  ControlsPanel,
  controlsToProps,
  type Controls,
} from './controls-panel';
import { CopyButton, getPreText } from './copy-button';

const COLLAPSED_HEIGHT = 160;
const PANEL_SIZE = 250;

// Below md the controls open under the demo, as in v1.
const MOBILE_QUERY = '(max-width: 767px)';
const subscribeMobile = (onChange: () => void) => {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};
const useIsMobile = () =>
  useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );

const toolbarButton =
  'flex size-8 items-center justify-center rounded-lg bg-accent text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';

/**
 * The demo, then its code below it (like shadcn/ui): collapsed to a few
 * lines behind a "View code" button, which unfolds the rest. Both sit in
 * Animate UI's accent frame; the replay button remounts the demo.
 *
 * A demo with `controls` gets a sliders button that opens them on the right
 * (under the demo on mobile): the demo re-renders with the values as props.
 */
export function PreviewFrame({
  children,
  code,
  fullBleed = false,
  demo: Demo,
  controls: initialControls,
}: {
  /** The demo, when it has no controls. */
  children?: ReactNode;
  code: ReactNode;
  fullBleed?: boolean;
  /** A demo with controls: rendered here with their values. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  demo?: ComponentType<any>;
  controls?: Controls;
}) {
  const [run, setRun] = useState(0);
  const [controls, setControls] = useState(initialControls);
  const [controlsOpen, setControlsOpen] = useState(false);
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const codeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { transition } = useMotionTokens();
  const panelId = useId();
  // Short code shows whole, without the button.
  const [fits, setFits] = useState(false);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () =>
      setFits(content.scrollHeight <= COLLAPSED_HEIGHT + 24);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  const open = expanded || fits;

  return (
    <ReducedMotionConfig>
      <div className="not-prose my-6 flex flex-col gap-1 rounded-xl bg-accent p-1 first:mt-0">
        <div
          data-slot="preview"
          className={cn(
            'relative flex flex-col rounded-lg bg-background md:flex-row',
            fullBleed && 'overflow-hidden',
          )}
        >
          <div
            data-slot="preview-stage"
            className={cn(
              'relative flex min-w-0 items-center justify-center md:flex-1',
              fullBleed ? 'h-[420px]' : 'min-h-[400px] px-6 py-16 sm:px-10',
            )}
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <Button
                type="button"
                aria-label="Replay"
                title="Replay"
                hoverScale={1.05}
                onClick={() => setRun((r) => r + 1)}
                className={toolbarButton}
              >
                <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} size={14} />
              </Button>
              {controls && (
                <Button
                  type="button"
                  aria-label="Controls"
                  title="Controls"
                  aria-expanded={controlsOpen}
                  aria-controls={panelId}
                  hoverScale={1.05}
                  onClick={() => setControlsOpen((o) => !o)}
                  className={cn(
                    toolbarButton,
                    controlsOpen && 'text-foreground',
                  )}
                >
                  <HugeiconsIcon
                    icon={SlidersHorizontalIcon}
                    strokeWidth={2}
                    size={14}
                  />
                </Button>
              )}
            </div>
            <div
              key={run}
              className={cn(
                'flex w-full items-center justify-center',
                fullBleed && 'absolute inset-0',
              )}
            >
              {Demo && controls ? (
                <Demo {...controlsToProps(controls)} />
              ) : (
                children
              )}
            </div>
          </div>

          {controls && (
            <motion.div
              id={panelId}
              data-slot="preview-controls"
              data-state={controlsOpen ? 'open' : 'closed'}
              initial={false}
              animate={{
                width: isMobile ? '100%' : controlsOpen ? PANEL_SIZE : 0,
                height: isMobile ? (controlsOpen ? PANEL_SIZE : 0) : 'auto',
                opacity: controlsOpen ? 1 : 0,
              }}
              transition={
                controlsOpen ? transition.disclosure : transition.exit
              }
              inert={!controlsOpen}
              className="relative shrink-0 overflow-hidden"
            >
              <div className="absolute inset-y-0 left-0 p-1.5 max-md:inset-x-0 max-md:pt-0 md:w-[250px] md:pl-0">
                <ControlsPanel
                  controls={controls}
                  onControlsChange={setControls}
                />
              </div>
            </motion.div>
          )}
        </div>

        <div
          ref={codeRef}
          data-slot="preview-code"
          className="relative overflow-hidden rounded-lg bg-background"
        >
          <div className="absolute top-1.5 right-1.5 z-2">
            <CopyButton getText={() => getPreText(codeRef.current)} />
          </div>
          <motion.div
            initial={false}
            animate={{ height: open ? 'auto' : COLLAPSED_HEIGHT }}
            transition={open ? transition.disclosure : transition.exit}
            className="overflow-hidden [&_[data-slot=codeblock-viewport]]:max-h-[600px]"
            inert={!open}
          >
            <div ref={contentRef}>
              <InCodeTabsContext value>{code}</InCodeTabsContext>
            </div>
          </motion.div>
          <AnimatePresence initial={false}>
            {!open && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-background/20 to-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: transition.fade }}
                exit={{ opacity: 0, transition: transition.exit }}
              >
                <Button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  View code
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ReducedMotionConfig>
  );
}
