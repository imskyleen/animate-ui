import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  AccordionHeader,
} from '@/registry/primitives/base/accordion';

const ITEMS = [
  {
    title: 'What is Animate UI?',
    content:
      'Animate UI is an open-source distribution of React components built with TypeScript, Tailwind CSS, and Motion.',
  },
  {
    title: 'How is it different from other libraries?',
    content:
      'Instead of installing via NPM, you copy and paste the components directly. This gives you full control to modify or customize them as needed.',
  },
  {
    title: 'Is Animate UI free to use?',
    content:
      'Absolutely! Animate UI is fully open-source. You can use, modify, and adapt it to fit your needs.',
  },
];

type BaseAccordionDemoProps = {
  multiple?: boolean;
  keepRendered?: boolean;
};

export const BaseAccordionDemo = ({
  multiple = false,
  keepRendered = false,
}: BaseAccordionDemoProps) => {
  return (
    <Accordion multiple={multiple} className="max-w-[400px] w-full">
      {ITEMS.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionHeader>
            <AccordionTrigger className="border-b py-2 w-full text-start">
              {item.title}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel keepRendered={keepRendered}>
            <div className="py-2 text-sm text-muted-foreground">
              {item.content}
            </div>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
