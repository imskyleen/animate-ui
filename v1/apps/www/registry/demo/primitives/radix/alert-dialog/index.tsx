import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogCancel,
  AlertDialogAction,
  type AlertDialogFlipDirection,
} from '@/registry/primitives/radix/alert-dialog';

type RadixAlertDialogDemoProps = {
  from: AlertDialogFlipDirection;
};

export const RadixAlertDialogDemo = ({ from }: RadixAlertDialogDemoProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-primary text-primary-foreground px-4 py-2 text-sm">
        Open Dialog
      </AlertDialogTrigger>

      <AlertDialogPortal>
        <AlertDialogOverlay className="fixed inset-0 z-50 bg-black/80" />
        <AlertDialogContent
          from={from}
          className="sm:max-w-md fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50 border bg-background p-6"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex justify-end gap-2">
            <AlertDialogCancel className="bg-accent text-accent-foreground px-4 py-2 text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-primary text-primary-foreground px-4 py-2 text-sm">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};
