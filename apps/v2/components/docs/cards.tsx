'use client';

import { Highlight } from '@animate-ui/react/primitives/effects/highlight';
import { cn } from 'cn';
import Link from 'fumadocs-core/link';
import {
  Children,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

export function Cards({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const cards = Children.toArray(children).filter(
    (child): child is ReactElement => isValidElement(child),
  );
  return (
    <div
      {...props}
      className={cn(
        'not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-2',
        className,
      )}
    >
      <Highlight
        hover
        className="inset-0 rounded-xl bg-accent"
        itemsClassName="h-full"
      >
        {cards}
      </Highlight>
    </div>
  );
}

export function Card({
  icon,
  title,
  description,
  href,
  external,
  className,
  children,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      {icon && (
        <div className="mb-2 w-fit text-muted-foreground [&_svg]:size-5">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {children && (
        <div className="prose-no-margin mt-1 text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </>
  );
  const classes = cn(
    'block h-full rounded-xl bg-accent/50 p-4 text-card-foreground',
    className,
  );

  return href ? (
    <Link
      href={href}
      external={external}
      data-card
      className={classes}
      {...props}
    >
      {content}
    </Link>
  ) : (
    <div data-card className={classes} {...props}>
      {content}
    </div>
  );
}
