import type { PopoverRenderProps } from 'react-aria-components';

const PLACEMENT_ORIGIN: Record<string, string> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

function originFor(placement: PopoverRenderProps['placement']) {
  const fallback = (placement && PLACEMENT_ORIGIN[placement]) ?? 'center';
  return `var(--trigger-anchor-point, ${fallback})`;
}

export { originFor };
