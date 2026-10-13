'use client';

import * as React from 'react';

import type { CheckGroup } from './item-indicator';

const IndicatorGroupContext = React.createContext<CheckGroup | null>(null);

const IndicatorModeContext = React.createContext<string | null>(null);

export { IndicatorGroupContext, IndicatorModeContext };
