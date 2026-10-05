'use client';

import * as React from 'react';
import { GitCommit, AlertTriangle, Box, KeyRound, Regex } from 'lucide-react';

import { PinList } from '@/registry/components/community/pin-list';

const ITEMS = [
  {
    id: 1,
    name: 'Commit Zone',
    info: 'Code updates · Closes 9:00 PM',
    icon: GitCommit,
    pinned: true,
  },
  {
    id: 2,
    name: '404 Room',
    info: 'Fixing errors · Open 24 hours',
    icon: AlertTriangle,
    pinned: true,
  },
  {
    id: 3,
    name: 'NPM Stop',
    info: 'Install stuff · Closes 8:00 PM',
    icon: Box,
    pinned: false,
  },
  {
    id: 4,
    name: 'Token Lock',
    info: 'Login stuff · Open 24 hours',
    icon: KeyRound,
    pinned: false,
  },
  {
    id: 5,
    name: 'Regex Zone',
    info: 'Find words · Closes 9:00 PM',
    icon: Regex,
    pinned: false,
  },
];

export const PinListDemo = () => <PinList items={ITEMS} />;
