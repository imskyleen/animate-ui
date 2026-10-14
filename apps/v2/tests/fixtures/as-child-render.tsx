'use client';

import { Menu } from '@animate-ui/react/primitives/base-ui/menu';
import { Progress as BaseProgress } from '@animate-ui/react/primitives/base-ui/progress';
import { Slider as BaseSlider } from '@animate-ui/react/primitives/base-ui/slider';
import { Accordion } from '@animate-ui/react/primitives/radix-ui/accordion';
import { Collapsible } from '@animate-ui/react/primitives/radix-ui/collapsible';
import { DropdownMenu } from '@animate-ui/react/primitives/radix-ui/dropdown-menu';
import { Progress } from '@animate-ui/react/primitives/radix-ui/progress';
import { Slider } from '@animate-ui/react/primitives/radix-ui/slider';

const track = { width: 200, height: 8, background: '#ddd' } as const;

export default function AsChildRenderFixture() {
  return (
    <div className="flex flex-col items-start gap-6">
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Collapsible</Collapsible.Trigger>
        <Collapsible.Content asChild>
          <section data-testid="radix-collapsible">Collapsible body</section>
        </Collapsible.Content>
      </Collapsible.Root>

      <Accordion.Root type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Trigger>Accordion</Accordion.Trigger>
          <Accordion.Content asChild>
            <section data-testid="radix-accordion">Accordion body</section>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      <Progress.Root value={40} style={track}>
        <Progress.Indicator asChild style={{ transform: 'translateX(-60%)' }}>
          <section data-testid="radix-progress" style={{ height: 8 }} />
        </Progress.Indicator>
      </Progress.Root>

      <Slider.Root defaultValue={[30]} style={{ width: 200, height: 20 }}>
        <Slider.Track style={track}>
          <Slider.Range asChild>
            <section data-testid="radix-range" style={{ height: 8 }} />
          </Slider.Range>
        </Slider.Track>
        <Slider.Thumb asChild>
          <section data-testid="radix-thumb" aria-label="Volume" />
        </Slider.Thumb>
      </Slider.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>Radix menu</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content asChild>
            <section data-testid="radix-menu">
              <DropdownMenu.Item>Radix item</DropdownMenu.Item>
            </section>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <BaseProgress.Root value={40} aria-label="Base progress">
        <BaseProgress.Track style={track}>
          <BaseProgress.Indicator
            render={<section data-testid="base-progress" />}
          />
        </BaseProgress.Track>
      </BaseProgress.Root>

      <BaseSlider.Root defaultValue={30} aria-label="Base slider">
        <BaseSlider.Control style={{ width: 200, height: 20 }}>
          <BaseSlider.Track style={track}>
            <BaseSlider.Indicator
              render={<section data-testid="base-range" />}
            />
            <BaseSlider.Thumb render={<section data-testid="base-thumb" />} />
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>

      <Menu.Root>
        <Menu.Trigger>Base menu</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup render={<section data-testid="base-menu" />}>
              <Menu.Item>Base item</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
