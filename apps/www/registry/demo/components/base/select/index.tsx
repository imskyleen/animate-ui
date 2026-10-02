import {
  Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectPanel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/registry/components/base/select';

const FRUITS = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
  { label: 'Grapes', value: 'grapes' },
  { label: 'Pineapple', value: 'pineapple' },
];

const CITRUS = [
  { label: 'Lemon', value: 'lemon' },
  { label: 'Orange', value: 'orange' },
  { label: 'Grapefruit', value: 'grapefruit', disabled: true },
];

interface BaseSelectDemoProps {
  alignItemWithTrigger?: boolean;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
  alignOffset?: number;
}

export const BaseSelectDemo = ({
  alignItemWithTrigger,
  side,
  sideOffset,
  align,
  alignOffset,
}: BaseSelectDemoProps) => {
  return (
    <Select items={[...FRUITS, ...CITRUS]}>
      <SelectTrigger aria-label="Fruit" className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectPanel
        alignItemWithTrigger={alignItemWithTrigger}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
      >
        <SelectGroup>
          <SelectGroupLabel>Fruits</SelectGroupLabel>
          {FRUITS.map((fruit) => (
            <SelectItem key={fruit.value} value={fruit.value}>
              {fruit.label}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Citrus</SelectGroupLabel>
          {CITRUS.map((fruit) => (
            <SelectItem
              key={fruit.value}
              value={fruit.value}
              disabled={fruit.disabled}
            >
              {fruit.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectPanel>
    </Select>
  );
};
