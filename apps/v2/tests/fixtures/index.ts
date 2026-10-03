import type { ComponentType } from 'react';

import ProviderTempo from './provider-tempo';
import RadixAccordion from './radix-ui-accordion';

export const fixtures: Record<string, ComponentType> = {
  'provider-tempo': ProviderTempo,
  'radix-ui-accordion': RadixAccordion,
};
