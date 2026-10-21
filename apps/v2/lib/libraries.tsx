import type { ComponentProps } from 'react';

export type LibraryId =
  'base-ui' | 'radix-ui' | 'react-aria' | 'animate-ui' | 'reka-ui';

type Logo = (props: ComponentProps<'svg'>) => React.JSX.Element;

export type Library = {
  id: LibraryId;
  title: string;
  docsUrl?: (name: string) => string;
  peer?: string;
  Logo: Logo;
};

function BaseUILogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 17 24" fill="currentColor" aria-hidden {...props}>
      <path d="M9.5001 7.01537C9.2245 6.99837 9 7.22385 9 7.49999V23C13.4183 23 17 19.4183 17 15C17 10.7497 13.6854 7.27351 9.5001 7.01537Z" />
      <path d="M8 9.8V12V23C3.58172 23 0 19.0601 0 14.2V12V1C4.41828 1 8 4.93989 8 9.8Z" />
    </svg>
  );
}

function RadixUILogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M11.52 24a7.68 7.68 0 0 1-7.68-7.68 7.68 7.68 0 0 1 7.68-7.68V24Zm0-24v7.68H3.84V0h7.68Zm4.8 7.68a3.84 3.84 0 1 1 0-7.68 3.84 3.84 0 0 1 0 7.68Z" />
    </svg>
  );
}

function ReactAriaLogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="200 206 800 790" fill="currentColor" aria-hidden {...props}>
      <path d="M720.67 205.995C867.583 205.995 986.679 325.091 986.68 472.003C986.68 590.753 908.865 691.325 801.446 725.521L979.312 948.055C994.438 966.98 980.963 995 956.736 995H795.612C778.743 995 762.715 987.629 751.734 974.823L697.365 911.421L493.126 653.39C457.134 607.918 489.518 540.979 547.511 540.977L720.67 540.971C758.758 540.971 789.635 510.091 789.635 472.003C789.634 433.915 758.758 403.038 720.67 403.038H429.939C404.955 403.038 388.623 391.886 373.994 373.623L277.349 252.966C262.194 234.045 275.664 205.996 299.905 205.995H720.67Z M396.605 720.706C407.798 705.406 430.443 704.843 442.381 719.568L503.816 797.018H502.786L535.569 838.934C548.074 854.358 549.943 877.191 538.047 893.09L476.638 972.545C465.692 986.707 448.803 995 430.903 995H242.276C218.18 995 204.665 967.248 219.523 948.278L337.992 797.018H337.923L396.605 720.706Z" />
    </svg>
  );
}

function RekaUILogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="22 42 242 213" fill="currentColor" aria-hidden {...props}>
      <path d="M226.269 52.4044L226.274 52.4067C237.406 58.2619 245.614 66.3008 250.94 76.5218C256.285 86.7776 258.969 98.4614 258.969 111.596C258.969 124.732 256.285 136.34 250.943 146.446C245.618 156.521 237.447 164.451 226.389 170.234C221.59 172.712 219.355 178.881 222.459 183.542L257.922 236.789C261.773 242.571 257.628 250.311 250.681 250.311H196.906C193.806 250.311 190.939 248.661 189.382 245.98L79.3991 56.5686C76.0313 50.7687 80.2159 43.5 86.9227 43.5H183.394C200.888 43.5 215.161 46.4896 226.269 52.4044Z" />
      <path d="M116.722 247.228C113.004 253.687 103.684 253.687 99.9661 247.228L26.2042 119.085C22.4947 112.64 27.1462 104.596 34.5821 104.596L182.106 104.596C189.542 104.596 194.193 112.64 190.484 119.085L116.722 247.228Z" />
    </svg>
  );
}

export function AnimateUILogo(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 840.21 783.54" fill="currentColor" aria-hidden {...props}>
      <path d="M612.79 783.54H227.43c-41.6 0-82.15-11.19-117.26-32.37-32.96-19.88-60.58-48.18-79.88-81.85C10.99 635.66.52 597.52.02 559.03c-.54-41 10.29-81.64 31.32-117.54l192.67-329.07c20.81-35.55 50.62-64.69 86.19-84.28C343.64 9.73 381.64 0 420.11 0s76.47 9.73 109.9 28.14c35.57 19.59 65.38 48.73 86.19 84.28l192.68 329.07c21.02 35.9 31.85 76.55 31.31 117.54-.5 38.49-10.97 76.62-30.27 110.29s-46.92 61.97-79.88 81.85c-35.11 21.18-75.65 32.37-117.26 32.37ZM396.6 213.47 203.92 542.54c-6.59 11.26-3.71 21.06-.13 27.31s10.59 13.69 23.63 13.69h385.36c13.04 0 20.05-7.45 23.63-13.69 3.58-6.25 6.46-16.05-.12-27.31L443.61 213.47c-6.52-11.14-16.38-13.47-23.5-13.47s-16.98 2.34-23.5 13.47Z" />
    </svg>
  );
}

export const LIBRARIES: Library[] = [
  {
    id: 'base-ui',
    title: 'Base UI',
    docsUrl: (name) => `https://base-ui.com/react/components/${name}`,
    peer: '@base-ui/react',
    Logo: BaseUILogo,
  },
  {
    id: 'radix-ui',
    title: 'Radix UI',
    docsUrl: (name) =>
      `https://www.radix-ui.com/primitives/docs/components/${name}`,
    peer: 'radix-ui',
    Logo: RadixUILogo,
  },
  {
    id: 'react-aria',
    title: 'React Aria',
    docsUrl: (name) =>
      `https://react-spectrum.adobe.com/react-aria/${name}.html`,
    peer: 'react-aria-components',
    Logo: ReactAriaLogo,
  },
  { id: 'animate-ui', title: 'Animate UI', Logo: AnimateUILogo },
  {
    id: 'reka-ui',
    title: 'Reka UI',
    docsUrl: (name) => `https://reka-ui.com/docs/components/${name}`,
    Logo: RekaUILogo,
  },
];

export function getLibrary(id: string) {
  return LIBRARIES.find((library) => library.id === id);
}
