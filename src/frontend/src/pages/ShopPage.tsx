import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Product } from "../backend.d";
import { ProductCard } from "../components/ProductCard";
import { SAMPLE_PRODUCTS } from "../data/sampleProducts";
import { useActiveProducts, useSiteSettings } from "../hooks/useQueries";

type FilterCategory = "all" | "clothing" | "accessories";

export function ShopPage() {
  const search = useSearch({ strict: false }) as { category?: string };
  const initialFilter = (search.category as FilterCategory) || "all";
  const [filter, setFilter] = useState<FilterCategory>(initialFilter);

  const { data: backendProducts, isLoading } = useActiveProducts();
  const { data: siteSettings } = useSiteSettings();

  const products: Product[] = useMemo(() => {
    const bp = backendProducts ?? [];
    return bp.length > 0 ? bp : SAMPLE_PRODUCTS;
  }, [backendProducts]);

  const filtered = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  const filters: { key: FilterCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "clothing", label: "Clothing" },
    { key: "accessories", label: "Accessories" },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[55vh] md:min-h-[70vh] flex items-end">
        <img
          src="/assets/generated/hero-banner.dim_1600x700.jpg"
          alt="Regent Shop hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
        <div className="relative container mx-auto px-4 md:px-8 pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-lg"
          >
            <p className="font-sans text-xs tracking-[0.25em] uppercase text-white/80 mb-3">
              {siteSettings?.heroTagline ?? "New Collection"}
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-white leading-tight mb-5">
              {(() => {
                const title =
                  siteSettings?.heroTitle ??
                  "Timeless Style, Effortlessly Yours";
                const commaIdx = title.indexOf(",");
                if (commaIdx !== -1) {
                  return (
                    <>
                      {title.slice(0, commaIdx + 1)}
                      <br />
                      <span className="italic">
                        {title.slice(commaIdx + 1).trim()}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h1>
            {siteSettings?.heroSubtitle && (
              <p className="font-sans text-sm text-white/80 mb-5">
                {siteSettings.heroSubtitle}
              </p>
            )}
            <Button
              asChild
              size="lg"
              className="font-sans text-sm tracking-widest uppercase bg-white text-foreground hover:bg-white/90 rounded-none px-8"
            >
              <Link to="/shop">Shop Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="container mx-auto px-4 md:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="font-display text-2xl md:text-3xl text-foreground">
            {siteSettings?.shopSectionTitle ?? "Our Collection"}
          </h2>
          <div className="flex gap-1" data-ocid="shop.filter.tab">
            {filters.map((f) => (
              <button
                type="button"
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`font-sans text-xs tracking-widest uppercase px-4 py-2 border transition-colors duration-150 ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="shop.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <p className="font-display text-xl mb-2">No products found</p>
            <p className="font-sans text-sm">
              Try a different category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
