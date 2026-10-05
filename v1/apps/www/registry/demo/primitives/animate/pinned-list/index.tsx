import {
  PinnedList,
  PinnedListItem,
  PinnedListItems,
  PinnedListLabel,
  PinnedListPinned,
  PinnedListTrigger,
  PinnedListUnpinned,
} from '@/registry/primitives/animate/pinned-list';
import { Pin } from 'lucide-react';
import { useState } from 'react';

const ITEMS = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2', pinned: true },
  { id: '3', name: 'Item 3', pinned: true },
  { id: '4', name: 'Item 4' },
];

export const PinnedListDemo = () => {
  const [items, setItems] = useState(ITEMS);

  const pinned = items.filter((item) => item.pinned);
  const unpinned = items.filter((item) => !item.pinned);

  const toggleStatus = (id: string) => {
    setItems((prev) => {
      const item = prev.find((item) => item.id === id);
      if (!item) return prev;
      return prev.map((item) => ({
        ...item,
        pinned: item.id === id ? !item.pinned : item.pinned,
      }));
    });
  };

  return (
    <PinnedList className="space-y-6 w-[200px]" onPinnedChange={toggleStatus}>
      <PinnedListPinned>
        <PinnedListLabel className="mb-2" hide={pinned.length === 0}>
          Pinned
        </PinnedListLabel>
        <PinnedListItems className="space-y-2">
          {pinned.map((item) => (
            <PinnedListItem
              key={item.id}
              id={item.id}
              className="h-12 px-4 bg-accent select-none flex items-center justify-between"
              customTrigger
            >
              {item.name}

              <PinnedListTrigger className="h-9 -mr-2.5 aspect-square bg-background flex items-center justify-center">
                <Pin
                  size={16}
                  className="text-muted-foreground fill-muted-foreground"
                />
              </PinnedListTrigger>
            </PinnedListItem>
          ))}
        </PinnedListItems>
      </PinnedListPinned>

      <PinnedListUnpinned>
        <PinnedListLabel className="mb-2" hide={unpinned.length === 0}>
          Unpinned
        </PinnedListLabel>
        <PinnedListItems className="space-y-2">
          {unpinned.map((item) => (
            <PinnedListItem
              key={item.id}
              id={item.id}
              className="h-12 px-4 bg-accent select-none flex items-center justify-between"
              customTrigger
            >
              {item.name}

              <PinnedListTrigger className="h-9 -mr-2.5 aspect-square bg-background flex items-center justify-center">
                <Pin size={16} className="text-muted-foreground" />
              </PinnedListTrigger>
            </PinnedListItem>
          ))}
        </PinnedListItems>
      </PinnedListUnpinned>
    </PinnedList>
  );
};
