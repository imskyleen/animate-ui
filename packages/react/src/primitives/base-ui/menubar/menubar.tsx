'use client';

// Base UI's Menubar only lays out its menus: each one is a Menu, animated by
// Animate UI's Menu. Base UI marks moving from one open menu to another
// (hover or arrow keys) as instant, and the Menu Popup honours it, like a
// native menubar. Re-exported as is, so `@base-ui/react/menubar` imports can
// switch to Animate UI along with the menus.
export { Menubar } from '@base-ui/react/menubar';
