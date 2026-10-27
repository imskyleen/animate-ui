'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CarouselCounter } from '@animate-ui/react/primitives/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/demos/animate-ui/carousel';

// shadcn/ui's options as they come: no loop, the end snaps trimmed.
export default function CarouselTrimmedFixture() {
  return (
    <Carousel
      opts={{ align: 'center', scale: 0.8 }}
      className="w-full max-w-[min(42rem,calc(100%-7rem))]"
    >
      <CarouselContent className="-ml-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="basis-[calc(100%/2.6-1px)] pl-1">
            <div>
              <Card className="ring-inset">
                <CardContent className="flex aspect-[13/15] items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselCounter />
    </Carousel>
  );
}
