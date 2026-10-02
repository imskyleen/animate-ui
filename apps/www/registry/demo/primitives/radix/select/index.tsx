import {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from '@/registry/primitives/radix/select';

interface RadixSelectDemoProps {
  position?: 'popper' | 'item-aligned';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
}

const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple'];
const CITRUS = ['Lemon', 'Orange', 'Grapefruit'];

function Item({ children }: { children: string }) {
  return (
    <SelectItem
      value={children.toLowerCase()}
      className="flex items-center justify-between gap-4 px-2 py-1 text-sm outline-none data-[highlighted]:bg-accent"
    >
      <SelectItemText>{children}</SelectItemText>
      <SelectItemIndicator>✓</SelectItemIndicator>
    </SelectItem>
  );
}

export function RadixSelectDemo({
  position,
  side,
  sideOffset,
  align,
}: RadixSelectDemoProps) {
  return (
    <Select>
      <SelectTrigger
        aria-label="Fruit"
        className="flex w-44 items-center justify-between border px-3 py-1.5 text-sm"
      >
        <SelectValue placeholder="Select a fruit" />
        <SelectIcon>▾</SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          position={position}
          side={side}
          sideOffset={sideOffset}
          align={align}
          className="z-50 min-w-(--radix-select-trigger-width) border bg-background"
        >
          <SelectViewport className="p-1">
            <SelectGroup>
              <SelectLabel className="px-2 py-1 text-xs text-muted-foreground">
                Fruits
              </SelectLabel>
              {FRUITS.map((fruit) => (
                <Item key={fruit}>{fruit}</Item>
              ))}
            </SelectGroup>
            <SelectSeparator className="my-1 h-px bg-border" />
            <SelectGroup>
              <SelectLabel className="px-2 py-1 text-xs text-muted-foreground">
                Citrus
              </SelectLabel>
              {CITRUS.map((fruit) => (
                <Item key={fruit}>{fruit}</Item>
              ))}
            </SelectGroup>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}
