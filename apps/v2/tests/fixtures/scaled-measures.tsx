'use client';

import AutoHeightDemo from '@/demos/animate-ui/auto-height';
import TabsDemo from '@/demos/animate-ui/tabs';
import ComboboxMultiple from '@/demos/base-ui/combobox-multiple';

export default function ScaledMeasuresFixture() {
  return (
    <div className="p-10">
      <div
        style={{ transform: 'scale(0.5)', transformOrigin: 'top left' }}
        className="flex w-[900px] flex-col gap-16"
      >
        <div data-testid="tabs">
          <TabsDemo />
        </div>
        <div data-testid="auto-height">
          <AutoHeightDemo />
        </div>
        <div data-testid="combobox">
          <ComboboxMultiple />
        </div>
      </div>
    </div>
  );
}
