import type { ComponentProps } from 'react';

import { VUE_COLORS } from '@/lib/vue';

export function VueLogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 261.76 226.69" aria-hidden {...props}>
      <path
        d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"
        fill={VUE_COLORS.green}
      />
      <path
        d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z"
        fill={VUE_COLORS.slate}
      />
    </svg>
  );
}
