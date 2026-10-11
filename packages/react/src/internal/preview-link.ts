'use client';

import * as React from 'react';

// Shared by the Preview Link Cards (Radix UI, Base UI, React Aria): the
// screenshot of the linked page, as Animate UI v1 builds it.

/** The screenshot's options, on the Root of a Preview Link Card. */
type PreviewImageOptions = {
  /** The image to show. Defaults to a Microlink screenshot of `href`. */
  src?: string;
  /** The image's width, in CSS pixels. */
  width?: number;
  /** The image's height, in CSS pixels. */
  height?: number;
  /** The device scale factor of the screenshot. */
  deviceScaleFactor?: number;
  /** The color scheme the page is captured in. */
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

/**
 * v1's screenshot URL: Microlink captures `href` on a mobile viewport three
 * times the image's size, and answers with the image itself.
 */
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

/**
 * Preloads the image as soon as the card's Root mounts (a `<link
 * rel="preload">` in the head, as in v1), so it's there when the card opens.
 */
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
