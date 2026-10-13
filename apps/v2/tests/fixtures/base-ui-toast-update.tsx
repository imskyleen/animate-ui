'use client';

import * as React from 'react';

import { Toaster, toast } from '@/demos/base-ui/toast';

export default function BaseToastUpdateFixture() {
  const idRef = React.useRef<string>('');
  return (
    <Toaster progressBar>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            idRef.current = toast.add({
              type: 'loading',
              title: 'Saving',
            });
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() =>
            toast.update(idRef.current, {
              type: 'success',
              title: 'Saved',
              description:
                'Your changes to the event were saved, and everyone invited was told about the new time.',
            })
          }
        >
          Update
        </button>
        <button
          type="button"
          onClick={() =>
            toast.update(idRef.current, { type: 'error', title: 'Failed' })
          }
        >
          Fail
        </button>
        <button type="button" onClick={() => toast.close(idRef.current)}>
          Close
        </button>
        <button
          type="button"
          onClick={() => toast.add({ title: 'Short', timeout: 2000 })}
        >
          Short
        </button>
      </div>
    </Toaster>
  );
}
