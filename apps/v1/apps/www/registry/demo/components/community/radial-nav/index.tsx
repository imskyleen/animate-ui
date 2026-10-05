'use client';

import * as React from 'react';
import { RadialNav } from '@/registry/components/community/radial-nav';
import { Bookmark, LayoutGrid, User } from 'lucide-react';

const ITEMS = [
  { id: 1, icon: LayoutGrid, label: 'Projects', angle: 0 },
  { id: 2, icon: Bookmark, label: 'Bookmarks', angle: -115 },
  { id: 3, icon: User, label: 'About', angle: 115 },
];

export const RadialNavDemo = () => (
  <RadialNav items={ITEMS} defaultActiveId={1} />
);
