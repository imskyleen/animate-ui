import * as React from 'react';

import { Button } from '@workspace/ui/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  type DialogPopupProps,
} from '@/registry/components/base/dialog';
import { Label } from '@workspace/ui/components/ui/label';
import { Input } from '@workspace/ui/components/ui/input';

interface BaseDialogDemoProps {
  from: DialogPopupProps['from'];
  showCloseButton: boolean;
}

export const BaseDialogDemo = ({
  from,
  showCloseButton,
}: BaseDialogDemoProps) => {
  return (
    <Dialog>
      <form>
        <DialogTrigger
          render={<Button variant="outline">Open Dialog</Button>}
        />

        <DialogPopup
          from={from}
          showCloseButton={showCloseButton}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogPopup>
      </form>
    </Dialog>
  );
};
