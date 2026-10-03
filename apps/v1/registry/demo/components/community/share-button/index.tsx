'use client';

import {
  ShareButton,
  type ShareButtonProps,
} from '@/registry/components/community/share-button';

type ShareButtonDemoProps = {
  size?: ShareButtonProps['size'];
  icon?: ShareButtonProps['icon'];
};

export const ShareButtonDemo = ({ size, icon }: ShareButtonDemoProps) => {
  return (
    <ShareButton size={size} icon={icon}>
      Share
    </ShareButton>
  );
};
