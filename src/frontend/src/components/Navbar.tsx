import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useIsAdmin, useSiteSettings } from "../hooks/useQueries";

export function Navbar() {
  const { totalItems } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const { data: siteSettings } = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const siteName = siteSettings?.siteName ?? "Regent Shop";

  const navLinks = [
    { href: "/", label: "Home", ocid: "nav.home_link" },
    {
      href: "/shop?category=clothing",
      label: "Clothing",
      ocid: "nav.clothing_link",
    },
    {
      href: "/shop?category=accessories",
      label: "Accessories",
      ocid: "nav.accessories_link",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath.startsWith(href.split("?")[0]);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0" data-ocid="nav.home_link">
            <span className="font-display text-xl md:text-2xl tracking-[0.1em] text-foreground uppercase">
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                data-ocid={link.ocid}
                className={`font-sans text-sm tracking-wider uppercase transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                data-ocid="nav.admin_link"
                className={`font-sans text-sm tracking-wider uppercase transition-colors duration-200 ${
                  isActive("/admin")
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              data-ocid="nav.login_link"
              className="hidden md:flex items-center gap-1.5 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              Login
            </Link>
            <Link to="/cart" data-ocid="nav.cart_link" className="relative p-2">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {totalItems > 0 && (
                <Badge
                  data-ocid="cart.badge"
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full"
                >
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-background border-t border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  data-ocid={link.ocid}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-sm tracking-wider uppercase py-2 text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  data-ocid="nav.admin_link"
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-sm tracking-wider uppercase py-2 text-foreground"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/login"
                data-ocid="nav.login_link"
                onClick={() => setMenuOpen(false)}
                className="font-sans text-sm tracking-wider uppercase py-2 text-foreground"
              >
                Login
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
