import * as React from 'react';

import { Button } from '@workspace/ui/components/ui/button';
import {
  Dialog,
  DialogPanel,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  type DialogPanelProps,
} from '@/registry/components/headless/dialog';
import { Label } from '@workspace/ui/components/ui/label';
import { Input } from '@workspace/ui/components/ui/input';

interface HeadlessDialogDemoProps {
  from: DialogPanelProps['from'];
  showCloseButton: boolean;
}

export const HeadlessDialogDemo = ({
  from,
  showCloseButton,
}: HeadlessDialogDemoProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        Open Dialog
      </Button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogPanel
          from={from}
          showCloseButton={showCloseButton}
          className="sm:max-w-[425px]"
        >
          <form className="flex flex-col gap-4">
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
                <Input
                  id="username-1"
                  name="username"
                  defaultValue="@peduarte"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogPanel>
      </Dialog>
    </div>
  );
};
