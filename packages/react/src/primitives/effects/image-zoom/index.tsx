'use client';

import * as React from 'react';
import { motion, type Transition } from 'motion/react';

import { ReducedMotionConfig } from '../../../utils/motion';
import { mergeRefs } from '../../../internal/anchored';

const COARSE_QUERY = '(pointer: coarse)';

function subscribeToCoarsePointer(onChange: () => void) {
  const mql = window.matchMedia(COARSE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function useIsTouch() {
  return React.useSyncExternalStore(
    subscribeToCoarsePointer,
    () => window.matchMedia(COARSE_QUERY).matches,
    () => false,
  );
}

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
  ref,
  onMouseEnter,
  onMouseLeave,
  onMouseMove,
  onClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  ...props
}: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(containerRef, ref), [ref]);
  const isTouch = useIsTouch();

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
      if (!zoomOnClick) setIsZoomed(true);
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
      ref={mergedRef}
      style={{
        overflow: 'hidden',
        position: 'relative',
        width,
        height,
        touchAction: 'manipulation',
        cursor: disabled ? 'default' : isZoomed ? 'zoom-out' : 'zoom-in',
        ...style,
      }}
      role="img"
      {...props}
      onMouseEnter={(e) => {
        handleMouseEnter();
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        handleMouseLeave();
        onMouseLeave?.(e);
      }}
      onMouseMove={(e) => {
        handleMouseMove(e);
        onMouseMove?.(e);
      }}
      onClick={(e) => {
        handleClick(e);
        onClick?.(e);
      }}
      onTouchStart={(e) => {
        handleTouchStart(e);
        onTouchStart?.(e);
      }}
      onTouchMove={(e) => {
        handleTouchMove(e);
        onTouchMove?.(e);
      }}
      onTouchEnd={(e) => {
        handleTouchEnd();
        onTouchEnd?.(e);
      }}
    >
      <ReducedMotionConfig>
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
      </ReducedMotionConfig>
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

export type { ImageZoomProps, ImageProps };
