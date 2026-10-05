import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '@/registry/primitives/base/collapsible';

type BaseCollapsibleDemoProps = {
  keepRendered: boolean;
};

export const BaseCollapsibleDemo = ({
  keepRendered = false,
}: BaseCollapsibleDemoProps) => {
  return (
    <Collapsible>
      <CollapsibleTrigger className="px-3 py-1.5 border-b text-start w-[200px]">
        Recovery keys
      </CollapsibleTrigger>
      <CollapsiblePanel keepRendered={keepRendered}>
        <div className="pt-1.5 px-3 text-sm text-muted-foreground">
          <div>alien-bean-pasta</div>
          <div>wild-irish-burrito</div>
          <div>horse-battery-staple</div>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
};
