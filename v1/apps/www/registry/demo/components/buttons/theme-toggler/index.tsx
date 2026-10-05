import {
  ThemeTogglerButton,
  type ThemeTogglerButtonProps,
} from '@/registry/components/buttons/theme-toggler';

interface ThemeTogglerButtonDemoProps {
  variant: ThemeTogglerButtonProps['variant'];
  size: ThemeTogglerButtonProps['size'];
  direction: ThemeTogglerButtonProps['direction'];
  system: boolean;
}

export default function ThemeTogglerButtonDemo({
  variant,
  size,
  direction,
  system,
}: ThemeTogglerButtonDemoProps) {
  return (
    <ThemeTogglerButton
      variant={variant}
      size={size}
      direction={direction}
      modes={system ? ['light', 'dark', 'system'] : ['light', 'dark']}
    />
  );
}
