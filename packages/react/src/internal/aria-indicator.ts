'use client';

import * as React from 'react';

import type { CheckGroup } from './item-indicator';

// React Aria's SelectionIndicator (a list's or a menu's check), animated
// inside Animate UI's ListBox and Menu (see primitives/react-aria/list-box):
// these contexts tell it how its checks move.

/**
 * The checks of a ListBox, a Menu or a MenuSection share it: a single
 * selection's check glides between their items (`pop`).
 */
const IndicatorGroupContext = React.createContext<CheckGroup | null>(null);

/**
 * The selection mode of the menu item around a check ('single',
 * 'multiple'): a menu has no list state to read it from.
 */
const IndicatorModeContext = React.createContext<string | null>(null);

export { IndicatorGroupContext, IndicatorModeContext };
