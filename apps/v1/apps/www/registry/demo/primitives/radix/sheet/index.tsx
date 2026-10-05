import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from '@/registry/primitives/radix/sheet';

interface RadixSheetDemoProps {
  side: 'right' | 'left' | 'top' | 'bottom';
}
export const RadixSheetDemo = ({ side }: RadixSheetDemoProps) => {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetPortal>
        <SheetOverlay className="fixed inset-0 z-50 bg-black/80" />

        <SheetContent
          side={side}
          className="gap-4 bg-background p-6 w-full size-full data-[side=right]:w-[350px] data-[side=left]:w-[350px] data-[side=top]:h-[350px] data-[side=bottom]:h-[350px] z-50"
        >
          <SheetHeader>
            <SheetTitle className="text-xl">Edit profile</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                placeholder="Pedro Duarte"
                className="p-2 border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                placeholder="@peduarte"
                className="p-2 border"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose
              type="submit"
              className="w-full p-2 text-center bg-primary text-primary-foreground"
            >
              Save changes
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};
