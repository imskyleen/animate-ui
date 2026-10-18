import { expect, test } from '@playwright/test';

import { isNewPage, isRecent, isUpdatedPage } from '../../lib/new-badge';

const isNewBadge = (frontmatter: Record<string, unknown>) =>
  isNewPage(frontmatter) ? 'new' : null;

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

test('a page stays new for 60 days after its release date, then the badge goes', () => {
  expect(isNewBadge({ releaseDate: daysAgo(2) })).toBe('new');
  expect(isNewBadge({ releaseDate: daysAgo(59) })).toBe('new');
  expect(isNewBadge({ releaseDate: daysAgo(61) })).toBeNull();
});

test('new: true no longer outlives a release date; without one, it stays until removed', () => {
  expect(isNewBadge({ releaseDate: daysAgo(61), new: true })).toBeNull();
  expect(isNewBadge({ releaseDate: daysAgo(10), new: true })).toBe('new');
  expect(isNewBadge({ new: true })).toBe('new');
  expect(isNewBadge({})).toBeNull();
});

test('an icon stays new for 60 days after it was added', () => {
  expect(isRecent(daysAgo(59))).toBe(true);
  expect(isRecent(daysAgo(61))).toBe(false);
});

test('a page stays updated for 60 days after its update date, then the badge goes', () => {
  expect(isUpdatedPage({ updatedDate: daysAgo(2) })).toBe(true);
  expect(isUpdatedPage({ updatedDate: daysAgo(59) })).toBe(true);
  expect(isUpdatedPage({ updatedDate: daysAgo(61) })).toBe(false);
  expect(isUpdatedPage({})).toBe(false);
});
