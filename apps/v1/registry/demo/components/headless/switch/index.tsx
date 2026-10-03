import { Label } from '@workspace/ui/components/ui/label';
import { Switch } from '@/registry/components/headless/switch';

export function HeadlessSwitchDemo() {
  return (
    <Label className="flex items-center gap-x-3">
      <Switch />
      Airplane Mode
    </Label>
  );
}
