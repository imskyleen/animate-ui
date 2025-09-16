import * as React from 'react';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  type AlertDialogPopupProps,
} from '@/registry/components/base/alert-dialog';
import { Button } from '@workspace/ui/components/ui/button';

interface BaseAlertDialogDemoProps {
  from: AlertDialogPopupProps['from'];
}

export const BaseAlertDialogDemo = ({ from }: BaseAlertDialogDemoProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline">Open Dialog</Button>}
      />
      <AlertDialogPopup from={from} className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
};
