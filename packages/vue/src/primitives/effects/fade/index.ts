import { createEntrance, type EntranceProps } from '../_entrance';

type FadeProps = EntranceProps & { initialOpacity?: number; opacity?: number };
type FadeListProps = FadeProps & { holdDelay?: number };

const { Single: Fade, List: Fades } = createEntrance(
  'Fade',
  {
    initialOpacity: { type: Number, default: 0 },
    opacity: { type: Number, default: 1 },
  },
  (p) => ({
    hidden: { opacity: p.initialOpacity },
    visible: { opacity: p.opacity },
  }),
  { remount: false },
);

export { Fade, Fades, type FadeProps, type FadeListProps };
