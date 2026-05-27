"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

interface Props {
  howToUseMd?: string;
  descriptionMd?: string;
}

export function HowToUseAccordion({ howToUseMd, descriptionMd }: Props) {
  return (
    <Accordion.Root type="multiple" className="divide-y border-y mt-6">
      {descriptionMd ? (
        <Accordion.Item value="description" className="">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-sm font-semibold">
              Бараа танилцуулга
              <ChevronDown className="h-4 w-4 transition group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {descriptionMd}
          </Accordion.Content>
        </Accordion.Item>
      ) : null}

      {howToUseMd ? (
        <Accordion.Item value="howto">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-sm font-semibold">
              Яаж хэрэглэх вэ?
              <ChevronDown className="h-4 w-4 transition group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {howToUseMd}
          </Accordion.Content>
        </Accordion.Item>
      ) : null}

      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left text-sm font-semibold">
            Хүргэлт ба төлбөр
            <ChevronDown className="h-4 w-4 transition group-data-[state=open]:rotate-180" />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="pb-4 text-sm text-muted-foreground leading-relaxed">
          • Шуурхай хүргэлт — Үнэгүй
          <br />
          • Төлбөр — Авахдаа төлөх
          <br />
          • Захиалга баталгаажуулсны дараа хүргэлтийн ажилтан утсаар холбогдоно.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
