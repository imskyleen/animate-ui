'use client';

import { Collapsible as CollapsiblePrimitive } from '@animate-ui/react/primitives/radix-ui';
import { UnfoldMoreIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import { useId, useState, type ChangeEvent, type ReactNode } from 'react';

import { Input } from '@/components/ui/base-ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

type ControlValue = string | number | boolean;
type Control = {
  value: ControlValue;
  min?: number;
  max?: number;
  step?: number;
  options?: Record<string, ControlValue>;
};
type FlatControls = Record<string, Control>;
type Controls = FlatControls | Record<string, FlatControls>;

const isControl = (value: unknown): value is Control =>
  typeof value === 'object' && value !== null && 'value' in value;

const isGrouped = (
  controls: Controls,
): controls is Record<string, FlatControls> =>
  Object.values(controls).every((group) => !isControl(group));

function controlsToProps(controls: Controls): Record<string, ControlValue> {
  const flat: FlatControls = isGrouped(controls)
    ? Object.assign({}, ...Object.values(controls))
    : controls;
  return Object.fromEntries(
    Object.entries(flat).map(([key, control]) => [key, control.value]),
  );
}

function setControl(controls: Controls, key: string, value: ControlValue) {
  if (!isGrouped(controls))
    return { ...controls, [key]: { ...controls[key]!, value } };
  return Object.fromEntries(
    Object.entries(controls).map(([group, flat]) => [
      group,
      key in flat ? { ...flat, [key]: { ...flat[key]!, value } } : flat,
    ]),
  ) as Controls;
}

function NumberField({
  id,
  value,
  onValueChange,
  min,
  max,
  step,
  className,
}: {
  id: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(String(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setDisplay(String(value));
  }

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDisplay(next);
    if (next === '' || Number.isNaN(Number(next))) return;
    let n = Number(next);
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    if (step !== undefined)
      n = Number((Math.round(n / step) * step).toFixed(6));
    onValueChange(n);
  };

  return (
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      autoComplete="off"
      min={min}
      max={max}
      step={step}
      value={display}
      onChange={onChange}
      onBlur={() => setDisplay(String(value))}
      className={cn(
        'h-8 rounded-md px-2 text-sm md:text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className,
      )}
    />
  );
}

function ControlRow({
  id,
  name,
  children,
}: {
  id: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div data-slot="control" className="flex items-center gap-2.5">
      <Label
        htmlFor={id}
        title={name}
        className="block w-20 shrink-0 truncate leading-[1.2] text-foreground/80"
      >
        {name}
      </Label>
      {children}
    </div>
  );
}

function ControlInput({
  id,
  name,
  control,
  onChange,
}: {
  id: string;
  name: string;
  control: Control;
  onChange: (value: ControlValue) => void;
}) {
  const { value, options } = control;

  if (options) {
    return (
      <ControlRow id={id} name={name}>
        <Select
          value={String(value)}
          onValueChange={(next) =>
            onChange(
              Object.values(options).find(
                (option) => String(option) === next,
              ) ?? next,
            )
          }
        >
          <SelectTrigger
            id={id}
            size="sm"
            className="h-8! min-w-0 flex-1 rounded-md"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {Object.entries(options).map(([label, option]) => (
              <SelectItem key={label} value={String(option)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ControlRow>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <ControlRow id={id} name={name}>
        <Switch
          id={id}
          checked={value}
          onCheckedChange={onChange}
          className="ml-auto"
        />
      </ControlRow>
    );
  }

  if (typeof value === 'number') {
    const { min, max, step } = control;
    if (min !== undefined && max !== undefined) {
      return (
        <ControlRow id={id} name={name}>
          <Slider
            aria-label={name}
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={(next) => onChange(next[0] ?? value)}
            className="min-w-0 flex-1"
          />
          <NumberField
            id={id}
            value={value}
            min={min}
            max={max}
            step={step}
            onValueChange={onChange}
            className="w-[52px] shrink-0"
          />
        </ControlRow>
      );
    }
    return (
      <ControlRow id={id} name={name}>
        <NumberField
          id={id}
          value={value}
          onValueChange={onChange}
          className="min-w-0 flex-1"
        />
      </ControlRow>
    );
  }

  return (
    <ControlRow id={id} name={name}>
      <Input
        id={id}
        value={value}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-0 flex-1 rounded-md px-2 text-sm md:text-sm"
      />
    </ControlRow>
  );
}

function ControlList({
  controls,
  idPrefix,
  onChange,
}: {
  controls: FlatControls;
  idPrefix: string;
  onChange: (key: string, value: ControlValue) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[7px] bg-background py-[7px] pr-1.5 pl-2">
      {Object.entries(controls).map(([key, control]) => (
        <ControlInput
          key={key}
          id={`${idPrefix}-${key}`}
          name={key}
          control={control}
          onChange={(value) => onChange(key, value)}
        />
      ))}
    </div>
  );
}

function ControlsPanel({
  controls,
  onControlsChange,
}: {
  controls: Controls;
  onControlsChange: (controls: Controls) => void;
}) {
  const id = useId();
  const onChange = (key: string, value: ControlValue) =>
    onControlsChange(setControl(controls, key, value));

  return (
    <div
      data-slot="controls-panel"
      className="flex size-full flex-col overflow-y-auto rounded-md bg-accent p-1.5"
    >
      {isGrouped(controls) ? (
        Object.entries(controls).map(([group, flat]) => (
          <CollapsiblePrimitive.Root
            key={group}
            defaultOpen
            className="flex flex-col not-first:pt-1"
          >
            <CollapsiblePrimitive.CollapsibleTrigger className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md p-1.5 text-sm font-medium text-foreground/80 outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              <span className="truncate leading-[1.2]">{group}</span>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="size-3.5 shrink-0 text-muted-foreground"
              />
            </CollapsiblePrimitive.CollapsibleTrigger>
            <CollapsiblePrimitive.CollapsibleContent>
              <div className="pt-1">
                <ControlList
                  controls={flat}
                  idPrefix={`${id}-${group}`}
                  onChange={onChange}
                />
              </div>
            </CollapsiblePrimitive.CollapsibleContent>
          </CollapsiblePrimitive.Root>
        ))
      ) : (
        <ControlList controls={controls} idPrefix={id} onChange={onChange} />
      )}
    </div>
  );
}

function withValues(
  controls: Controls,
  values: Record<string, ControlValue>,
): Controls {
  return Object.entries(values).reduce(
    (next, [key, value]) => setControl(next, key, value),
    controls,
  );
}

export {
  ControlsPanel,
  controlsToProps,
  withValues,
  type Control,
  type Controls,
  type ControlValue,
};
