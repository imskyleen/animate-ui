'use client';

import {
  Toaster,
  useToastManager,
  type ToastPosition,
} from '@/registry/components/base/toast';
import { Button } from '@workspace/ui/components/ui/button';

interface BaseToastDemoProps {
  position?: ToastPosition;
}

export const BaseToastDemo = ({ position }: BaseToastDemoProps) => {
  return (
    <Toaster position={position}>
      <ShowToastButton />
    </Toaster>
  );
};

function ShowToastButton() {
  const toastManager = useToastManager();

  function showToast() {
    const id = toastManager.add({
      title: 'Event created',
      description: 'Sunday, December 03, 2023 at 9:00 AM',
      actionProps: {
        children: 'Undo',
        onClick: () => toastManager.close(id),
      },
    });
  }

  return (
    <Button variant="outline" onClick={showToast}>
      Show toast
    </Button>
  );
}
