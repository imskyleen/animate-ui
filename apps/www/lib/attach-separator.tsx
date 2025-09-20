import AnimateUIIcon from '@workspace/ui/components/icons/animateui-icon';
import BaseUIIcon from '@workspace/ui/components/icons/baseui-icon';
import CommunityIcon from '@workspace/ui/components/icons/community-icon';
import ImageIcon from '@workspace/ui/components/icons/image-icon';
import HeadlessUIIcon from '@workspace/ui/components/icons/headlessui-icon';
import RadixIcon from '@workspace/ui/components/icons/radix-icon';
import type { BuildPageTreeOptions } from 'fumadocs-core/source';
import {
  Code,
  RectangleHorizontalIcon,
  SparklesIcon,
  TypeIcon,
} from 'lucide-react';
import { LucideIcons } from '@/components/icons/lucide-icons';

const Icon = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="relative size-5 [&_svg]:size-[12px] flex items-center justify-center bg-muted text-muted-foreground rounded-[5px]">
      {children}

      <span className="absolute left-1/2 translate-x-[calc(-50%-0.5px)] bg-border w-px h-[8px] top-full" />
    </span>
  );
};

export const Separator = ({
  icon,
  name,
}: {
  icon: React.ReactNode;
  name: string;
}) => {
  return (
    <span className="flex items-center gap-1.5">
      <Icon>{icon}</Icon>
      <span>{name}</span>
    </span>
  );
};

export const attachSeparator: BuildPageTreeOptions['attachSeparator'] = (
  node,
) => {
  switch (node.name) {
    case 'Animate UI':
      node.name = (
        <Separator
          icon={<AnimateUIIcon className="!size-3" />}
          name="Animate UI"
        />
      );
      break;
    case 'Radix UI':
      node.name = (
        <Separator icon={<RadixIcon className="!size-2.5" />} name="Radix UI" />
      );
      break;
    case 'Base UI':
      node.name = <Separator icon={<BaseUIIcon />} name="Base UI" />;
      break;
    case 'Headless UI':
      node.name = <Separator icon={<HeadlessUIIcon />} name="Headless UI" />;
      break;
    case 'Effects':
      node.name = (
        <Separator icon={<SparklesIcon fill="currentColor" />} name="Effects" />
      );
      break;
    case 'Community':
      node.name = <Separator icon={<CommunityIcon />} name="Community" />;
      break;
    case 'Backgrounds':
      node.name = (
        <Separator icon={<ImageIcon strokeWidth={5} />} name="Backgrounds" />
      );
      break;
    case 'Buttons':
      node.name = (
        <Separator
          icon={<RectangleHorizontalIcon fill="currentColor" />}
          name="Buttons"
        />
      );
      break;
    case 'Texts':
      node.name = (
        <Separator icon={<TypeIcon strokeWidth={3} />} name="Texts" />
      );
      break;
    case 'Icons':
      node.name = (
        <Separator icon={<LucideIcons strokeWidth={2} />} name="Icons" />
      );
      break;
    case 'Usage':
      node.name = <Separator icon={<Code strokeWidth={3} />} name="Usage" />;
      break;
    case 'Guide':
      node.name = <Separator icon={<Code strokeWidth={2.5} />} name="Usage" />;
      break;
  }

  return node;
};
