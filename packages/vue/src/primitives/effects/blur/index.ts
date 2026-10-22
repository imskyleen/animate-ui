import { createEntrance, type EntranceProps } from '../_entrance';

type BlurProps = EntranceProps & { initialBlur?: number; blur?: number };
type BlurListProps = BlurProps & { holdDelay?: number };

const { Single: Blur, List: Blurs } = createEntrance(
  'Blur',
  {
    initialBlur: { type: Number, default: 10 },
    blur: { type: Number, default: 0 },
  },
  (p) => ({
    hidden: { filter: `blur(${p.initialBlur}px)` },
    visible: { filter: `blur(${p.blur}px)` },
  }),
);

export { Blur, Blurs, type BlurProps, type BlurListProps };
