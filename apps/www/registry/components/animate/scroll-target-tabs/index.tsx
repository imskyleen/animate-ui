import * as React from 'react';

import {
  ScrollTargetTabs as ScrollTargetTabsPrimitive,
  ScrollTargetTabsList as ScrollTargetTabsListPrimitive,
  ScrollTargetTabsHighlight as ScrollTargetTabsHighlightPrimitive,
  ScrollTargetTab as ScrollTargetTabPrimitive,
  ScrollTargetContent as ScrollTargetContentPrimitive,
  ScrollTargetSection as ScrollTargetSectionPrimitive,
  type ScrollTargetTabsProps as ScrollTargetTabsPrimitiveProps,
  type ScrollTargetTabsListProps as ScrollTargetTabsListPrimitiveProps,
  type ScrollTargetTabsHighlightProps as ScrollTargetTabsHighlightPrimitiveProps,
  type ScrollTargetTabProps as ScrollTargetTabPrimitiveProps,
  type ScrollTargetContentProps as ScrollTargetContentPrimitiveProps,
  type ScrollTargetSectionProps as ScrollTargetSectionPrimitiveProps,
} from '@/registry/primitives/animate/scroll-target-tabs';
import { cn } from '@workspace/ui/lib/utils';

type ScrollTargetTabsProps = ScrollTargetTabsPrimitiveProps;

function ScrollTargetTabs({ className, ...props }: ScrollTargetTabsProps) {
  return (
    <ScrollTargetTabsPrimitive
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

type ScrollTargetTabsListProps = ScrollTargetTabsListPrimitiveProps;

function ScrollTargetTabsList({
  className,
  ...props
}: ScrollTargetTabsListProps) {
  return (
    <ScrollTargetTabsListPrimitive
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}

type ScrollTargetTabsHighlightProps = ScrollTargetTabsHighlightPrimitiveProps;

function ScrollTargetTabsHighlight({
  className,
  ...props
}: ScrollTargetTabsHighlightProps) {
  return (
    <ScrollTargetTabsHighlightPrimitive
      className={cn('bg-primary rounded-md', className)}
      {...props}
    />
  );
}

type ScrollTargetTabProps = ScrollTargetTabPrimitiveProps;

function ScrollTargetTab({ className, ...props }: ScrollTargetTabProps) {
  return (
    <ScrollTargetTabPrimitive
      className={cn(
        'data-[state=active]:text-primary-foreground text-muted-foreground hover:text-primary',
        className,
      )}
      {...props}
    />
  );
}

type ScrollTargetContentProps = ScrollTargetContentPrimitiveProps;

function ScrollTargetContent({
  className,
  ...props
}: ScrollTargetContentProps) {
  return (
    <ScrollTargetContentPrimitive
      className={cn('flex-1 h-full', className)}
      {...props}
    />
  );
}

type ScrollTargetSectionProps = ScrollTargetSectionPrimitiveProps;

function ScrollTargetSection({
  className,
  ...props
}: ScrollTargetSectionProps) {
  return (
    <ScrollTargetSectionPrimitive
      className={cn('px-1', className)}
      {...props}
    />
  );
}

export {
  ScrollTargetTabs,
  ScrollTargetTabsList,
  ScrollTargetTabsHighlight,
  ScrollTargetTab,
  ScrollTargetContent,
  ScrollTargetSection,
  type ScrollTargetTabsProps,
  type ScrollTargetTabsListProps,
  type ScrollTargetTabsHighlightProps,
  type ScrollTargetTabProps,
  type ScrollTargetContentProps,
  type ScrollTargetSectionProps,
};
