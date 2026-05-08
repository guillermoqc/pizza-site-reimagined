import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { products, categoryLabels, type ProductCategory } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const allCategories: ProductCategory[] = ["pizzas", "combos", "sides", "drinks", "desserts"];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get("category");
  const categoryParam = allCategories.includes(rawCategory as ProductCategory)
    ? (rawCategory as ProductCategory)
    : null;
  const activeCategory: ProductCategory = categoryParam ?? "pizzas";
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"default" | "price-asc" | "price-desc">("default");

  useEffect(() => {
    if (rawCategory && !categoryParam) {
      setSearchParams({ category: "pizzas" }, { replace: true });
    }
  }, [categoryParam, rawCategory, setSearchParams]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => p.category === activeCategory);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc") result.sort((a, b) => a.basePrice - b.basePrice);
    if (sort === "price-desc") result.sort((a, b) => b.basePrice - a.basePrice);
    return result;
  }, [activeCategory, search, sort]);

  return (
    <div className="container py-8 space-y-6">
      <h1 className="font-display font-bold text-3xl">Menú</h1>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSearchParams({ category: cat });
              setSearch("");
            }}
            className={`shrink-0 px-5 py-2 rounded-full font-display font-semibold text-sm transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-border"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Ordenar por</SelectItem>
            <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((product, index) => (
          <div key={product.id} className="animate-fade-in [animation-fill-mode:both]" style={{ animationDelay: `${index * 50}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
