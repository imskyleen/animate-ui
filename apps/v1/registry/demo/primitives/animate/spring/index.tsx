import {
  SpringProvider,
  Spring,
  SpringElement,
} from '@/registry/primitives/animate/spring';

export const SpringDemo = () => {
  return (
    <SpringProvider>
      <Spring className="z-10 text-neutral-500" />
      <SpringElement className="z-50">
        <img
          src="https://pbs.twimg.com/profile_images/1950218390741618688/72447Y7e_400x400.jpg"
          alt="Animate UI"
          draggable={false}
          className="size-12 border"
        />
      </SpringElement>
    </SpringProvider>
  );
};
