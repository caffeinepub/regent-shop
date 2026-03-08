import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext";

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="container mx-auto px-4 md:px-8 py-20 text-center">
        <div data-ocid="cart.empty_state">
          <p className="font-display text-3xl text-foreground mb-3">
            Your cart is empty
          </p>
          <p className="font-sans text-sm text-muted-foreground mb-8">
            Discover our curated collection of timeless pieces.
          </p>
          <Button
            asChild
            variant="outline"
            className="font-sans text-xs tracking-widest uppercase rounded-none px-8"
          >
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 md:py-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          Shopping Cart
        </h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-14">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-0">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 pb-3 border-b border-border">
            {["Product", "Price", "Quantity", ""].map((h) => (
              <p
                key={h}
                className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground"
              >
                {h}
              </p>
            ))}
          </div>
          <AnimatePresence initial={false}>
            {items.map((item, idx) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                data-ocid={`cart.item.${idx + 1}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-[2fr_1fr_1fr_auto] gap-4 py-5 border-b border-border items-center">
                  {/* Product */}
                  <div className="flex items-center gap-4">
                    <Link
                      to="/product/$id"
                      params={{ id: item.product.id }}
                      className="flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden bg-secondary"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div>
                      <p className="font-display text-base text-foreground leading-snug">
                        {item.product.name}
                      </p>
                      <p className="font-sans text-xs text-muted-foreground mt-0.5 tracking-wider">
                        Size: {item.size}
                      </p>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <p className="font-sans text-sm text-foreground">
                    <span className="md:hidden text-muted-foreground text-xs mr-2">
                      Price:
                    </span>
                    ${Number(item.product.price).toFixed(2)}
                  </p>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 border border-border w-fit">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.size,
                          item.quantity - 1,
                        )
                      }
                      className="px-2 py-1.5 hover:bg-secondary transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-sans text-sm w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.size,
                          item.quantity + 1,
                        )
                      }
                      className="px-2 py-1.5 hover:bg-secondary transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    data-ocid={`cart.remove_button.${idx + 1}`}
                    onClick={() => removeItem(item.product.id, item.size)}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-6 shadow-card sticky top-24">
            <h2 className="font-display text-xl text-foreground mb-4">
              Order Summary
            </h2>
            <Separator className="mb-4" />
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex justify-between text-sm font-sans mb-2"
              >
                <span className="text-muted-foreground">
                  {item.product.name}{" "}
                  <span className="text-xs">×{item.quantity}</span>
                </span>
                <span className="text-foreground">
                  ${(Number(item.product.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="flex justify-between font-sans mb-6">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">
                Subtotal
              </span>
              <span className="font-display text-lg text-foreground">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Button
              asChild
              data-ocid="cart.checkout_button"
              className="w-full font-sans text-xs tracking-widest uppercase rounded-none"
              size="lg"
            >
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center mt-3">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
