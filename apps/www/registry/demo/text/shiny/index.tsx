'use client';

import { ShinyText, ShinyTextProps } from '@/registry/text/shiny';

type ShinyTextDemoProps = ShinyTextProps & {
  text: string;
};

export const ShinyTextDemo = ({ text, ...props }: ShinyTextDemoProps) => {
  return <ShinyText text={text} theme="auto" {...props} />;
};
