import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionHeader,
} from '@/registry/primitives/radix/accordion';

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

type RadixAccordionDemoProps = {
  multiple?: boolean;
  collapsible?: boolean;
  keepRendered?: boolean;
};

export const RadixAccordionDemo = ({
  multiple = false,
  collapsible = true,
  keepRendered = false,
}: RadixAccordionDemoProps) => {
  return (
    <Accordion
      type={multiple ? 'multiple' : 'single'}
      collapsible={collapsible}
      className="max-w-[400px] w-full"
    >
      {ITEMS.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionHeader>
            <AccordionTrigger className="border-b py-2 w-full text-start">
              {item.title}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent keepRendered={keepRendered}>
            <div className="py-2 text-sm text-muted-foreground">
              {item.content}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
