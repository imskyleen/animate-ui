'use client';

// Base UI's Menubar only lays out its menus: each one is a Menu, animated by
// Animate UI's Menu. It has no Animate UI v1 counterpart: its menus move like
// v1's Base UI Menu (a 250ms fade and scale, a highlight gliding behind the
// highlighted item), including when moving from one open menu to another.
// Re-exported as is, so `@base-ui/react/menubar` imports can switch to
// Animate UI along with the menus.
export { Menubar } from '@base-ui/react/menubar';
