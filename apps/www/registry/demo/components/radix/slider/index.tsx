import { Slider } from '@/registry/components/radix/slider';

export const RadixSliderDemo = () => {
  return (
    <div className="flex w-[60%] flex-col gap-8">
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        getAriaLabel={() => 'Volume'}
      />
      <Slider
        defaultValue={[25, 75]}
        max={100}
        step={1}
        getAriaLabel={(index) =>
          index === 0 ? 'Minimum price' : 'Maximum price'
        }
      />
    </div>
  );
};
