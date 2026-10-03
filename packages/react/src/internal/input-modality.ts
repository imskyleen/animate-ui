'use client';

import * as React from 'react';

// The last input the user used, for "keyboard-driven changes are instant".
// Tracked on the document in the capture phase, so it sees keys a library
// stops (and a tab changed from a button outside the tabs too).
let lastInput: 'keyboard' | 'pointer' = 'pointer';
let listening = false;

function listen() {
  if (listening || typeof document === 'undefined') return;
  listening = true;
  document.addEventListener(
    'keydown',
    () => {
      lastInput = 'keyboard';
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      lastInput = 'pointer';
    },
    true,
  );
}

/** Starts tracking the input modality (once per page). */
function useInputModality() {
  React.useEffect(listen, []);
}

/** True when the last interaction was a key press. */
function isKeyboardInput() {
  return lastInput === 'keyboard';
}

export { useInputModality, isKeyboardInput };
