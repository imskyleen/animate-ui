import { Magnetic } from '@/registry/primitives/effects/magnetic';

interface MagneticDemoProps {
  onlyOnHover: boolean;
  strength: number;
  range: number;
}

export const MagneticDemo = (props: MagneticDemoProps) => {
  return (
    <div className="size-full flex items-center justify-center">
      <Magnetic className="size-20 bg-primary" {...props} />
    </div>
  );
};
