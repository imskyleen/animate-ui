import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@/registry/primitives/headless/disclosure';

type HeadlessDisclosureDemoProps = {
  keepRendered: boolean;
};

export const HeadlessDisclosureDemo = ({
  keepRendered = false,
}: HeadlessDisclosureDemoProps) => {
  return (
    <Disclosure className="w-[350px]" as="div">
      <DisclosureButton className="px-3 py-1.5 border-b text-start w-[200px]">
        Recovery keys
      </DisclosureButton>
      <DisclosurePanel keepRendered={keepRendered}>
        <div className="pt-1.5 px-3 text-sm text-muted-foreground">
          <div>alien-bean-pasta</div>
          <div>wild-irish-burrito</div>
          <div>horse-battery-staple</div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
};
