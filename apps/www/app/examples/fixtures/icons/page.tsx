'use client';

import { Bell } from '@/registry/icons/bell';
import { Heart } from '@/registry/icons/heart';

// Test fixture for the animated icons core (tests/interaction/icons.spec.ts).
export default function IconsFixturePage() {
  return (
    <main className="flex min-h-screen items-center justify-center gap-16 p-8">
      <span data-testid="hover-icon" className="inline-flex p-4">
        <Bell animateOnHover size={48} />
      </span>
      <button data-testid="tap-icon" className="inline-flex p-4">
        <Heart animateOnTap size={48} />
      </button>
    </main>
  );
}
