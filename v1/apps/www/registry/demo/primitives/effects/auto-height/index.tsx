import { AutoHeight } from '@/registry/primitives/effects/auto-height';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export function AutoHeightDemo() {
  const [content, setContent] = useState(false);

  return (
    <div className="size-full flex flex-col gap-4 items-center justify-start h-[400px]">
      <button
        className="bg-primary text-primary-foreground px-3 py-1.5 text-sm"
        onClick={() => setContent(!content)}
      >
        Toggle Content
      </button>

      <AutoHeight
        deps={[content]}
        className="bg-accent w-full max-w-[400px] p-4"
      >
        <AnimatePresence mode="wait" initial={false}>
          {content ? (
            <motion.div
              key="content-150px"
              className="bg-border h-[150px] flex items-center justify-center"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              Content 150px
            </motion.div>
          ) : (
            <motion.div
              key="content-300px"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="bg-border h-[300px] flex items-center justify-center"
            >
              Content 300px
            </motion.div>
          )}
        </AnimatePresence>
      </AutoHeight>
    </div>
  );
}
