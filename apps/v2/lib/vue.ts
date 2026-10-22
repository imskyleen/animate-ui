import type { Metadata } from 'next';

import type { Controls } from '@/components/docs/controls-panel';

/** Vue's own colors, for the logo on the Vue pages. */
export const VUE_COLORS = { green: '#40B883', slate: '#34495E' } as const;

export const isVuePath = (pathname: string) =>
  pathname === '/docs/vue' || pathname.startsWith('/docs/vue/');

export const VUE_HOME = '/vue';

/** The site's favicons, in Vue green on the Vue pages. */
export const siteIcons = (vue = false): Metadata['icons'] => {
  const suffix = vue ? '-vue' : '';
  return [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: `/favicon${suffix}-32x32.png`,
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: `/favicon${suffix}-16x16.png`,
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: `/apple-touch-icon${suffix}.png`,
    },
  ];
};

/** The framework a home page or a docs page is about. */
export const frameworkOf = (pathname: string) =>
  pathname === VUE_HOME || isVuePath(pathname) ? 'vue' : 'react';

const BACKGROUND_COLORS = {
  blue: '#3b9eff',
  violet: '#a78bfa',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
};

/** The tweakpane of each Vue demo in apps/vue-demos, by demo name. */
export const VUE_DEMO_CONTROLS: Record<string, Controls> = {
  'animate-ui/effect': {
    Effect: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      blur: { value: true },
      slide: { value: true },
      fade: { value: true },
      zoom: { value: true },
    },
  },
  'animate-ui/blur': {
    Blur: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      initialBlur: { value: 10, min: 0, max: 50, step: 1 },
      blur: { value: 0, min: 0, max: 50, step: 1 },
    },
  },
  'animate-ui/fade': {
    Fade: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      initialOpacity: { value: 0, min: 0, max: 1, step: 0.1 },
      opacity: { value: 1, min: 0, max: 1, step: 0.1 },
    },
  },
  'animate-ui/slide': {
    Slide: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      direction: {
        value: 'up',
        options: { up: 'up', down: 'down', left: 'left', right: 'right' },
      },
      offset: { value: 100, min: 0, max: 1000, step: 10 },
    },
  },
  'animate-ui/zoom': {
    Zoom: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      initialScale: { value: 0.5, min: 0, max: 1, step: 0.1 },
      scale: { value: 1, min: 0, max: 1, step: 0.1 },
    },
  },
  'animate-ui/tilt': {
    Tilt: {
      maxTilt: { value: 10, min: 0, max: 50, step: 1 },
      perspective: { value: 800, min: 200, max: 5000, step: 10 },
    },
  },
  'animate-ui/magnetic': {
    Magnetic: {
      onlyOnHover: { value: false },
      strength: { value: 0.5, min: 0, max: 1, step: 0.05 },
      range: { value: 120 },
    },
  },
  'animate-ui/button': {
    Button: {
      tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
    },
  },
  'animate-ui/ripple-button': {
    RippleButton: {
      tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
    },
  },
  'animate-ui/copy-button': {
    CopyButton: {
      variant: {
        value: 'default',
        options: {
          default: 'default',
          accent: 'accent',
          destructive: 'destructive',
          outline: 'outline',
          secondary: 'secondary',
          ghost: 'ghost',
          link: 'link',
        },
      },
      size: {
        value: 'default',
        options: { default: 'default', xs: 'xs', sm: 'sm', lg: 'lg' },
      },
    },
  },
  'animate-ui/icon-button': {
    IconButton: {
      variant: {
        value: 'outline',
        options: {
          default: 'default',
          accent: 'accent',
          outline: 'outline',
          ghost: 'ghost',
        },
      },
      size: {
        value: 'default',
        options: { default: 'default', sm: 'sm', lg: 'lg' },
      },
    },
  },
  'animate-ui/scroll-progress': {
    ScrollProgressProvider: {
      global: { value: false },
      direction: {
        value: 'vertical',
        options: { horizontal: 'horizontal', vertical: 'vertical' },
      },
    },
  },
  'animate-ui/cursor': {
    CursorProvider: {
      global: { value: false },
      enableCursor: { value: true },
      enableCursorFollow: { value: true },
    },
    CursorFollow: {
      side: {
        value: 'bottom',
        options: { top: 'top', right: 'right', bottom: 'bottom', left: 'left' },
      },
      sideOffset: { value: 15 },
      align: {
        value: 'end',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 5 },
    },
  },
  'animate-ui/tooltip': {
    TooltipProvider: {
      openDelay: { value: 0 },
      closeDelay: { value: 300 },
    },
    Tooltip: {
      side: {
        value: 'top',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 10 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
    TooltipArrow: {
      withTransition: { value: true },
    },
  },
  'animate-ui/particles': {
    ParticlesEffect: {
      side: {
        value: 'top',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 0, min: 0, max: 50, step: 1 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0, min: -50, max: 50, step: 1 },
      count: { value: 6, min: 1, max: 30, step: 1 },
      radius: { value: 30, min: 10, max: 100, step: 1 },
      spread: { value: 360, min: 0, max: 1000, step: 1 },
      duration: { value: 0.8, min: 0.1, max: 2, step: 0.1 },
      holdDelay: { value: 0.05, min: 0, max: 0.2, step: 0.01 },
      delay: { value: 0, min: 0, max: 3, step: 0.1 },
    },
  },
  'animate-ui/theme-toggler': {
    ThemeToggler: {
      direction: {
        value: 'ltr',
        options: { btt: 'btt', ttb: 'ttb', ltr: 'ltr', rtl: 'rtl' },
      },
    },
  },
  'animate-ui/shine': {
    Shine: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      duration: { value: 1200, min: 0, max: 3000, step: 100 },
      loop: { value: true },
      loopDelay: { value: 500, min: 0, max: 3000, step: 100 },
      deg: { value: -15, min: -50, max: 50, step: 5 },
      enable: { value: true },
      enableOnHover: { value: false },
      enableOnTap: { value: false },
    },
  },
  'animate-ui/scroll-fade': {
    ScrollFade: {
      size: { value: 40, min: 0, max: 120, step: 4 },
      shrink: { value: 0.03, min: 0, max: 0.2, step: 0.005 },
      blur: { value: 4, min: 0, max: 8, step: 0.5 },
    },
  },
  'animate-ui/click': {
    Click: {
      global: { value: false },
      duration: { value: 400, min: 0, max: 3000, step: 100 },
      size: { value: 100, min: 0, max: 300, step: 10 },
    },
  },
  'animate-ui/highlight': {
    Highlight: {
      mode: {
        value: 'children',
        options: { children: 'children', parent: 'parent' },
      },
      exitDelay: { value: 200, min: 0, max: 3000, step: 100 },
      hover: { value: false },
    },
  },
  'animate-ui/counting-number': {
    CountingNumber: {
      number: { value: 2025 },
      fromNumber: { value: 0 },
      padStart: { value: false },
      decimalSeparator: { value: '.' },
      decimalPlaces: { value: 0 },
      delay: { value: 0, min: 0, max: 3000, step: 100 },
    },
  },
  'animate-ui/gradient-text': {
    GradientText: {
      neon: { value: false },
    },
  },
  'animate-ui/highlight-text': {
    HighlightText: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
    },
  },
  'animate-ui/morphing-text': {
    MorphingText: {
      loop: { value: true },
      holdDelay: { value: 2500, min: 0, max: 3000, step: 100 },
    },
  },
  'animate-ui/rotating-text': {
    RotatingTextContainer: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      y: { value: -50, min: -100, max: 100, step: 10 },
      duration: { value: 2000, min: 1000, max: 5000, step: 100 },
      align: {
        value: 'none',
        options: { none: 'none', start: 'start', center: 'center', end: 'end' },
      },
    },
  },
  'animate-ui/scrolling-number': {
    ScrollingNumberContainer: {
      direction: {
        value: 'btt',
        options: { btt: 'btt', ttb: 'ttb', ltr: 'ltr', rtl: 'rtl' },
      },
    },
    ScrollingNumber: {
      delay: { value: 1000, min: 0, max: 3000, step: 100 },
    },
  },
  'animate-ui/shimmering-text': {
    ShimmeringText: {
      wave: { value: false },
      duration: { value: 1, min: 0.1, max: 3, step: 0.1 },
    },
  },
  'animate-ui/sliding-number': {
    SlidingNumber: {
      number: { value: 2025 },
      fromNumber: { value: true },
      padStart: { value: true },
      decimalSeparator: { value: ',' },
      decimalPlaces: { value: 0 },
      thousandSeparator: { value: '.' },
      delay: { value: 0, min: 0, max: 3000, step: 100 },
    },
  },
  'animate-ui/sliding-text': {
    SlidingText: {
      direction: {
        value: 'down',
        options: { down: 'down', up: 'up' },
      },
      trigger: {
        value: 'hover',
        options: { hover: 'hover', click: 'click' },
      },
    },
  },
  'animate-ui/splitting-text': {
    SplittingText: {
      type: {
        value: 'chars',
        options: { chars: 'chars', words: 'words', lines: 'lines' },
      },
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      animation: {
        value: 'default',
        options: { default: 'default', vibe: 'vibe', writing: 'writing' },
      },
    },
  },
  'animate-ui/swapping-text': {
    SwappingText: {
      direction: {
        value: 'up',
        options: { up: 'up', down: 'down' },
      },
      stagger: { value: 0.07, min: 0, max: 0.15, step: 0.01 },
      duration: { value: 2000, min: 500, max: 5000, step: 100 },
    },
  },
  'animate-ui/typing-text': {
    TypingText: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      holdDelay: { value: 1000, min: 0, max: 3000, step: 100 },
      loop: { value: false },
      cursor: { value: true },
    },
  },
  'animate-ui/rolling-text': {
    RollingText: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
    },
  },
  'reka-ui/dropdown-menu': {
    DropdownMenuContent: {
      side: {
        value: 'bottom',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 4 },
      align: {
        value: 'start',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
  'reka-ui/preview-link-card': {
    PreviewLinkCard: {
      followCursor: {
        value: false,
        options: { false: false, true: true, x: 'x', y: 'y' },
      },
      href: { value: 'https://animate-ui.com/docs' },
    },
    PreviewLinkCardContent: {
      side: {
        value: 'top',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 4 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
  },
  'reka-ui/select': {
    SelectContent: {
      position: {
        value: 'item-aligned',
        options: { 'item-aligned': 'item-aligned', popper: 'popper' },
      },
      side: {
        value: 'bottom',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 0 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
  'reka-ui/combobox': {
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
  'reka-ui/menubar': {
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
  'reka-ui/context-menu': {
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
  'reka-ui/tooltip': {
    Tooltip: {
      followCursor: {
        value: false,
        options: { false: false, true: true, x: 'x', y: 'y' },
      },
    },
    TooltipContent: {
      side: {
        value: 'top',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 0 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
  },
  'reka-ui/hover-card': {
    HoverCard: {
      followCursor: {
        value: false,
        options: { false: false, true: true, x: 'x', y: 'y' },
      },
    },
    HoverCardContent: {
      side: {
        value: 'bottom',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 4 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
  },
  'reka-ui/popover': {
    PopoverContent: {
      side: {
        value: 'bottom',
        options: { top: 'top', bottom: 'bottom', left: 'left', right: 'right' },
      },
      sideOffset: { value: 4 },
      align: {
        value: 'center',
        options: { start: 'start', center: 'center', end: 'end' },
      },
      alignOffset: { value: 0 },
    },
  },
  'reka-ui/accordion': {
    Accordion: {
      multiple: { value: false },
      collapsible: { value: true },
    },
  },
  'reka-ui/toggle-group': {
    ToggleGroup: {
      multiple: { value: true },
      variant: {
        value: 'outline',
        options: { default: 'default', outline: 'outline' },
      },
      size: {
        value: 'default',
        options: { default: 'default', sm: 'sm', lg: 'lg' },
      },
      spacing: { value: 0, min: 0, max: 4, step: 1 },
    },
  },
  'reka-ui/checkbox': {
    Checkbox: {
      checked: {
        value: true,
        options: { true: true, false: false, indeterminate: 'indeterminate' },
      },
    },
    AnimateUIProvider: {
      checkAnimation: { value: 'draw', options: { draw: 'draw', pop: 'pop' } },
    },
  },
  'reka-ui/drawer': {
    Drawer: {
      direction: {
        value: 'right',
        options: { bottom: 'bottom', top: 'top', left: 'left', right: 'right' },
      },
    },
  },
  'reka-ui/toast': {
    Toaster: { progressBar: { value: true } },
  },
  'animate-ui/flip-button': {
    FlipButton: {
      from: {
        value: 'top',
        options: { top: 'top', right: 'right', bottom: 'bottom', left: 'left' },
      },
      tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
    },
  },
  'animate-ui/liquid-button': {
    LiquidButton: {
      delay: { value: 0.3, min: 0.1, max: 0.5, step: 0.05 },
      fillHeight: { value: 3, min: 0, max: 10, step: 1 },
      tapScale: { value: 0.97, min: 0, max: 2, step: 0.01 },
    },
  },
  'animate-ui/github-stars-button': {
    GitHubStarsButton: {
      variant: {
        value: 'default',
        options: {
          default: 'default',
          accent: 'accent',
          outline: 'outline',
          ghost: 'ghost',
        },
      },
      size: {
        value: 'default',
        options: { default: 'default', sm: 'sm', lg: 'lg' },
      },
    },
  },
  'animate-ui/theme-toggler-button': {
    ThemeTogglerButton: {
      variant: {
        value: 'default',
        options: {
          default: 'default',
          accent: 'accent',
          outline: 'outline',
          ghost: 'ghost',
        },
      },
      size: {
        value: 'default',
        options: { default: 'default', sm: 'sm', lg: 'lg' },
      },
      system: { value: false },
    },
  },
  'animate-ui/code-block': {
    CodeBlock: {
      delay: { value: 0, min: 0, max: 3000, step: 100 },
      duration: { value: 10000, min: 0, max: 30000, step: 1000 },
      writing: { value: true },
      cursor: { value: true },
    },
  },
  'animate-ui/page-transition': {
    PageTransition: {
      effect: {
        value: 'slide',
        options: {
          fade: 'fade',
          slide: 'slide',
          push: 'push',
          zoom: 'zoom',
          iris: 'iris',
          wipe: 'wipe',
          bands: 'bands',
          stack: 'stack',
          flow: 'flow',
          chop: 'chop',
          random: 'random',
        },
      },
      shared: { value: true },
      picker: { value: true },
    },
  },
  'backgrounds/bubble': {
    BubbleBackground: { interactive: { value: true } },
  },
  'backgrounds/fireworks': {
    FireworksBackground: {
      population: { value: 1, min: 0.1, max: 10, step: 0.1 },
    },
  },
  'backgrounds/fireworks-circle': {
    FireworksBackground: {
      population: { value: 1, min: 0.1, max: 10, step: 0.1 },
      fireworkSize: { value: 7, min: 1, max: 20, step: 1 },
      fireworkSpeed: { value: 7, min: 1, max: 20, step: 1 },
      particleSize: { value: 7, min: 1, max: 20, step: 1 },
      particleSpeed: { value: 7, min: 1, max: 20, step: 1 },
    },
  },
  'backgrounds/glyph': {
    GlyphBackground: {
      glowColor: {
        value: '',
        options: { text: '', white: '#ffffff', ...BACKGROUND_COLORS },
      },
      shapeColor: {
        value: '',
        options: { text: '', white: '#ffffff', ...BACKGROUND_COLORS },
      },
      fontSize: { value: 10, min: 6, max: 16, step: 1 },
      interactive: { value: true },
    },
  },
  'backgrounds/topography': {
    TopographyBackground: {
      lineColor: { value: '', options: { text: '', ...BACKGROUND_COLORS } },
      levels: { value: 16, min: 4, max: 40, step: 1 },
      speed: { value: 1, min: 0, max: 5, step: 0.1 },
      scale: { value: 1, min: 0.3, max: 3, step: 0.1 },
      peak: { value: 1, min: 0, max: 3, step: 0.1 },
      interactive: { value: true },
    },
  },
};
