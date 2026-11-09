import { z } from "zod";

const localizedTextSchema = z.object({
  vi: z.string().min(1),
  en: z.string().min(1),
});

const localizedListSchema = z.object({
  vi: z.array(z.string().min(1)).min(1),
  en: z.array(z.string().min(1)).min(1),
});

export const categoriesResponseSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().min(1),
      title: localizedTextSchema,
      description: localizedTextSchema,
      highlights: localizedListSchema,
      sample: z.object({
        product: localizedTextSchema,
        batchCode: z.string().startsWith("DEMO-"),
      }),
    }),
  ),
});

export type Category = z.infer<typeof categoriesResponseSchema>["categories"][number];
