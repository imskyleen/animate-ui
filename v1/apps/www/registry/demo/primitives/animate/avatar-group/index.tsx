import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/ui/avatar';
import {
  AvatarGroup,
  AvatarGroupTooltip,
  AvatarGroupTooltipArrow,
} from '@/registry/primitives/animate/avatar-group';
import { motion } from 'motion/react';

const AVATARS = [
  {
    src: 'https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg',
    fallback: 'SK',
    tooltip: 'Skyleen',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
    fallback: 'CN',
    tooltip: 'Shadcn',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
    fallback: 'AW',
    tooltip: 'Adam Wathan',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
    fallback: 'GR',
    tooltip: 'Guillermo Rauch',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
    fallback: 'JH',
    tooltip: 'Jhey',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1927474594102784000/Al0g-I6o_400x400.jpg',
    fallback: 'DH',
    tooltip: 'David Haz',
  },
];

export const AvatarGroupDemo = () => {
  return (
    <AvatarGroup className="h-12 -space-x-3" invertOverlap>
      {AVATARS.map((avatar, index) => (
        <Avatar key={index} className="size-12 border-3 border-background">
          <AvatarImage src={avatar.src} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
          <AvatarGroupTooltip className="bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            <AvatarGroupTooltipArrow className="fill-primary size-2.5" />
            <motion.p layout="preserve-aspect">{avatar.tooltip}</motion.p>
          </AvatarGroupTooltip>
        </Avatar>
      ))}
    </AvatarGroup>
  );
};
