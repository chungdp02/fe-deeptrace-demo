import { categoriesResponseSchema } from "./categories-schema";

export async function loadCategories(signal?: AbortSignal) {
  const response = await fetch(`${import.meta.env.BASE_URL}data/categories.json`, { signal });
  if (!response.ok) {
    throw new Error(`Categories request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  return categoriesResponseSchema.parse(data).categories;
}
