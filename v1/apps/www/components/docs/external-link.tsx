'use client';

import { ExternalLinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const ExternalLink = ({
  href,
  text,
}: {
  href: string;
  text: string;
}) => {
  return (
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose w-fit flex flex-row items-center rounded-md bg-muted hover:bg-muted/70 transition pl-3 pr-2.5 py-1 text-sm font-medium text-muted-foreground"
    >
      <span>{text}</span>
      <ExternalLinkIcon className="ml-1.5 h-4 w-4" />
    </motion.a>
  );
};
