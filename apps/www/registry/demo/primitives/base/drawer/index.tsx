import {
  Drawer,
  DrawerTrigger,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/registry/primitives/base/drawer';

export const BaseDrawerDemo = () => {
  return (
    <Drawer>
      <DrawerTrigger className="bg-primary text-primary-foreground px-4 py-2 text-sm">
        Open Drawer
      </DrawerTrigger>

      <DrawerPortal>
        <DrawerBackdrop className="fixed inset-0 z-50 bg-black/80" />
        <DrawerViewport className="fixed inset-0 z-50 flex items-end justify-center">
          <DrawerPopup className="w-full max-h-[80vh] overflow-y-auto border-t bg-background p-6">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
            <DrawerContent className="mx-auto w-full max-w-md">
              <DrawerHeader>
                <DrawerTitle className="text-lg">Notifications</DrawerTitle>
                <DrawerDescription className="text-sm text-muted-foreground">
                  You are all caught up. Swipe down to dismiss.
                </DrawerDescription>
              </DrawerHeader>

              <DrawerFooter className="mt-6 flex justify-end">
                <DrawerClose className="bg-primary text-primary-foreground px-4 py-2 text-sm">
                  Close
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </DrawerPopup>
        </DrawerViewport>
      </DrawerPortal>
    </Drawer>
  );
};
