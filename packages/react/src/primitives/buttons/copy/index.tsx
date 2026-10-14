'use client';

import * as React from 'react';
import type { Transition } from 'motion/react';

import { getStrictContext } from '../../../utils/strict-context';
import { useControlledState } from '../../../utils/use-controlled-state';
import { Button, type ButtonProps } from '../button';
import { IconSwap } from '../_icon-swap';

type CopyButtonContextType = {
  copied: boolean;
};

const [CopyButtonProvider, useCopyButton] =
  getStrictContext<CopyButtonContextType>('CopyButtonContext');

type CopyButtonProps = ButtonProps & {
  content: string;
  copied?: boolean;
  defaultCopied?: boolean;
  onCopiedChange?: (copied: boolean, content?: string) => void;
  delay?: number;
};

function CopyButton({
  content,
  copied,
  defaultCopied = false,
  onCopiedChange,
  delay = 3000,
  onClick,
  ...props
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useControlledState<boolean, [string?]>({
    value: copied,
    defaultValue: defaultCopied,
    onChange: onCopiedChange,
  });
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || copied || !content) return;
      Promise.resolve()
        .then(() => navigator.clipboard.writeText(content))
        .then(() => {
          setIsCopied(true, content);
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setIsCopied(false), delay);
        })
        .catch((error) => {
          console.error('Animate UI CopyButton: could not copy', error);
        });
    },
    [onClick, copied, content, setIsCopied, delay],
  );

  return (
    <CopyButtonProvider value={{ copied: isCopied }}>
      <Button
        data-slot="copy-button"
        data-copied={isCopied ? '' : undefined}
        onClick={handleClick}
        {...props}
      />
    </CopyButtonProvider>
  );
}

type CopyButtonIconProps = Omit<React.ComponentProps<'span'>, 'children'> & {
  icon: React.ReactNode;
  copiedIcon: React.ReactNode;
  transition?: Transition;
};

function CopyButtonIcon({ icon, copiedIcon, ...props }: CopyButtonIconProps) {
  const { copied } = useCopyButton();

  return (
    <IconSwap
      data-slot="copy-button-icon"
      swapKey={copied ? 'copied' : 'copy'}
      {...props}
    >
      {copied ? copiedIcon : icon}
    </IconSwap>
  );
}

export {
  CopyButton,
  CopyButtonIcon,
  useCopyButton,
  type CopyButtonProps,
  type CopyButtonIconProps,
  type CopyButtonContextType,
};
