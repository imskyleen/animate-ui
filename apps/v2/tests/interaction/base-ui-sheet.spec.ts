import { sheetCases } from './sheet-cases';

// shadcn/ui's Base UI Sheet, on Animate UI's Base UI Dialog.
sheetCases('base-ui', [
  "-import { Dialog as SheetPrimitive } from '@base-ui/react/dialog';",
  "+import { Dialog as SheetPrimitive } from '@animate-ui/react/primitives/base-ui/dialog';",
]);
