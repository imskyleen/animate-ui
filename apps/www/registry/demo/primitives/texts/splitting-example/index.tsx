import { SplittingText } from '@/registry/primitives/texts/splitting';

const TEXT = 'Elevate your UI with fluid, animated components';

export const SplittingTextDemo = () => {
  return (
    <div className="relative max-w-[450px]">
      <SplittingText
        text={TEXT}
        aria-hidden="true"
        className="block text-4xl font-semibold text-center text-neutral-200 dark:text-neutral-800"
        disableAnimation
      />
      <SplittingText
        text={TEXT}
        className="block text-4xl font-semibold text-center absolute inset-0"
        type="chars"
        inView
        initial={{ y: 0, opacity: 0, x: 0, filter: 'blur(10px)' }}
        animate={{ y: 0, opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </div>
  );
};
