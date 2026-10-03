'use client';

import * as React from 'react';
import { Toast } from '@animate-ui/react/primitives/base-ui/toast';

const viewport = {
  position: 'fixed',
  right: 16,
  width: 280,
  zIndex: 50,
} as const;
const toastStyle = {
  position: 'absolute',
  right: 0,
  width: '100%',
  padding: 12,
  background: 'white',
  border: '1px solid #ccc',
} as const;

function Toasts({ testId }: { testId: string }) {
  const { toasts } = Toast.useToastManager();
  return toasts.map((toast) => (
    <Toast.Root
      key={toast.id}
      toast={toast}
      data-testid={testId}
      swipeDirection={testId === 'top-toast' ? 'up' : undefined}
      style={() => ({
        ...toastStyle,
        ...(testId === 'top-toast' ? { top: 0 } : { bottom: 0 }),
        outline: '1px dashed gray',
      })}
    >
      <Toast.Content>
        <Toast.Title />
        <Toast.Close>Dismiss</Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

function AddButton({ label, title }: { label: string; title: string }) {
  const manager = Toast.useToastManager();
  return (
    <button type="button" onClick={() => manager.add({ title, timeout: 1000 })}>
      {label}
    </button>
  );
}

const topManager = Toast.createToastManager();

// API compatibility: the primitive must behave exactly like Base UI's.
export default function BaseToastFixture() {
  return (
    <div className="flex flex-col gap-4">
      <Toast.Provider>
        <AddButton label="Add" title="Bottom toast" />
        <Toast.Portal>
          <Toast.Viewport style={{ ...viewport, bottom: 16 }}>
            <Toasts testId="bottom-toast" />
          </Toast.Viewport>
        </Toast.Portal>
      </Toast.Provider>

      <Toast.Provider toastManager={topManager}>
        <button
          type="button"
          onClick={() => topManager.add({ title: 'Top toast', timeout: 0 })}
        >
          Add top
        </button>
        <Toast.Portal>
          <Toast.Viewport style={{ ...viewport, top: 16 }}>
            <Toasts testId="top-toast" />
          </Toast.Viewport>
        </Toast.Portal>
      </Toast.Provider>
    </div>
  );
}
