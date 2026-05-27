import { Truck } from "lucide-react";

export function PromoBanner({ text }: { text: string }) {
  return (
    <div className="bg-foreground text-background text-center text-xs sm:text-sm py-2 px-4">
      <div className="inline-flex items-center gap-2">
        <Truck className="h-4 w-4" />
        <span>{text}</span>
      </div>
    </div>
  );
}
