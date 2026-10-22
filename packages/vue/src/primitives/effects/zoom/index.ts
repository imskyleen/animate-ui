import { createEntrance, type EntranceProps } from '../_entrance';

type ZoomProps = EntranceProps & { initialScale?: number; scale?: number };
type ZoomListProps = ZoomProps & { holdDelay?: number };

const { Single: Zoom, List: Zooms } = createEntrance(
  'Zoom',
  {
    initialScale: { type: Number, default: 0.5 },
    scale: { type: Number, default: 1 },
  },
  (p, reduce) =>
    reduce.value
      ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
      : { hidden: { scale: p.initialScale }, visible: { scale: p.scale } },
);

export { Zoom, Zooms, type ZoomProps, type ZoomListProps };
