import type { Primitive } from '../../lib/primitives';

export default {
  library: 'base-ui',
  name: 'toast',
  strip: [
    // shadcn's CSS stack: the transforms (resting, expanded, entering,
    // exiting, swiped away), their transition and the variables only they
    // read. The Root writes its own transforms and transitions now.
    /^\[(transform|transition):/,
    /^\[--(offset-y|scale|shrink|peek):/,
    // The content's fade timing; the Content sets it from the tokens.
    /^transition-opacity$/,
    /^duration-250$/,
    /^ease-\[cubic-bezier\(0\.22,1,0\.36,1\)\]$/,
  ],
} satisfies Primitive;
