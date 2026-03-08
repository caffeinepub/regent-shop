import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";
import { SAMPLE_PRODUCTS } from "../data/sampleProducts";
import { useProduct } from "../hooks/useQueries";

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"];
const ACCESSORY_SIZES = ["One Size"];

export function ProductDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: fetchedProduct, isLoading, isError } = useProduct(id);
  const { addItem } = useCart();

  const product: Product | undefined = useMemo(() => {
    if (fetchedProduct) return fetchedProduct;
    return SAMPLE_PRODUCTS.find((p) => p.id === id);
  }, [fetchedProduct, id]);

  const sizes =
    product?.category === "accessories" ? ACCESSORY_SIZES : CLOTHING_SIZES;

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!product) return;
    const size = selectedSize || sizes[0];
    addItem(product, size, quantity);
    toast.success(`${product.name} added to cart`);
  };

  if (isLoading && !product) {
    return (
      <main className="container mx-auto px-4 md:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if ((isError && !product) || !product) {
    return (
      <main className="container mx-auto px-4 md:px-8 py-20 text-center">
        <p className="font-display text-2xl mb-4">Product not found</p>
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground underline text-sm"
        >
          ← Back to shop
        </Link>
      </main>
    );
  }

  const activeSize = selectedSize || sizes[0];

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 md:py-14">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-16 lg:gap-24">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="aspect-[4/5] overflow-hidden bg-secondary"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-5 py-2"
        >
          <div>
            <Badge
              variant="outline"
              className="font-sans text-[10px] tracking-widest uppercase mb-3"
            >
              {product.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight mb-2">
              {product.name}
            </h1>
            <p className="font-sans text-2xl text-foreground">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="font-sans text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
            {product.description}
          </p>

          {/* Size Selector */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  data-ocid="product.size.button"
                  onClick={() => setSelectedSize(size)}
                  className={`font-sans text-xs tracking-wider uppercase px-4 py-2 border transition-colors duration-150 ${
                    activeSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-2">
              Quantity
            </p>
            <div className="flex items-center gap-3 border border-border w-fit">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-secondary transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                data-ocid="product.quantity.input"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))
                }
                className="w-12 text-center font-sans text-sm bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 hover:bg-secondary transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            data-ocid="product.add_button"
            onClick={handleAddToCart}
            size="lg"
            className="font-sans text-sm tracking-widest uppercase rounded-none px-8 mt-2"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>

          <p className="font-sans text-xs text-muted-foreground">
            {Number(product.stock)} items in stock · Free shipping on orders
            over $200
          </p>
        </motion.div>
      </div>
    </main>
  );
}
