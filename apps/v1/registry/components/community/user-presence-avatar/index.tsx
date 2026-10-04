'use client';

import * as React from 'react';
import { motion, LayoutGroup } from 'motion/react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/ui/avatar';
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/registry/components/animate/tooltip';
import { cn } from '@workspace/ui/lib/utils';

const USERS = [
  {
    id: 1,
    src: 'https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg',
    fallback: 'AK',
    tooltip: 'Arhamkhnz',
    online: true,
  },
  {
    id: 2,
    src: 'https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg',
    fallback: 'SK',
    tooltip: 'Skyleen',
    online: true,
  },
  {
    id: 3,
    src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
    fallback: 'CN',
    tooltip: 'Shadcn',
    online: true,
  },
  {
    id: 4,
    src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
    fallback: 'AW',
    tooltip: 'Adam Wathan',
    online: false,
  },
  {
    id: 5,
    src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
    fallback: 'GR',
    tooltip: 'Guillermo Rauch',
    online: false,
  },
  {
    id: 6,
    src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
    fallback: 'JH',
    tooltip: 'Jhey',
    online: false,
  },
];

const AVATAR_MOTION_TRANSITION = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
} as const;

const GROUP_CONTAINER_TRANSITION = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
} as const;

function UserPresenceAvatar() {
  const [users, setUsers] = React.useState(USERS);
  const [togglingGroup, setTogglingGroup] = React.useState<
    'online' | 'offline' | null
  >(null);

  const online = users.filter((u) => u.online);
  const offline = users.filter((u) => !u.online);

  const toggleStatus = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    setTogglingGroup(user.online ? 'online' : 'offline');
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      const target = updated[idx];
      if (!target) return prev;
      updated.splice(idx, 1);
      updated.push({ ...target, online: !target.online });
      return updated;
    });
    // Reset group z-index after the animation duration (keep in sync with animation timing)
    setTimeout(() => setTogglingGroup(null), 500);
  };

  return (
    <div className="flex items-center gap-5">
      <LayoutGroup>
        <TooltipProvider>
          {online.length > 0 && (
            <motion.div
              layout
              className={cn(
                'bg-neutral-300 dark:bg-neutral-700 p-0.5 rounded-full',
                togglingGroup === 'online' ? 'z-5' : 'z-10',
              )}
              transition={GROUP_CONTAINER_TRANSITION}
            >
              <div
                key={online.map((u) => u.id).join('_') + '-online'}
                className="flex items-center h-12 -space-x-3"
              >
                {online.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layoutId={`avatar-${user.id}`}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(user.id)}
                        animate={{
                          filter: 'grayscale(0)',
                          scale: 1,
                        }}
                        transition={AVATAR_MOTION_TRANSITION}
                        title="Click to go offline"
                        initial={false}
                      >
                        <Avatar className="size-12 border-3 border-neutral-300 dark:border-neutral-700">
                          <AvatarImage src={user.src} />
                          <AvatarFallback>{user.fallback}</AvatarFallback>
                          <TooltipContent>
                            <p>{user.tooltip}</p>
                          </TooltipContent>
                        </Avatar>
                      </motion.div>
                    </TooltipTrigger>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}

          {offline.length > 0 && (
            <motion.div
              layout
              className={cn(
                'bg-neutral-300 dark:bg-neutral-700 p-0.5 rounded-full',
                togglingGroup === 'offline' ? 'z-5' : 'z-10',
              )}
              transition={GROUP_CONTAINER_TRANSITION}
            >
              <div
                key={offline.map((u) => u.id).join('_') + '-offline'}
                className="flex items-center h-12 -space-x-3"
              >
                {offline.map((user) => (
                  <Tooltip key={user.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layoutId={`avatar-${user.id}`}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(user.id)}
                        animate={{
                          filter: 'grayscale(1)',
                          scale: 1,
                        }}
                        transition={AVATAR_MOTION_TRANSITION}
                        title="Click to go online"
                        initial={false}
                      >
                        <Avatar className="size-12 border-3 border-neutral-300 dark:border-neutral-700">
                          <AvatarImage src={user.src} />
                          <AvatarFallback>{user.fallback}</AvatarFallback>
                          <TooltipContent>
                            <p>{user.tooltip}</p>
                          </TooltipContent>
                        </Avatar>
                      </motion.div>
                    </TooltipTrigger>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}
        </TooltipProvider>
      </LayoutGroup>
    </div>
  );
}

export { UserPresenceAvatar };
