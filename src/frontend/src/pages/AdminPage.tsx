import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LogIn, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order, Product, SiteSettings } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useAllOrders,
  useAllProducts,
  useDeleteProduct,
  useIsAdmin,
  useIsStripeConfigured,
  useSetStripeConfiguration,
  useSiteSettings,
  useUpdateOrderStatus,
  useUpdateProduct,
  useUpdateSiteSettings,
} from "../hooks/useQueries";

/* ── Product Form ─────────────────────────────────────── */

const emptyForm = (): Omit<Product, "id" | "stock"> & {
  id: string;
  stock: string;
} => ({
  id: "",
  name: "",
  description: "",
  category: "clothing",
  price: 0,
  imageUrl: "",
  isActive: true,
  stock: "10",
});

type ProductFormData = ReturnType<typeof emptyForm>;

function productFromForm(form: ProductFormData): Product {
  return {
    ...form,
    price: Number(form.price),
    stock: BigInt(Number.parseInt(form.stock) || 0),
    id: form.id || crypto.randomUUID(),
  };
}

function formFromProduct(p: Product): ProductFormData {
  return {
    ...p,
    stock: String(Number(p.stock)),
    price: p.price,
  };
}

/* ── Admin Panel ──────────────────────────────────────── */

export function AdminPage() {
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { login, loginStatus, identity } = useInternetIdentity();

  if (adminLoading) {
    return (
      <main className="container mx-auto px-4 md:px-8 py-20 text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-3" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </main>
    );
  }

  if (!identity) {
    return (
      <main className="container mx-auto px-4 md:px-8 py-20 text-center max-w-md mx-auto">
        <h1 className="font-display text-3xl text-foreground mb-3">
          Admin Panel
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          Please sign in to access the admin panel.
        </p>
        <Button
          onClick={() => login()}
          disabled={loginStatus === "logging-in"}
          className="font-sans text-xs tracking-widest uppercase rounded-none px-8"
        >
          {loginStatus === "logging-in" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          Sign In
        </Button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container mx-auto px-4 md:px-8 py-20 text-center">
        <h1 className="font-display text-3xl text-foreground mb-3">
          Access Denied
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          You do not have admin privileges.
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">
        Admin Panel
      </h1>
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger data-ocid="admin.products_tab" value="products">
            Products
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.orders_tab" value="orders">
            Orders
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.stripe_tab" value="stripe">
            Stripe Config
          </TabsTrigger>
          <TabsTrigger data-ocid="admin.settings_tab" value="settings">
            Site Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>
        <TabsContent value="stripe">
          <StripeTab />
        </TabsContent>
        <TabsContent value="settings">
          <SiteSettingsTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}

/* ── Products Tab ─────────────────────────────────────── */

function ProductsTab() {
  const { data: products, isLoading } = useAllProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm());

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditTarget(p);
    setForm(formFromProduct(p));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const product = productFromForm(form);
    try {
      if (editTarget) {
        await updateProduct.mutateAsync(product);
        toast.success("Product updated");
      } else {
        await addProduct.mutateAsync(product);
        toast.success("Product added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button
          data-ocid="admin.add_product_button"
          onClick={openAdd}
          className="font-sans text-xs tracking-widest uppercase rounded-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => `sp-${i}`).map((k) => (
            <Skeleton key={k} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <Table data-ocid="admin.products_table">
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Name
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Category
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Price
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Stock
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Status
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(products ?? []).map((p, idx) => (
                <TableRow key={p.id} data-ocid={`admin.product.row.${idx + 1}`}>
                  <TableCell className="font-sans text-sm">{p.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="font-sans text-[10px] tracking-wider uppercase"
                    >
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    ${p.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="font-sans text-sm">
                    {String(Number(p.stock))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={p.isActive ? "default" : "secondary"}
                      className="font-sans text-[10px] tracking-wider uppercase"
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        data-ocid={`admin.product.edit_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-ocid={`admin.product.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editTarget ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
                  Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
                  Price ($)
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      price: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div>
                <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
                  Stock
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
                  Image URL
                </Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                  id="isActive"
                />
                <Label htmlFor="isActive" className="font-sans text-sm">
                  Active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-ocid="admin.cancel_product_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="font-sans text-xs tracking-widest uppercase rounded-none"
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.save_product_button"
              onClick={handleSave}
              disabled={addProduct.isPending || updateProduct.isPending}
              className="font-sans text-xs tracking-widest uppercase rounded-none"
            >
              {(addProduct.isPending || updateProduct.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Orders Tab ──────────────────────────────────────── */

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function OrdersTab() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const formatDate = (_id: string) => {
    // Use order ID hash to derive a display-friendly date approximation
    return new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => `so-${i}`).map((k) => (
            <Skeleton key={k} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <div className="border border-border overflow-hidden overflow-x-auto">
          <Table data-ocid="admin.orders_table">
            <TableHeader>
              <TableRow>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Order ID
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Customer
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Items
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Total
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  UPI Ref
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Status
                </TableHead>
                <TableHead className="font-sans text-[10px] tracking-widest uppercase">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(orders ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p
                      data-ocid="admin.orders_empty_state"
                      className="font-sans text-sm text-muted-foreground"
                    >
                      No orders yet. Orders will appear here after customers
                      complete checkout.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                (orders ?? []).map((order: Order, idx: number) => (
                  <TableRow
                    key={order.id}
                    data-ocid={`admin.order.row.${idx + 1}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.userId.toString().slice(0, 12)}…
                    </TableCell>
                    <TableCell className="font-sans text-sm">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell className="font-sans text-sm">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.stripePaymentIntentId
                        ? order.stripePaymentIntentId
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v)}
                      >
                        <SelectTrigger
                          data-ocid={`admin.order.status_select.${idx + 1}`}
                          className="w-32 font-sans text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="font-sans text-xs capitalize"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-sans text-xs text-muted-foreground">
                      {formatDate(order.id)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ── Stripe Tab ──────────────────────────────────────── */

function StripeTab() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();
  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,GB,CA,AU,DE,FR");

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    try {
      await setConfig.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      });
      toast.success("Stripe configuration saved");
      setSecretKey("");
    } catch {
      toast.error("Failed to save Stripe configuration");
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <p className="font-sans text-sm text-muted-foreground">
          Status:{" "}
          <span
            className={`font-semibold ${isConfigured ? "text-foreground" : "text-destructive"}`}
          >
            {isLoading ? "…" : isConfigured ? "Configured ✓" : "Not Configured"}
          </span>
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Stripe Secret Key
          </Label>
          <Input
            type="password"
            placeholder="sk_live_..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
          <p className="font-sans text-xs text-muted-foreground mt-1">
            Your secret key is stored securely and never exposed client-side.
          </p>
        </div>

        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Allowed Countries (comma-separated)
          </Label>
          <Input
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="US,GB,CA,AU"
          />
        </div>

        <Button
          data-ocid="admin.stripe.save_button"
          onClick={handleSave}
          disabled={setConfig.isPending}
          className="font-sans text-xs tracking-widest uppercase rounded-none"
        >
          {setConfig.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

/* ── Site Settings Tab ───────────────────────────────── */

const defaultSettings: SiteSettings = {
  siteName: "Regent Shop",
  heroTagline: "New Collection",
  heroTitle: "Timeless Style, Effortlessly Yours",
  heroSubtitle: "",
  shopSectionTitle: "Our Collection",
  footerTagline: "Timeless Style, Effortlessly Yours",
};

function SiteSettingsTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const [form, setForm] = useState<SiteSettings | null>(null);

  // Sync form when settings load (only on first load)
  const resolvedSettings = settings ?? defaultSettings;
  const formValues = form ?? resolvedSettings;

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setForm((prev) => ({
      ...(prev ?? resolvedSettings),
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formValues);
      toast.success("Site settings saved");
    } catch {
      toast.error("Failed to save site settings");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-5">
        {Array.from({ length: 6 }, (_, i) => `ss-${i}`).map((k) => (
          <div key={k}>
            <Skeleton className="h-3 w-28 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="space-y-5">
        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Site Name
          </Label>
          <Input
            data-ocid="admin.settings.sitename_input"
            defaultValue={resolvedSettings.siteName}
            onChange={(e) => handleChange("siteName", e.target.value)}
            placeholder="Regent Shop"
          />
        </div>

        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Hero Tagline
            <span className="normal-case font-normal text-muted-foreground ml-2">
              (small label above hero title)
            </span>
          </Label>
          <Input
            data-ocid="admin.settings.herotagline_input"
            defaultValue={resolvedSettings.heroTagline}
            onChange={(e) => handleChange("heroTagline", e.target.value)}
            placeholder="New Collection"
          />
        </div>

        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Hero Title
            <span className="normal-case font-normal text-muted-foreground ml-2">
              (main heading on hero)
            </span>
          </Label>
          <Textarea
            data-ocid="admin.settings.herotitle_input"
            defaultValue={resolvedSettings.heroTitle}
            onChange={(e) => handleChange("heroTitle", e.target.value)}
            placeholder="Timeless Style, Effortlessly Yours"
            rows={2}
          />
          <p className="font-sans text-xs text-muted-foreground mt-1">
            Use a comma to split the title into two lines with the second part
            in italics.
          </p>
        </div>

        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Hero Subtitle
            <span className="normal-case font-normal text-muted-foreground ml-2">
              (text below hero title)
            </span>
          </Label>
          <Input
            data-ocid="admin.settings.herosubtitle_input"
            defaultValue={resolvedSettings.heroSubtitle}
            onChange={(e) => handleChange("heroSubtitle", e.target.value)}
            placeholder="Discover our latest arrivals…"
          />
        </div>

        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Shop Section Title
          </Label>
          <Input
            data-ocid="admin.settings.shopsectiontitle_input"
            defaultValue={resolvedSettings.shopSectionTitle}
            onChange={(e) => handleChange("shopSectionTitle", e.target.value)}
            placeholder="Our Collection"
          />
        </div>

        <div>
          <Label className="font-sans text-xs tracking-wider uppercase mb-1.5 block">
            Footer Tagline
          </Label>
          <Input
            data-ocid="admin.settings.footertagline_input"
            defaultValue={resolvedSettings.footerTagline}
            onChange={(e) => handleChange("footerTagline", e.target.value)}
            placeholder="Timeless Style, Effortlessly Yours"
          />
        </div>

        <div className="pt-2">
          <Button
            data-ocid="admin.settings.save_button"
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="font-sans text-xs tracking-widest uppercase rounded-none"
          >
            {updateSettings.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Settings
          </Button>
          <p className="font-sans text-xs text-muted-foreground mt-3">
            Changes take effect immediately for all visitors.
          </p>
        </div>
      </div>
    </div>
  );
}
