import { z } from "zod";

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Không được để trống.")
    .max(max, `Tối đa ${max} ký tự.`);
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Email không hợp lệ."));
function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").length;
  return /^\+?[0-9 ()-]+$/.test(value) && digits >= 9 && digits <= 15;
}
export const companySchema = z.object({
  name: text(150),
  code: text(30),
  email,
  phone: z.string().trim().refine(isPhone, "Số điện thoại không hợp lệ."),
  address: text(250),
  website: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || (/^https?:\/\//i.test(value) && URL.canParse(value)),
      "Website phải là URL http hoặc https hợp lệ.",
    )
    .default(""),
  representative: z.string().trim().max(100).default(""),
  description: z.string().trim().max(500).default(""),
});
export const employeeSchema = z.object({
  id: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9_-]{1,30}$/,
      "Mã nhân viên gồm chữ, số, gạch ngang hoặc gạch dưới.",
    ),
  name: text(100),
  email,
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isPhone(value),
      "Số điện thoại không hợp lệ.",
    )
    .default(""),
  department: z
    .enum(["operations", "products", "service"])
    .default("operations"),
  role: z.enum(["manager", "operator", "support"]),
  status: z.enum(["active", "inactive"]),
});
// Chỉ dùng để đọc snapshot tổ chức cũ; Ticket không còn là nghiệp vụ của ứng dụng.
const ticketSchema = z.object({
  id: text(30),
  subject: text(150),
  requester: text(100),
  email,
  message: text(2000),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  type: z.enum(["product", "account", "general"]).default("product"),
  assigneeId: z.string().nullable().default(null),
  createdAt: z.iso.datetime().default("2026-11-01T08:00:00.000Z"),
  updatedAt: z.iso.datetime().default("2026-11-01T08:00:00.000Z"),
});
export const organizationSchema = z
  .object({
    company: companySchema,
    employees: z.array(employeeSchema),
    tickets: z.array(ticketSchema),
  })
  .superRefine((state, context) => {
    for (const ticket of state.tickets) {
      if (
        ticket.assigneeId &&
        !state.employees.some(
          (item) => item.id === ticket.assigneeId && item.status === "active",
        )
      )
        context.addIssue({
          code: "custom",
          message: "Phân công tham chiếu nhân viên không hợp lệ.",
        });
      if (ticket.updatedAt < ticket.createdAt)
        context.addIssue({
          code: "custom",
          message: "Ngày cập nhật không được trước ngày tạo.",
        });
    }
    if (
      new Set(state.employees.map((item) => item.id)).size !==
        state.employees.length ||
      new Set(state.employees.map((item) => item.email.toLowerCase())).size !==
        state.employees.length ||
      new Set(state.tickets.map((item) => item.id)).size !==
        state.tickets.length
    ) {
      context.addIssue({
        code: "custom",
        message: "Dữ liệu có mã hoặc email trùng.",
      });
    }
  });
export type Company = z.infer<typeof companySchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type OrganizationState = z.infer<typeof organizationSchema>;
export const roleOptions = [
  { value: "manager", label: "Quản lý sản phẩm" },
  { value: "operator", label: "Vận hành" },
  { value: "support", label: "Hỗ trợ" },
];
export const employeeStatusOptions = [
  { value: "active", label: "Đang làm việc" },
  { value: "inactive", label: "Ngừng hoạt động" },
];
export const initialOrganization: OrganizationState = organizationSchema.parse({
  company: {
    name: "Công ty Demo DeepTrace",
    code: "DEMO-DT",
    email: "contact@deeptrace.example",
    phone: "0900000000",
    address: "123 Đường Demo, Thành phố Hồ Chí Minh",
    website: "https://deeptrace.example",
    representative: "Nguyễn Minh Anh",
    description:
      "Doanh nghiệp demo quản lý hồ sơ và thông tin sản phẩm trên DeepTrace.",
  },
  employees: [
    {
      id: "NV001",
      name: "Nguyễn Minh Anh",
      email: "minhanh@deeptrace.example",
      department: "products",
      phone: "0900000001",
      role: "manager",
      status: "active",
    },
    {
      id: "NV002",
      name: "Trần Hoàng Nam",
      email: "hoangnam@deeptrace.example",
      department: "operations",
      phone: "0900000002",
      role: "operator",
      status: "active",
    },
    {
      id: "NV003",
      name: "Lê Thu Hà",
      email: "thuha@deeptrace.example",
      department: "service",
      phone: "0900000003",
      role: "support",
      status: "inactive",
    },
  ],
  tickets: [],
});
export const ORGANIZATION_KEY = "deeptrace.admin.organization.v1";

// Không sử dụng snapshot lỗi hoặc có định danh trùng.
export function parseOrganization(raw: string | null): OrganizationState {
  try {
    const result = organizationSchema.safeParse(
      raw === null ? initialOrganization : JSON.parse(raw),
    );
    return result.success ? result.data : structuredClone(initialOrganization);
  } catch {
    return structuredClone(initialOrganization);
  }
}

export const departmentOptions = [
  { value: "operations", label: "Vận hành" },
  { value: "products", label: "Sản phẩm" },
  { value: "service", label: "Chăm sóc khách hàng" },
];
