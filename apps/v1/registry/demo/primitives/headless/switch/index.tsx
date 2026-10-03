import { Switch, SwitchThumb } from '@/registry/primitives/headless/switch';
import { Field, Label } from '@headlessui/react';
import { cn } from '@workspace/ui/lib/utils';

export const HeadlessSwitchDemo = () => {
  return (
    <Field>
      <Label className="flex items-center gap-x-3">
        <Switch
          className={cn(
            'relative flex p-0.5 h-6 w-10 items-center justify-start rounded-full border transition-colors',
            'data-[checked]:bg-primary data-[checked]:justify-end',
          )}
          defaultChecked
        >
          <SwitchThumb
            className="rounded-full bg-accent h-full aspect-square"
            pressedAnimation={{ width: 22 }}
          />
        </Switch>
        Airplane mode
      </Label>
    </Field>
  );
};
