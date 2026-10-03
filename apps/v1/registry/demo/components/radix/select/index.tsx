import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/components/radix/select';

interface RadixSelectDemoProps {
  position?: 'popper' | 'item-aligned';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const RadixSelectDemo = ({
  position,
  side,
  sideOffset,
  align,
  alignOffset,
}: RadixSelectDemoProps) => {
  return (
    <Select>
      <SelectTrigger aria-label="Fruit" className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent
        position={position}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Citrus</SelectLabel>
          <SelectItem value="lemon">Lemon</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
          <SelectItem value="grapefruit" disabled>
            Grapefruit
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
