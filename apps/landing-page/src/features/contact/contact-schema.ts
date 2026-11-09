import { z } from "zod";

type ContactErrors = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export function createContactSchema(errors: ContactErrors) {
  return z.object({
    name: z.string().trim().min(2, errors.name),
    organization: z.string().trim().optional(),
    email: z.string().trim().email(errors.email),
    phone: z.string().trim().refine(
      (value) => value === "" || (/^[+()\d\s.-]+$/.test(value) && value.replace(/\D/g, "").length >= 9 && value.replace(/\D/g, "").length <= 15),
      errors.phone,
    ).optional(),
    message: z.string().trim().min(10, errors.message),
  });
}

export type ContactValues = z.infer<ReturnType<typeof createContactSchema>>;
