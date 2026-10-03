"use client"

import {
  Image,
  ImageZoom,
} from "@animate-ui/react/primitives/effects/image-zoom"

export default function ImageZoomDemo() {
  return (
    <ImageZoom
      aria-label="Black porcelain mug, zoomable"
      className="rounded-2xl border bg-white"
      width={256}
      height={256}
    >
      <Image
        src="/demos/mug.webp"
        alt="Black porcelain mug with a square handle and natural clay accents"
        width={256}
        height={256}
      />
    </ImageZoom>
  )
}
