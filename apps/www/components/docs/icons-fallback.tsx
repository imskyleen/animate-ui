import { Skeleton } from '@workspace/ui/components/ui/skeleton';

export const IconsFallback = () => {
  return (
    <div className="-mt-4.5 space-y-4 text-black dark:text-white">
      <Skeleton className="h-4 w-38" />

      <Skeleton className="h-10 w-full" />

      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-10 rounded-full" />
        <Skeleton className="h-7 w-12 rounded-full" />
      </div>

      <div className="w-full grid lg:grid-cols-11 2xl:grid-cols-14 sm:grid-cols-9 xs:grid-cols-7 grid-cols-5 gap-4 mt-6">
        {new Array(99).fill(0).map((_, index) => (
          <Skeleton className="size-full aspect-square" key={index} />
        ))}
      </div>
    </div>
  );
};
