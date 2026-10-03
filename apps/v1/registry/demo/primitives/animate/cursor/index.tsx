import {
  Cursor,
  CursorContainer,
  CursorFollow,
  CursorProvider,
  type CursorFollowSide,
  type CursorFollowAlign,
} from '@/registry/primitives/animate/cursor';

interface CursorDemoProps {
  global?: boolean;
  enableCursor?: boolean;
  enableCursorFollow?: boolean;
  side?: CursorFollowSide;
  sideOffset?: number;
  align?: CursorFollowAlign;
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
      className="max-w-[400px] h-[400px] w-full bg-accent flex items-center justify-center"
    >
      <p className="font-medium italic text-muted-foreground">
        Move your mouse over the div
      </p>
      <CursorProvider global={global}>
        <CursorContainer>
          {enableCursor && (
            <Cursor>
              <svg
                className="size-6 text-foreground"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 40 40"
              >
                <path
                  fill="currentColor"
                  d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
                />
              </svg>
            </Cursor>
          )}
          {enableCursorFollow && (
            <CursorFollow
              side={side}
              sideOffset={sideOffset}
              align={align}
              alignOffset={alignOffset}
            >
              <div className="bg-foreground text-background px-2 py-1 text-sm">
                Designer
              </div>
            </CursorFollow>
          )}
        </CursorContainer>
      </CursorProvider>
    </div>
  );
};
