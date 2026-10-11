import { sheetCases } from './sheet-cases';

// shadcn/ui's Radix Sheet, on Animate UI's Radix Dialog.
sheetCases('radix-ui', [
  "-import { Dialog as SheetPrimitive } from 'radix-ui';",
  "+import { Dialog as SheetPrimitive } from '@animate-ui/react/primitives/radix-ui';",
]);
