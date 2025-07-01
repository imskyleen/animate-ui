'use client';

import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { motion } from 'motion/react';

type ShinyTextProps = React.ComponentProps<'div'> & {
  text: string;
  speed?: number;
  disable?: boolean;
  shimmerColor?: string;
  baseColor?: string;
  theme?: 'light' | 'dark' | 'auto';
};

const ShinyText = ({
  text,
  speed = 5,
  disable = false,
  shimmerColor,
  baseColor,
  theme = 'auto',
  className,
  style,
  ...props
}: ShinyTextProps) => {
  const animationDuration = speed;

  const getColors = () => {
    if (shimmerColor && baseColor) {
      return { shimmer: shimmerColor, base: baseColor };
    }

    switch (theme) {
      case 'light':
        return {
          shimmer: '#000000',
          base: '#9ca3af',
        };
      case 'dark':
        return {
          shimmer: '#ffffff',
          base: '#6b7280',
        };
      default: // auto
        return {
          shimmer: '#000000',
          base: '#9ca3af',
        };
    }
  };

  const colors = getColors();

  // 使用CSS变量传递动态颜色
  const cssVariables = {
    '--shiny-text-base-color': colors.base,
    '--shiny-text-shimmer-color': colors.shimmer,
  } as React.CSSProperties;

  return (
    <div
      className={cn('relative inline-block', className)}
      style={{ ...cssVariables, ...style }}
      {...props}
    >
      <div className="font-semibold text-[var(--shiny-text-base-color)]">
        {text}
      </div>

      {!disable && (
        <motion.div
          className={cn(
            'absolute inset-0 font-semibold overflow-hidden pointer-events-none',
            'bg-gradient-to-r bg-clip-text text-transparent',
            'bg-[length:200%_100%]',
            '[background-image:linear-gradient(120deg,transparent_0%,transparent_40%,var(--shiny-text-shimmer-color)_50%,transparent_60%,transparent_100%)]',
            '[background-clip:text] [-webkit-background-clip:text]',
            '[color:transparent] [-webkit-text-fill-color:transparent]',
          )}
          animate={{
            backgroundPosition: ['100% 0%', '-100% 0%'],
          }}
          transition={{
            duration: animationDuration,
            ease: 'linear',
            repeat: Infinity,
          }}
        >
          {text}
        </motion.div>
      )}
    </div>
  );
};

export { ShinyText, type ShinyTextProps };
