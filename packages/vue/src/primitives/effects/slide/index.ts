import type { PropType } from 'vue';

import { createEntrance, type EntranceProps } from '../_entrance';

type SlideDirection = 'up' | 'down' | 'left' | 'right';

type SlideProps = EntranceProps & {
  direction?: SlideDirection;
  offset?: number;
};
type SlideListProps = SlideProps & { holdDelay?: number };

const { Single: Slide, List: Slides } = createEntrance(
  'Slide',
  {
    direction: { type: String as PropType<SlideDirection>, default: 'up' },
    offset: { type: Number, default: 100 },
  },
  (p, reduce) => {
    if (reduce.value)
      return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    const direction = p.direction as SlideDirection;
    const offset = p.offset as number;
    const axis = direction === 'up' || direction === 'down' ? 'y' : 'x';
    return {
      hidden: {
        [axis]:
          direction === 'right' || direction === 'down' ? -offset : offset,
      },
      visible: { [axis]: 0 },
    };
  },
);

export {
  Slide,
  Slides,
  type SlideProps,
  type SlideListProps,
  type SlideDirection,
};
