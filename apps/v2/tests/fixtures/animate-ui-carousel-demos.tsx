"use client"

import * as parts from "@/demos/animate-ui/carousel"
import { CarouselDemos } from "./lib/carousel-demos"

// shadcn/ui's demos on its carousel animated by Animate UI, without the options.
export default function AnimateUiCarouselDemos() {
  return <CarouselDemos parts={parts} />
}
