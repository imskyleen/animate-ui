import { Label } from '@workspace/ui/components/ui/label';
import { Switch } from '@/registry/components/headless/switch';

export function HeadlessSwitchDemo() {
  return (
    <Label htmlFor="airplane-mode" className="flex items-center gap-x-3">
      <Switch id="airplane-mode" />
      Airplane Mode
    </Label>
  );
}
