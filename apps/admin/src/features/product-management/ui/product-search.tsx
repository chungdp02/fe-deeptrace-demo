import { Input } from "@workspace/ui/components/input";

interface ProductSearchProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
}

export function ProductSearch({ keyword, onKeywordChange }: ProductSearchProps) {
  return <Input type="search" placeholder="Tìm theo mã, tên hoặc danh mục..." aria-label="Tìm kiếm sản phẩm" value={keyword} onChange={event => onKeywordChange(event.target.value)} />;
}
