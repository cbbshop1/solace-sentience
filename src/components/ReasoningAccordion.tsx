import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ReasoningAccordionProps {
  reasoning: string | null;
}

export const ReasoningAccordion = ({ reasoning }: ReasoningAccordionProps) => {
  // Hide if no valid reasoning
  if (!reasoning || reasoning === '[No trace detected]' || reasoning.trim() === '') {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="w-full mb-2">
      <AccordionItem value="reasoning" className="border-none">
        <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-1 px-2">
          💭 View Reasoning Trace
        </AccordionTrigger>
        <AccordionContent>
          <div className="bg-muted/50 rounded-md p-3 font-mono text-xs text-muted-foreground whitespace-pre-wrap border border-border">
            {reasoning}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
