import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob, uniqueIndex, index } from "drizzle-orm/sqlite-core";

// ---------- products ----------
export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    descriptionMd: text("description_md").notNull().default(""),
    howToUseMd: text("how_to_use_md").notNull().default(""),
    basePriceMnt: integer("base_price_mnt").notNull(),
    compareAtPriceMnt: integer("compare_at_price_mnt"),
    discountPercent: integer("discount_percent").notNull().default(0),
    stock: integer("stock").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
    status: text("status", { enum: ["active", "draft"] }).notNull().default("draft"),
    rating: real("rating"),
    ratingCount: integer("rating_count").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(t.slug),
    statusIdx: index("products_status_idx").on(t.status),
    positionIdx: index("products_position_idx").on(t.position),
  })
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// ---------- product_images ----------
export const productImages = sqliteTable(
  "product_images",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    position: integer("position").notNull().default(0),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
  },
  (t) => ({
    productIdx: index("product_images_product_idx").on(t.productId, t.position),
  })
);

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

// ---------- product_variants (bundles) ----------
export const productVariants = sqliteTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    unitsPerBundle: integer("units_per_bundle").notNull().default(1),
    priceMnt: integer("price_mnt").notNull(),
    compareAtPriceMnt: integer("compare_at_price_mnt"),
    discountPercent: integer("discount_percent").notNull().default(0),
    isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
    position: integer("position").notNull().default(0),
    badge: text("badge"),
  },
  (t) => ({
    productIdx: index("product_variants_product_idx").on(t.productId, t.position),
  })
);

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

// ---------- orders ----------
export const orderStatus = ["new", "confirmed", "shipping", "done", "cancelled"] as const;
export type OrderStatus = (typeof orderStatus)[number];

export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull(),
    status: text("status", { enum: orderStatus }).notNull().default("new"),
    phone: text("phone").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    country: text("country").notNull().default("MN"),
    district: text("district").notNull(),
    khoroo: text("khoroo"),
    building: text("building"),
    entrance: text("entrance"),
    floor: text("floor"),
    apartment: text("apartment"),
    additionalPhone: text("additional_phone"),
    notes: text("notes"),
    subtotalMnt: integer("subtotal_mnt").notNull(),
    shippingMnt: integer("shipping_mnt").notNull().default(0),
    discountMnt: integer("discount_mnt").notNull().default(0),
    totalMnt: integer("total_mnt").notNull(),
    paymentMethod: text("payment_method").notNull().default("cod"),
    internalNotes: text("internal_notes").notNull().default(""),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    referrer: text("referrer"),
    pixelEventId: text("pixel_event_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => ({
    numberIdx: uniqueIndex("orders_number_idx").on(t.orderNumber),
    statusCreatedIdx: index("orders_status_created_idx").on(t.status, t.createdAt),
    phoneIdx: index("orders_phone_idx").on(t.phone),
    createdIdx: index("orders_created_idx").on(t.createdAt),
  })
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// ---------- order_items ----------
export const orderItems = sqliteTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    variantLabelSnapshot: text("variant_label_snapshot").notNull(),
    productImageSnapshot: text("product_image_snapshot"),
    unitPriceMnt: integer("unit_price_mnt").notNull(),
    compareAtMnt: integer("compare_at_mnt"),
    unitsPerBundle: integer("units_per_bundle").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalMnt: integer("line_total_mnt").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  })
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// ---------- settings (singleton row, id=1) ----------
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  shopName: text("shop_name").notNull().default("ZoZo"),
  promoBannerText: text("promo_banner_text")
    .notNull()
    .default("Чанарын баталгаатай | Шуурхай хүргэлт"),
  promoBannerEnabled: integer("promo_banner_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  announcementMd: text("announcement_md"),
  shopPhone: text("shop_phone"),
  shopEmail: text("shop_email"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Settings = typeof settings.$inferSelect;

// ---------- daily_counter for order number sequencing ----------
export const dailyCounter = sqliteTable("daily_counter", {
  dayKey: text("day_key").primaryKey(), // e.g. "260527"
  lastSeq: integer("last_seq").notNull().default(0),
});

// ---------- media (self-hosted image storage, served via /api/media/[id]) ----------
export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  mime: text("mime").notNull(),
  data: blob("data", { mode: "buffer" }).notNull(),
  size: integer("size").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Media = typeof media.$inferSelect;

// ---------- Order status Mongolian labels ----------
export const orderStatusLabel: Record<OrderStatus, string> = {
  new: "Шинэ",
  confirmed: "Баталгаажсан",
  shipping: "Хүргэж байгаа",
  done: "Дууссан",
  cancelled: "Цуцлагдсан",
};
