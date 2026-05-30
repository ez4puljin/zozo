import { Truck, Wallet, ShieldCheck } from "lucide-react";

export function TrustStrip() {
  return (
    <div className="border-y">
      <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-3">
        <Cell icon={<Truck className="h-4 w-4" />}>
          Шуурхай хүргэлт <span className="text-muted-foreground">— Үнэгүй</span>
        </Cell>
        <Cell icon={<Wallet className="h-4 w-4" />}>Авахдаа төлөх</Cell>
        <Cell icon={<ShieldCheck className="h-4 w-4" />}>Чанарын баталгаатай</Cell>
      </div>
    </div>
  );
}

function Cell({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-2.5 py-4 px-3 text-[13px] font-medium text-foreground border-l first:border-l-0 border-border">
      {icon}
      <span>{children}</span>
    </div>
  );
}
