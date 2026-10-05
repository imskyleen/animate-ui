import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/registry/components/radix/accordion';

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
  showArrow?: boolean;
};

export const RadixAccordionDemo = ({
  multiple = false,
  collapsible = true,
  keepRendered = false,
  showArrow = true,
}: RadixAccordionDemoProps) => {
  return (
    <Accordion
      type={multiple ? 'multiple' : 'single'}
      collapsible={collapsible}
      className="max-w-[400px] w-full"
    >
      {ITEMS.map((item, index) => (
        <AccordionItem key={index} value={`item-${index + 1}`}>
          <AccordionTrigger showArrow={showArrow}>
            {item.title}
          </AccordionTrigger>
          <AccordionContent keepRendered={keepRendered}>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
