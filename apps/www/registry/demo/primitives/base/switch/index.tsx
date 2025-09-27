import { Switch, SwitchThumb } from '@/registry/primitives/base/switch';
import { Label } from '@workspace/ui/components/ui/label';
import { cn } from '@workspace/ui/lib/utils';

export const BaseSwitchDemo = () => {
  return (
    <Label htmlFor="airplane-mode" className="flex items-center gap-x-3">
      <Switch
        className={cn(
          'relative flex p-0.5 h-6 w-10 items-center justify-start rounded-full border transition-colors',
          'data-[checked]:bg-primary data-[checked]:justify-end',
        )}
        defaultChecked
        id="airplane-mode"
      >
        <SwitchThumb
          className="rounded-full bg-accent h-full aspect-square"
          pressedAnimation={{ width: 22 }}
        />
      </Switch>
      Airplane mode
    </Label>
  );
};
