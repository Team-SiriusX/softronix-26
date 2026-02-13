import { ProductFilterPanel } from "@/components/product/product-filter-panel";
import { Products } from "@/components/product/products";

export default function ProductsPage() {
  return (
    <div className="flex gap-6">
      <aside className="w-80">
        <ProductFilterPanel />
      </aside>
      <main className="flex-1">
        <Products />
      </main>
    </div>
  );
}
