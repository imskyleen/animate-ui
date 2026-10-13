'use client';
/* eslint-disable @typescript-eslint/no-namespace */

import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';

import { getStrictContext } from '../../../utils/strict-context';
import { ReducedMotionConfig } from '../../../utils/motion';
import {
  BaseUIPanel,
  type PanelAnimationProps,
} from '../../../internal/disclosure-panel';

type RootContext = {
  value: readonly unknown[];
  keepMounted: boolean | undefined;
  hiddenUntilFound: boolean | undefined;
};

const [RootProvider, useRoot] = getStrictContext<RootContext>('Accordion.Root');
const [ItemOpenProvider, useItemOpen] = getStrictContext<{ open: boolean }>(
  'Accordion.Item',
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Root<Value = any>({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: Root.Props<Value>) {
  const controlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<Value[]>(
    defaultValue ?? [],
  );
  const value = controlled ? valueProp : uncontrolled;

  const handleValueChange: Root.Props<Value>['onValueChange'] = (
    next,
    details,
  ) => {
    onValueChange?.(next, details);
    if (details.isCanceled) return;
    if (!controlled) setUncontrolled(next);
  };

  return (
    <RootProvider
      value={{
        value,
        keepMounted: props.keepMounted,
        hiddenUntilFound: props.hiddenUntilFound,
      }}
    >
      <ReducedMotionConfig>
        <AccordionPrimitive.Root<Value>
          {...props}
          value={value}
          onValueChange={handleValueChange}
        />
      </ReducedMotionConfig>
    </RootProvider>
  );
}

namespace Root {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Value<TValue = any> = AccordionPrimitive.Root.Value<TValue>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type State<TValue = any> = AccordionPrimitive.Root.State<TValue>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type Props<TValue = any> = AccordionPrimitive.Root.Props<TValue> &
    React.RefAttributes<HTMLDivElement>;
  export type ChangeEventReason = AccordionPrimitive.Root.ChangeEventReason;
  export type ChangeEventDetails = AccordionPrimitive.Root.ChangeEventDetails;
}

function Item({
  value: valueProp,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const fallbackId = React.useId();
  const value: unknown = valueProp ?? fallbackId;
  const open = useRoot().value.includes(value);

  return (
    <ItemOpenProvider value={{ open }}>
      <AccordionPrimitive.Item {...props} value={value} />
    </ItemOpenProvider>
  );
}

namespace Item {
  export type Props = AccordionPrimitive.Item.Props;
  export type State = AccordionPrimitive.Item.State;
  export type ChangeEventReason = AccordionPrimitive.Item.ChangeEventReason;
  export type ChangeEventDetails = AccordionPrimitive.Item.ChangeEventDetails;
}

const Header = AccordionPrimitive.Header;

namespace Header {
  export type Props = AccordionPrimitive.Header.Props;
  export type State = AccordionPrimitive.Header.State;
}

const Trigger = AccordionPrimitive.Trigger;

namespace Trigger {
  export type Props = AccordionPrimitive.Trigger.Props;
  export type State = AccordionPrimitive.Trigger.State;
}

function Panel({
  keepMounted,
  hiddenUntilFound,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel> &
  PanelAnimationProps) {
  const { open } = useItemOpen();
  const root = useRoot();

  return (
    <BaseUIPanel
      {...props}
      keepMounted={keepMounted ?? root.keepMounted}
      hiddenUntilFound={hiddenUntilFound ?? root.hiddenUntilFound}
      component={AccordionPrimitive.Panel}
      open={open}
      sizeVars={['--accordion-panel-height', '--accordion-panel-width']}
    />
  );
}

namespace Panel {
  export type Props = AccordionPrimitive.Panel.Props & PanelAnimationProps;
  export type State = AccordionPrimitive.Panel.State;
}

export { Root, Item, Header, Trigger, Panel };
