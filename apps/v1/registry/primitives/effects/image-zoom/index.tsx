'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';

type ImageZoomProps = {
  zoomScale?: number;
  transition?: Transition;
  style?: React.CSSProperties;
  zoomOnClick?: boolean;
  zoomOnHover?: boolean;
  disabled?: boolean;
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
  children: React.ReactElement;
} & React.ComponentProps<'div'>;

export function ImageZoom({
  children,
  zoomScale = 3,
  transition = { type: 'spring', stiffness: 200, damping: 28 },
  style,
  zoomOnClick = true,
  zoomOnHover = true,
  disabled = false,
  width = '100%',
  height = '100%',
  ...props
}: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isTouch =
    typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches;

  const setOriginFromEvent = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      const child = containerRef.current
        .firstElementChild as HTMLElement | null;
      if (!child) return;
      child.style.transformOrigin = `${x}px ${y}px`;
    },
    [],
  );

  const handleMouseEnter = React.useCallback(() => {
    if (disabled || isTouch || !zoomOnHover) return;
    setIsZoomed(true);
  }, [disabled, isTouch, zoomOnHover]);

  const handleMouseLeave = React.useCallback(() => {
    if (disabled || isTouch || !zoomOnHover) return;
    setIsZoomed(false);
  }, [disabled, isTouch, zoomOnHover]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isTouch) return;
      setOriginFromEvent(e);
    },
    [disabled, isTouch, setOriginFromEvent],
  );

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !zoomOnClick) return;
      setOriginFromEvent(e);
      setIsZoomed((v) => !v);
    },
    [disabled, zoomOnClick, setOriginFromEvent],
  );

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      setOriginFromEvent(e);
      if (zoomOnClick) setIsZoomed((v) => !v);
      else setIsZoomed(true);
    },
    [disabled, zoomOnClick, setOriginFromEvent],
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      setOriginFromEvent(e);
    },
    [disabled, setOriginFromEvent],
  );

  const handleTouchEnd = React.useCallback(() => {
    if (disabled) return;
    if (!zoomOnClick) setIsZoomed(false);
  }, [disabled, zoomOnClick]);

  return (
    <div
      ref={containerRef}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width,
        height,
        touchAction: 'manipulation',
        cursor: disabled ? 'default' : isZoomed ? 'zoom-out' : 'zoom-in',
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="img"
      {...props}
    >
      <motion.div
        animate={{ scale: disabled ? 1 : isZoomed ? zoomScale : 1 }}
        transition={transition}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

type ImageProps<T extends React.ElementType = 'img'> = {
  objectFit?: React.CSSProperties['objectFit'];
  as?: T;
} & React.ComponentProps<T>;

export function Image<T extends React.ElementType = 'img'>({
  objectFit = 'cover',
  as: Component = 'img',
  ...props
}: ImageProps<T>) {
  return (
    <Component
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
      {...props}
    />
  );
}
