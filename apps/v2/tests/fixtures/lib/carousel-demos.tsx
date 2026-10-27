import { Card, CardContent } from "@/components/ui/card"

type Parts = typeof import("./shadcn-carousel")

// shadcn/ui's carousel demos, as its docs show them.
export function CarouselDemos({ parts }: { parts: Parts }) {
  const { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } =
    parts
  const card = (index: number, text: string, square = true) => (
    <div className="p-1">
      <Card>
        <CardContent
          className={
            square
              ? "flex aspect-square items-center justify-center p-6"
              : "flex items-center justify-center p-6"
          }
        >
          <span className={`${text} font-semibold`}>{index + 1}</span>
        </CardContent>
      </Card>
    </div>
  )
  const five = Array.from({ length: 5 })

  return (
    <div className="flex flex-col items-center gap-16 px-16">
      <div data-demo="default" className="flex w-full justify-center">
        <Carousel className="w-full max-w-[12rem] sm:max-w-xs">
          <CarouselContent>
            {five.map((_, index) => (
              <CarouselItem key={index}>{card(index, "text-4xl")}</CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div data-demo="size" className="flex w-full justify-center">
        <Carousel
          opts={{ align: "start" }}
          className="w-full max-w-[12rem] sm:max-w-xs md:max-w-sm"
        >
          <CarouselContent>
            {five.map((_, index) => (
              <CarouselItem key={index} className="basis-1/2 lg:basis-1/3">
                {card(index, "text-3xl")}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div data-demo="spacing" className="flex w-full justify-center">
        <Carousel className="w-full max-w-[12rem] sm:max-w-xs md:max-w-sm">
          <CarouselContent className="-ml-1">
            {five.map((_, index) => (
              <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
                {card(index, "text-2xl")}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
      <div data-demo="orientation" className="flex w-full justify-center py-12">
        <Carousel
          opts={{ align: "start" }}
          orientation="vertical"
          className="w-full max-w-xs"
        >
          <CarouselContent className="-mt-1 h-[270px]">
            {five.map((_, index) => (
              <CarouselItem key={index} className="basis-1/2 pt-1">
                {card(index, "text-3xl", false)}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}
