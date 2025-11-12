'use client';

import { FlipCard } from '@/registry/components/community/flip-card';

export const FlipCardDemo = () => {
  const data = {
    name: 'Animate UI',
    username: 'animate_ui',
    image:
      'https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg',
    bio: 'A fully animated, open-source component distribution built with React, TypeScript, Tailwind CSS, and Motion.',
    stats: { following: 200, followers: 2900, posts: 120 },
    socialLinks: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      twitter: 'https://twitter.com',
    },
  };

  return <FlipCard data={data} />;
};
