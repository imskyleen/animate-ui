'use client';

import { useSyncExternalStore } from 'react';

import type { LibraryId } from './libraries';

// The library the reader last picked in a primitive's tabs. Sidebar links
// open each primitive in it, like shadcn/ui remembers its base.
const KEY = 'animate-ui:library';
const EVENT = 'animate-ui:library-change';

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function read(): LibraryId | null {
  try {
    return localStorage.getItem(KEY) as LibraryId | null;
  } catch {
    return null;
  }
}

export function usePreferredLibrary() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export function setPreferredLibrary(library: LibraryId) {
  try {
    localStorage.setItem(KEY, library);
  } catch {
    // Private mode: the choice just isn't remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}
