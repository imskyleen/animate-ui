import type { ComponentProps } from 'react';

import { VUE_COLORS } from '@/lib/vue';

const FILL_TRANSITION =
  'fill 300ms cubic-bezier(0.4, 0, 0.2, 1), fill-opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)';

export function VueLogo({
  colored = true,
  ...props
}: ComponentProps<'svg'> & { colored?: boolean }) {
  return (
    <svg viewBox="0 0 261.76 226.69" aria-hidden {...props}>
      <path
        d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"
        fill={colored ? VUE_COLORS.green : 'currentColor'}
        fillOpacity={colored ? 1 : 0.5}
        style={{ transition: FILL_TRANSITION }}
      />
      <path
        d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"
        fill={colored ? VUE_COLORS.slate : 'currentColor'}
        fillOpacity={1}
        style={{ transition: FILL_TRANSITION }}
      />
    </svg>
  );
}
