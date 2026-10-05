import { Label } from '@workspace/ui/components/ui/label';
import { Switch } from '@/registry/components/base/switch';

export function BaseSwitchDemo() {
  return (
    <Label className="flex items-center gap-x-3">
      <Switch />
      Airplane Mode
    </Label>
  );
}
