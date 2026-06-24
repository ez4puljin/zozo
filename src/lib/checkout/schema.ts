import { z } from "zod";

// Mongolian mobile prefixes: 6, 7, 8, 9 followed by 7 digits → total 8 digits
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{7}$/, "8 оронтой утасны дугаар оруулна уу (Монгол)");

export const checkoutFormSchema = z.object({
  phone: phoneSchema,
  firstName: z.string().trim().min(1, "Нэр заавал бичих").max(60),
  // Овог нь заавал биш — зөвхөн нэр хангалттай.
  lastName: z.string().trim().max(60).optional().or(z.literal("")),
  district: z.string().trim().min(1, "Дүүрэг/Аймаг заавал").max(80),
  khoroo: z.string().trim().max(80).optional().or(z.literal("")),
  building: z.string().trim().max(120).optional().or(z.literal("")),
  entrance: z.string().trim().max(40).optional().or(z.literal("")),
  floor: z.string().trim().max(20).optional().or(z.literal("")),
  apartment: z.string().trim().max(40).optional().or(z.literal("")),
  additionalPhone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{7}$/, "8 оронтой дугаар")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  saveForNextTime: z.boolean().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export const checkoutSubmitSchema = z.object({
  customer: checkoutFormSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Сагс хоосон байна"),
  referrer: z.string().optional(),
  pixelEventId: z.string().optional(),
});

export type CheckoutSubmit = z.infer<typeof checkoutSubmitSchema>;
