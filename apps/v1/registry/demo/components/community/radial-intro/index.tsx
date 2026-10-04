'use client';

import * as React from 'react';

import { RadialIntro } from '@/registry/components/community/radial-intro';

const ITEMS = [
  {
    id: 1,
    name: 'Framer University',
    src: 'https://pbs.twimg.com/profile_images/1602734731728142336/9Bppcs67_400x400.jpg',
  },
  {
    id: 2,
    name: 'arhamkhnz',
    src: 'https://pbs.twimg.com/profile_images/1897311929028255744/otxpL-ke_400x400.jpg',
  },
  {
    id: 3,
    name: 'Skyleen',
    src: 'https://pbs.twimg.com/profile_images/1948770261848756224/oPwqXMD6_400x400.jpg',
  },
  {
    id: 4,
    name: 'Shadcn',
    src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
  },
  {
    id: 5,
    name: 'Adam Wathan',
    src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
  },
  {
    id: 6,
    name: 'Guillermo Rauch',
    src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
  },
  {
    id: 7,
    name: 'Jhey',
    src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
  },
  {
    id: 8,
    name: 'David Haz',
    src: 'https://pbs.twimg.com/profile_images/1927474594102784000/Al0g-I6o_400x400.jpg',
  },
  {
    id: 9,
    name: 'Matt Perry',
    src: 'https://pbs.twimg.com/profile_images/1690345911149375488/wfD0Ai9j_400x400.jpg',
  },
];

export const RadialIntroDemo = () => <RadialIntro orbitItems={ITEMS} />;
