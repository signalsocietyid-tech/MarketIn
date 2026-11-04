"use client";

import { Accordion, AccordionItem, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { FAQ_GROUPS } from "@/content/faq";

export function FaqTabs({ defaultGroup = "business" }: { defaultGroup?: string }) {
  return (
    <Tabs defaultValue={defaultGroup}>
      <div className="flex justify-center">
        <TabsList className="max-w-full overflow-x-auto scrollbar-none">
          {FAQ_GROUPS.map((g) => (
            <TabsTrigger key={g.id} value={g.id}>
              {g.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {FAQ_GROUPS.map((g) => (
        <TabsContent key={g.id} value={g.id} className="mx-auto mt-8 max-w-3xl rounded-xl border border-line bg-white px-6 shadow-card">
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
