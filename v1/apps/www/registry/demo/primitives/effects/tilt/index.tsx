import Image from 'next/image';

import { Tilt, TiltContent } from '@/registry/primitives/effects/tilt';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@workspace/ui/components/ui/card';

type TiltDemoProps = {
  maxTilt?: number;
  perspective?: number;
};

export default function TiltDemo({ maxTilt, perspective }: TiltDemoProps) {
  return (
    <Tilt
      className="w-full max-w-[250px]"
      maxTilt={maxTilt}
      perspective={perspective}
    >
      <TiltContent asChild>
        <Card className="w-full p-0 gap-2">
          <CardHeader className="p-2 pb-1">
            <Image
              src="/mug.webp"
              alt="Black porcelain mug with modern square handle and natural clay accents on rim and bottom."
              width={250}
              height={250}
              className="rounded-md"
            />
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xs text-neutral-500">Dark Grey</p>
            <h3>Matt Mug</h3>
            <p className="text-base/6">$20</p>
          </CardContent>
          <CardFooter className="pb-5 pt-1 flex items-center justify-center">
            <ul
              role="list"
              className="mt-auto flex items-center justify-center space-x-3 [&>li]:size-4.5 [&>li]:rounded-full [&>li]:border"
            >
              <li className="bg-neutral-800" />
              <li className="bg-red-950" />
              <li className="bg-blue-950" />
            </ul>
          </CardFooter>
        </Card>
      </TiltContent>
    </Tilt>
  );
}
