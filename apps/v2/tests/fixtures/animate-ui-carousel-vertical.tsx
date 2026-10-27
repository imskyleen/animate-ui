'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  CarouselCounter,
  CarouselDots,
} from '@animate-ui/react/primitives/carousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/demos/animate-ui/carousel';

// The scaled carousel standing up: three slides in a loop, dots under it.
export default function CarouselVerticalFixture() {
  return (
    <div className="flex justify-center py-16">
      <Carousel
        orientation="vertical"
        opts={{ loop: true, align: 'center', scale: 0.8, visible: 3 }}
        className="w-56"
      >
        <CarouselContent className="-mt-1 h-[480px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="pt-1">
              <div className="h-full">
                <Card className="h-full ring-inset">
                  <CardContent className="flex h-full items-center justify-center p-6">
                    <span className="text-4xl font-semibold select-none">
                      {index + 1}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <div className="mt-16 flex flex-col items-center gap-2">
          <CarouselDots />
          <CarouselCounter />
        </div>
      </Carousel>
    </div>
  );
}
