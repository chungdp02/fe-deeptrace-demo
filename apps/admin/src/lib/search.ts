// Chuẩn hóa từ khóa tiếng Việt dùng chung cho các trang quản trị.
export function normalizeSearch(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLocaleLowerCase("vi");
}
