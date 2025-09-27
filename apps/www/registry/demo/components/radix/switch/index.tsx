import { Label } from '@workspace/ui/components/ui/label';
import { Switch } from '@/registry/components/radix/switch';

export function RadixSwitchDemo() {
  return (
    <Label className="flex items-center gap-x-3">
      <Switch />
      Airplane Mode
    </Label>
  );
}
