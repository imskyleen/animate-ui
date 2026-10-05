import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/registry/primitives/radix/collapsible';

type RadixCollapsibleDemoProps = {
  keepRendered: boolean;
};

export const RadixCollapsibleDemo = ({
  keepRendered = false,
}: RadixCollapsibleDemoProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="px-3 py-1.5 border-b text-start w-[200px]">
        Recovery keys
      </CollapsibleTrigger>
      <CollapsibleContent keepRendered={keepRendered}>
        <div className="pt-1.5 px-3 text-sm text-muted-foreground">
          <div>alien-bean-pasta</div>
          <div>wild-irish-burrito</div>
          <div>horse-battery-staple</div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
