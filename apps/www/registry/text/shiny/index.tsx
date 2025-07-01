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

  // 根据主题设置默认颜色
  const getColors = () => {
    if (shimmerColor && baseColor) {
      return { shimmer: shimmerColor, base: baseColor };
    }

    switch (theme) {
      case 'light':
        return {
          shimmer: '#000000',
          base: '#9ca3af', // gray-400
        };
      case 'dark':
        return {
          shimmer: '#ffffff',
          base: '#6b7280', // gray-500
        };
      default: // auto
        return {
          shimmer: '#000000',
          base: '#9ca3af',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={cn('relative inline-block', className)}
      style={style}
      {...props}
    >
      {/* 基础文字 */}
      <div className="font-semibold" style={{ color: colors.base }}>
        {text}
      </div>

      {/* 闪光效果遮罩 */}
      <motion.div
        className="absolute inset-0 font-semibold overflow-hidden pointer-events-none"
        style={{
          background: `linear-gradient(120deg, transparent 0%, transparent 40%, ${colors.shimmer} 50%, transparent 60%, transparent 100%)`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
        }}
        animate={
          disable
            ? { backgroundPosition: '100% 0%' }
            : {
                backgroundPosition: ['100% 0%', '-100% 0%'],
              }
        }
        transition={
          disable
            ? { duration: 0 }
            : {
                duration: animationDuration,
                ease: 'linear',
                repeat: Infinity,
              }
        }
      >
        {text}
      </motion.div>
    </div>
  );
};

export { ShinyText, type ShinyTextProps };
