import {
  Alert02Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Idea01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

type CalloutType =
  'info' | 'warn' | 'warning' | 'error' | 'success' | 'tip' | 'idea';

const ICONS = {
  info: InformationCircleIcon,
  warning: Alert02Icon,
  error: CancelCircleIcon,
  success: CheckmarkCircle02Icon,
  idea: Idea01Icon,
};

function resolve(type: CalloutType) {
  if (type === 'warn') return 'warning';
  if (type === 'tip') return 'info';
  return type;
}

type CalloutContainerProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'title' | 'type'
> & {
  type?: CalloutType;
  icon?: ReactNode;
};

export function CalloutContainer({
  type: inputType = 'info',
  icon,
  className,
  style,
  children,
  ...props
}: CalloutContainerProps) {
  const type = resolve(inputType);
  return (
    <div
      role="note"
      className={cn(
        'my-4 flex gap-2 rounded-lg bg-accent/50 p-3 ps-2 text-sm text-card-foreground',
        className,
      )}
      style={
        {
          '--callout-color': `var(--color-fd-${type}, var(--color-fd-muted-foreground))`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <div
        role="none"
        className="w-0.5 shrink-0 rounded-sm bg-(--callout-color)/50"
      />
      {icon ?? (
        <HugeiconsIcon
          icon={ICONS[type]}
          strokeWidth={2}
          className="-me-0.5 size-5 shrink-0 text-(--callout-color)"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

export function CalloutTitle({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('my-0! font-medium', className)} {...props} />;
}

export function CalloutDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'prose-no-margin text-muted-foreground empty:hidden',
        className,
      )}
      {...props}
    />
  );
}

export function Callout({
  title,
  children,
  ...props
}: CalloutContainerProps & { title?: ReactNode }) {
  return (
    <CalloutContainer {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}
