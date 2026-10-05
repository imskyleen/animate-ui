import {
  Cursor,
  CursorFollow,
  CursorProvider,
  type CursorFollowProps,
} from '@/registry/components/animate/cursor';

interface CursorDemoProps {
  global?: boolean;
  enableCursor?: boolean;
  enableCursorFollow?: boolean;
  side?: CursorFollowProps['side'];
  sideOffset?: number;
  align?: CursorFollowProps['align'];
  alignOffset?: number;
}

export const CursorDemo = ({
  global = false,
  enableCursor = true,
  enableCursorFollow = true,
  side = 'bottom',
  sideOffset = 15,
  align = 'end',
  alignOffset = 5,
}: CursorDemoProps) => {
  return (
    <div
      key={String(global)}
      className="max-w-[400px] h-[400px] w-full bg-accent rounded-lg flex items-center justify-center"
    >
      <p className="font-medium italic text-muted-foreground">
        Move your mouse over the div
      </p>
      <CursorProvider global={global}>
        {enableCursor && <Cursor />}
        {enableCursorFollow && (
          <CursorFollow
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
          >
            Designer
          </CursorFollow>
        )}
      </CursorProvider>
    </div>
  );
};
