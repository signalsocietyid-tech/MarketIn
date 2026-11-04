"use client";

import { Accordion, AccordionItem, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { FAQ_GROUPS } from "@/content/faq";

export function FaqTabs({ defaultGroup = "business" }: { defaultGroup?: string }) {
  return (
    <Tabs defaultValue={defaultGroup}>
      <div className="flex justify-center">
        <TabsList className="glass max-w-full overflow-x-auto rounded-full border-0 p-1 scrollbar-none">
          {FAQ_GROUPS.map((g) => (
            <TabsTrigger
              key={g.id}
              value={g.id}
              className="rounded-full px-4 py-2 data-[state=active]:bg-gradient-to-b data-[state=active]:from-brand-400 data-[state=active]:to-brand-500 data-[state=active]:text-white data-[state=active]:shadow-[0_6px_16px_-6px_rgb(244_119_53/0.7)]"
            >
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {FAQ_GROUPS.map((g) => (
        <TabsContent key={g.id} value={g.id} className="glass mx-auto mt-8 max-w-3xl rounded-[1.75rem] px-6 sm:px-8">
          <Accordion type="single" collapsible defaultValue={`${g.id}-0`}>
            {g.items.map((item, i) => (
              <AccordionItem key={item.q} value={`${g.id}-${i}`} question={item.q}>
                {item.a}
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
