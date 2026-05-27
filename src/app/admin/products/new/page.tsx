import { ProductForm, type ProductFormInitial } from "@/components/admin/ProductForm";

const initial: ProductFormInitial = {
  name: "",
  descriptionMd: "",
  howToUseMd: "",
  basePriceMnt: 0,
  compareAtPriceMnt: null,
  discountPercent: 0,
  stock: 0,
  lowStockThreshold: 5,
  status: "draft",
  rating: null,
  ratingCount: 0,
  seoTitle: null,
  seoDescription: null,
  position: 999,
  variants: [
    {
      label: "1 ширхэг",
      unitsPerBundle: 1,
      priceMnt: 0,
      compareAtPriceMnt: null,
      discountPercent: 0,
      isDefault: true,
      position: 0,
      badge: null,
    },
  ],
  images: [],
};

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Шинэ бараа</h1>
      <ProductForm initial={initial} />
    </div>
  );
}
