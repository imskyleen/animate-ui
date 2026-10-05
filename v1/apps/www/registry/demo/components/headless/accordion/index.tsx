import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from '@/registry/components/headless/accordion';

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

type HeadlessAccordionDemoProps = {
  keepRendered?: boolean;
  showArrow?: boolean;
};

export const HeadlessAccordionDemo = ({
  keepRendered = false,
  showArrow = true,
}: HeadlessAccordionDemoProps) => {
  return (
    <Accordion className="max-w-[400px] w-full">
      {ITEMS.map((item, index) => (
        <AccordionItem key={index}>
          <AccordionButton showArrow={showArrow}>{item.title}</AccordionButton>
          <AccordionPanel keepRendered={keepRendered}>
            {item.content}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
