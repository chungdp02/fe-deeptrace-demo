import { describe, expect, it } from "vitest";
import { createContactSchema } from "./contact-schema";

const schema = createContactSchema({
  name: "invalid name",
  email: "invalid email",
  phone: "invalid phone",
  message: "invalid message",
});

describe("contact form validation", () => {
  it("rejects short names, malformed email, and short messages", () => {
    const result = schema.safeParse({ name: "A", email: "wrong", message: "short" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors).toEqual({
      name: ["invalid name"],
      email: ["invalid email"],
      message: ["invalid message"],
    });
  });

  it("trims valid values before they are used", () => {
    const result = schema.parse({
      name: "  Nguyễn An  ",
      email: "  an@example.com  ",
      message: "  Tôi muốn tìm hiểu thêm.  ",
    });

    expect(result).toEqual({
      name: "Nguyễn An",
      email: "an@example.com",
      message: "Tôi muốn tìm hiểu thêm.",
    });
  });

  it("accepts an empty optional phone and rejects a short one", () => {
    const base = { name: "Nguyễn An", email: "an@example.com", message: "Tôi muốn tìm hiểu thêm." };
    expect(schema.safeParse({ ...base, phone: "" }).success).toBe(true);
    expect(schema.safeParse({ ...base, phone: "123" }).success).toBe(false);
  });
});
