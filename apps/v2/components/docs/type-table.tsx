'use client';

import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@animate-ui/react/primitives/tooltip';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import Link from 'fumadocs-core/link';
import type { ReactNode } from 'react';

/** Fumadocs' TypeTable entry, so MDX pages keep their props. */
export type TypeNode = {
  description?: ReactNode;
  type: ReactNode;
  typeDescription?: ReactNode;
  typeDescriptionLink?: string;
  default?: ReactNode;
  required?: boolean;
  deprecated?: boolean;
  parameters?: { name: string; description: ReactNode }[];
  returns?: ReactNode;
};

// Long types and defaults wrap instead of pushing Default out of view.
const codeClassName =
  'rounded-md bg-accent px-1.5 py-1 font-mono text-[13px] leading-7 text-foreground box-decoration-clone break-words';

function Info({ name, item }: { name: string; item: TypeNode }) {
  const { description, typeDescription, parameters = [], returns } = item;
  if (!description && !typeDescription && !parameters.length && !returns)
    return null;

  return (
    <Tooltip side="top" sideOffset={8}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`About ${name}`}
          className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            size={15}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent className="z-50 max-w-xs rounded-lg bg-foreground px-3 py-2 text-xs leading-relaxed whitespace-normal text-background shadow-md">
        <TooltipArrow className="size-2.5 fill-foreground" />
        <div className="flex flex-col gap-1.5">
          {description && <div>{description}</div>}
          {typeDescription && (
            <div>
              <span className="opacity-60">Type: </span>
              {typeDescription}
            </div>
          )}
          {parameters.map((param) => (
            <div key={param.name}>
              <span className="font-medium">{param.name}</span>:{' '}
              {param.description}
            </div>
          ))}
          {returns && (
            <div>
              <span className="opacity-60">Returns: </span>
              {returns}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * The API table: Prop, Type, Default in the accent frame, each prop a
 * rounded row on the background, the description in Animate UI's tooltip.
 * Same props as Fumadocs' TypeTable.
 */
export function TypeTable({
  id,
  type,
  className,
}: {
  id?: string;
  type: Record<string, TypeNode>;
  className?: string;
}) {
  return (
    <TooltipProvider openDelay={150}>
      <div
        id={id}
        className={cn(
          'not-prose my-6 overflow-x-auto overscroll-x-none rounded-xl bg-accent px-1 [h3+&]:mt-3 [h4+&]:mt-3',
          className,
        )}
      >
        {/* Rows are separate rounded cards: the cells carry the background. */}
        <table className="w-full min-w-xl border-separate border-spacing-x-0 border-spacing-y-1 text-left text-sm text-muted-foreground [&_tbody_td]:bg-background [&_tbody_td:first-child]:rounded-l-lg [&_tbody_td:last-child]:rounded-r-lg">
          <thead className="text-foreground">
            <tr>
              <th className="w-[30%] px-3 pt-1.5 pb-1 font-medium">Prop</th>
              <th className="w-[35%] px-3 pt-1.5 pb-1 font-medium">Type</th>
              <th className="w-[35%] px-3 pt-1.5 pb-1 font-medium">Default</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(type).map(([name, item]) => (
              <tr key={name} id={id ? `${id}-${name}` : undefined}>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <code
                      className={cn(
                        'rounded-md bg-primary/10 px-1.5 py-1 font-mono text-[13px] text-primary',
                        item.deprecated && 'line-through opacity-60',
                      )}
                    >
                      {name}
                      {!item.required && '?'}
                    </code>
                    <Info name={name} item={item} />
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {item.typeDescriptionLink ? (
                    <Link
                      href={item.typeDescriptionLink}
                      className={cn(codeClassName, 'underline')}
                    >
                      {item.type}
                    </Link>
                  ) : (
                    <code className={codeClassName}>{item.type}</code>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {item.default !== undefined && item.default !== '' ? (
                    <code className={codeClassName}>{item.default}</code>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}
