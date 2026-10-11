'use client';

import * as React from 'react';

import * as Radix from '@/demos/radix-ui/toggle-group';
import * as Base from '@/demos/base-ui/toggle-group';
import * as Aria from '@/demos/react-aria/toggle-group';

// The toggle groups' surfaces in every layout the demos' component takes:
// both variants, items touching (`spacing={0}`) or apart, in a row or a
// column, left to right or right to left, with several items selected or
// one. Each group is `data-testid="<lib>-<variant>-<spacing>-<orientation>
// [-rtl][-single]"`.

type Variant = 'default' | 'outline';
type Orientation = 'horizontal' | 'vertical';

type GroupProps = {
  /** Radix UI takes its direction as a prop (it sets `dir` on its root). */
  dir?: 'rtl';
  variant: Variant;
  spacing: number;
  orientation: Orientation;
  single: boolean;
  testId: string;
};

const ITEMS = ['bold', 'italic', 'underline', 'strike'];

function RadixGroup({
  dir,
  variant,
  spacing,
  orientation,
  single,
  testId,
}: GroupProps) {
  const items = ITEMS.map((value) => (
    <Radix.ToggleGroupItem key={value} value={value} aria-label={value}>
      {value[0]!.toUpperCase()}
    </Radix.ToggleGroupItem>
  ));
  const shared = { dir, variant, spacing, orientation, 'data-testid': testId };
  return single ? (
    <Radix.ToggleGroup type="single" {...shared}>
      {items}
    </Radix.ToggleGroup>
  ) : (
    <Radix.ToggleGroup type="multiple" {...shared}>
      {items}
    </Radix.ToggleGroup>
  );
}

function BaseGroup({
  variant,
  spacing,
  orientation,
  single,
  testId,
}: GroupProps) {
  return (
    <Base.ToggleGroup
      variant={variant}
      spacing={spacing}
      orientation={orientation}
      multiple={!single}
      data-testid={testId}
    >
      {ITEMS.map((value) => (
        <Base.ToggleGroupItem key={value} value={value} aria-label={value}>
          {value[0]!.toUpperCase()}
        </Base.ToggleGroupItem>
      ))}
    </Base.ToggleGroup>
  );
}

function AriaGroup({
  variant,
  spacing,
  orientation,
  single,
  testId,
}: GroupProps) {
  return (
    <Aria.ToggleGroup
      variant={variant}
      spacing={spacing}
      orientation={orientation}
      selectionMode={single ? 'single' : 'multiple'}
      data-testid={testId}
    >
      {ITEMS.map((value) => (
        <Aria.ToggleGroupItem key={value} id={value} aria-label={value}>
          {value[0]!.toUpperCase()}
        </Aria.ToggleGroupItem>
      ))}
    </Aria.ToggleGroup>
  );
}

const GROUPS = {
  'radix-ui': RadixGroup,
  'base-ui': BaseGroup,
  'react-aria': AriaGroup,
};

export default function ToggleGroupSurfacesFixture() {
  const layouts: Omit<GroupProps, 'testId'>[] = [];
  for (const variant of ['outline', 'default'] as const)
    for (const spacing of [0, 2])
      for (const orientation of ['horizontal', 'vertical'] as const)
        layouts.push({ variant, spacing, orientation, single: false });
  return (
    <div className="flex flex-col gap-8">
      {Object.entries(GROUPS).map(([lib, Group]) => (
        <section key={lib} className="flex flex-wrap items-start gap-6">
          {layouts.map((layout) => {
            const testId = `${lib}-${layout.variant}-${layout.spacing}-${layout.orientation}`;
            return <Group key={testId} {...layout} testId={testId} />;
          })}
          {(['outline', 'default'] as const).map((variant) => (
            <div key={variant} dir="rtl">
              <Group
                dir="rtl"
                variant={variant}
                spacing={0}
                orientation="horizontal"
                single={false}
                testId={`${lib}-${variant}-0-horizontal-rtl`}
              />
            </div>
          ))}
          {(['outline', 'default'] as const).flatMap((variant) =>
            [0, 2].map((spacing) => (
              <Group
                key={`${variant}-${spacing}-single`}
                variant={variant}
                spacing={spacing}
                orientation="horizontal"
                single
                testId={`${lib}-${variant}-${spacing}-horizontal-single`}
              />
            )),
          )}
        </section>
      ))}
    </div>
  );
}
