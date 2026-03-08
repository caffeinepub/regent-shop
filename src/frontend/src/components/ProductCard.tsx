import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultSize = product.category === "accessories" ? "One Size" : "M";
    addItem(product, defaultSize, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      data-ocid={`shop.product.item.${index + 1}`}
      className="group"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="text-[10px] tracking-widest uppercase font-sans bg-background/90 text-foreground"
            >
              {product.category}
            </Badge>
          </div>
          {/* Quick Add overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
            <Button
              onClick={handleQuickAdd}
              className="w-full font-sans text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1">
          <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-0.5">
            {product.category}
          </p>
          <h3 className="font-display text-base text-foreground leading-snug">
            {product.name}
          </h3>
          <p className="font-sans text-sm text-foreground mt-1">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
