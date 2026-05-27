import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront/CheckoutForm";

export const metadata: Metadata = {
  title: "Захиалах",
  description: "Хүргэлтийн мэдээллээ оруулна уу.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8">Захиалах</h1>
      <CheckoutForm />
    </section>
  );
}
