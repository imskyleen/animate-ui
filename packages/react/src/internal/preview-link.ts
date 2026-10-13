'use client';

import * as React from 'react';

type PreviewImageOptions = {
  src?: string;
  width?: number;
  height?: number;
  deviceScaleFactor?: number;
  colorScheme?: 'light' | 'dark';
};

function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }
  return search.toString();
}

function buildPreviewSrc({
  href,
  width,
  height,
  deviceScaleFactor,
  colorScheme,
}: Required<Omit<PreviewImageOptions, 'src'>> & { href: string }) {
  return `https://api.microlink.io/?${buildQueryString({
    url: href,
    screenshot: true,
    meta: false,
    embed: 'screenshot.url',
    colorScheme,
    'viewport.isMobile': true,
    'viewport.deviceScaleFactor': deviceScaleFactor,
    'viewport.width': width * 3,
    'viewport.height': height * 3,
  })}`;
}

function usePreloadImage(src: string) {
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [src]);
}

export { buildPreviewSrc, usePreloadImage, type PreviewImageOptions };
