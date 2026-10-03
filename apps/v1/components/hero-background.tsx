'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, type SVGMotionProps } from 'motion/react';

export const HeroBackground = (props: SVGMotionProps<SVGSVGElement>) => {
  const { resolvedTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  const color = resolvedTheme === 'dark' ? '#fff' : '#000';
  const opacity = resolvedTheme === 'dark' ? 0.2 : 0.15;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 74.71 74.71"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 1, ease: 'easeInOut' }}
      {...props}
    >
      <defs>
        <radialGradient
          id="d"
          cx="37.35"
          cy="37.35"
          r="37.35"
          fx="37.35"
          fy="37.35"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={color}></stop>
          <stop offset="1" stopColor={color} stopOpacity="0"></stop>
        </radialGradient>
      </defs>
      <path
        id="c"
        fill="url(#d)"
        d="M0 0h74.71v74.71H0z"
        fillOpacity={opacity}
      ></path>
    </motion.svg>
  );
};
