import { Accordion, AccordionItem } from "@/components/ui/overlays";
import type { FaqGroup } from "@/content/faq";
import { cn } from "@/lib/utils";

/** Renders one FAQ group (from src/content/faq.ts) as a single-open accordion. */
export function FaqAccordion({ group, className }: { group: FaqGroup; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line bg-white px-5 shadow-card sm:px-6", className)}>
      <Accordion type="single" collapsible>
        {group.items.map((item, i) => (
          <AccordionItem key={item.q} value={`${group.id}-${i}`} question={item.q}>
            {item.a}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
