import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Loader2,
  MapPin,
  Smartphone,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateOrder } from "../hooks/useQueries";

type PaymentStep = "input" | "processing" | "success";

interface UpiApp {
  id: string;
  name: string;
  suffix: string;
  color: string;
  textColor: string;
  abbr: string;
  ocid: string;
}

interface ShipmentDetails {
  fullName: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
}

const UPI_APPS: UpiApp[] = [
  {
    id: "gpay",
    name: "GPay",
    suffix: "@okicici",
    color: "bg-[#4285F4]",
    textColor: "text-white",
    abbr: "G",
    ocid: "checkout.gpay_button",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    suffix: "@ybl",
    color: "bg-[#5F259F]",
    textColor: "text-white",
    abbr: "P",
    ocid: "checkout.phonepe_button",
  },
  {
    id: "paytm",
    name: "Paytm",
    suffix: "@paytm",
    color: "bg-[#00BAF2]",
    textColor: "text-white",
    abbr: "T",
    ocid: "checkout.paytm_button",
  },
];

function generateMockRef(): string {
  const digits = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  return `UPI${dd}${mm}${digits}`;
}

function isValidUpiId(id: string): boolean {
  const parts = id.split("@");
  return (
    parts.length === 2 &&
    parts[0].trim().length > 0 &&
    parts[1].trim().length > 0
  );
}

const emptyShipment: ShipmentDetails = {
  fullName: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  pincode: "",
};

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { identity } = useInternetIdentity();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<PaymentStep>("input");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [mockRef, setMockRef] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  const [shipment, setShipment] = useState<ShipmentDetails>(emptyShipment);
  const [savedShipment, setSavedShipment] =
    useState<ShipmentDetails>(emptyShipment);

  const isShipmentValid = () => {
    return (
      shipment.fullName.trim().length > 0 &&
      shipment.phone.trim().length > 0 &&
      shipment.address1.trim().length > 0 &&
      shipment.city.trim().length > 0 &&
      shipment.state.trim().length > 0 &&
      shipment.pincode.trim().length > 0
    );
  };

  const updateShipment = (field: keyof ShipmentDetails, value: string) => {
    setShipment((prev) => ({ ...prev, [field]: value }));
  };

  const handleAppSelect = (app: UpiApp) => {
    setSelectedApp(app.id);
    // Suggest a UPI ID if the field is empty or only has an existing suggestion
    setUpiId((prev) => {
      const prefix = prev.includes("@") ? prev.split("@")[0] : prev;
      return prefix ? `${prefix}${app.suffix}` : app.suffix;
    });
  };

  const handlePay = () => {
    if (!isValidUpiId(upiId) || !isShipmentValid()) return;
    setSavedShipment(shipment);
    setStep("processing");
    const ref = generateMockRef();
    setMockRef(ref);
    const capturedAmount = subtotal;
    const capturedItems = [...items];
    setPaidAmount(capturedAmount);

    setTimeout(() => {
      clearCart();
      setStep("success");

      // Persist order to backend (fire-and-forget — don't block UX)
      if (identity) {
        const order = {
          id: crypto.randomUUID(),
          userId: identity.getPrincipal(),
          status: "paid",
          totalAmount: capturedAmount,
          stripePaymentIntentId: ref,
          items: capturedItems.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            size: item.size,
            quantity: BigInt(item.quantity),
            unitPrice: Number(item.product.price),
          })),
        };
        createOrder.mutate(order, {
          onError: (err) => {
            console.warn("Order save failed (non-blocking):", err);
          },
        });
      } else {
        console.warn("No identity available — order not saved to backend.");
      }
    }, 2500);
  };

  if (items.length === 0 && step !== "success") {
    return (
      <main className="container mx-auto px-4 md:px-8 py-20 text-center">
        <p className="font-display text-2xl mb-4">Nothing to checkout</p>
        <Button
          asChild
          variant="outline"
          className="font-sans text-xs tracking-widest uppercase rounded-none"
        >
          <Link to="/">Continue Shopping</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 md:px-8 py-10 md:py-16 max-w-2xl">
      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">
              Checkout
            </h1>

            {/* Order Summary */}
            <div className="bg-card border border-border p-6 shadow-card mb-6">
              <h2 className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex justify-between items-center font-sans text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover bg-secondary flex-shrink-0"
                      />
                      <div>
                        <p className="text-foreground font-sans text-sm">
                          {item.product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Size: {item.size} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-sans">
                <span className="text-xs tracking-widest uppercase text-muted-foreground">
                  Total
                </span>
                <span className="font-display text-xl text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="bg-card border border-border p-6 shadow-card mb-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Shipment Details
                </h2>
              </div>

              {/* Full Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="shipment-fullname"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shipment-fullname"
                    data-ocid="checkout.fullname_input"
                    type="text"
                    value={shipment.fullName}
                    onChange={(e) => updateShipment("fullName", e.target.value)}
                    placeholder="Jane Doe"
                    className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                    autoComplete="name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="shipment-phone"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shipment-phone"
                    data-ocid="checkout.phone_input"
                    type="tel"
                    value={shipment.phone}
                    onChange={(e) => updateShipment("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* Address Line 1 */}
              <div className="space-y-1.5 mb-4">
                <Label
                  htmlFor="shipment-address1"
                  className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                >
                  Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shipment-address1"
                  data-ocid="checkout.address1_input"
                  type="text"
                  value={shipment.address1}
                  onChange={(e) => updateShipment("address1", e.target.value)}
                  placeholder="House / Flat No., Street Name"
                  className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                  autoComplete="address-line1"
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div className="space-y-1.5 mb-4">
                <Label
                  htmlFor="shipment-address2"
                  className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                >
                  Address Line 2{" "}
                  <span className="text-muted-foreground/60 normal-case tracking-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="shipment-address2"
                  data-ocid="checkout.address2_input"
                  type="text"
                  value={shipment.address2}
                  onChange={(e) => updateShipment("address2", e.target.value)}
                  placeholder="Apartment, suite, landmark, etc."
                  className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                  autoComplete="address-line2"
                />
              </div>

              {/* City + State + Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="shipment-city"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shipment-city"
                    data-ocid="checkout.city_input"
                    type="text"
                    value={shipment.city}
                    onChange={(e) => updateShipment("city", e.target.value)}
                    placeholder="Mumbai"
                    className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                    autoComplete="address-level2"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="shipment-state"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shipment-state"
                    data-ocid="checkout.state_input"
                    type="text"
                    value={shipment.state}
                    onChange={(e) => updateShipment("state", e.target.value)}
                    placeholder="Maharashtra"
                    className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                    autoComplete="address-level1"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="shipment-pincode"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Pincode / ZIP <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="shipment-pincode"
                    data-ocid="checkout.pincode_input"
                    type="text"
                    value={shipment.pincode}
                    onChange={(e) => updateShipment("pincode", e.target.value)}
                    placeholder="400001"
                    className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                    autoComplete="postal-code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* UPI Payment Section */}
            <div className="bg-card border border-border p-6 shadow-card">
              <div className="flex items-center gap-2 mb-5">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                  Pay via UPI
                </h2>
              </div>

              {/* UPI App Tiles */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {UPI_APPS.map((app) => (
                  <button
                    type="button"
                    key={app.id}
                    data-ocid={app.ocid}
                    onClick={() => handleAppSelect(app)}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-none transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selectedApp === app.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary/40"
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-full ${app.color} ${app.textColor} flex items-center justify-center font-display text-lg font-bold select-none`}
                    >
                      {app.abbr}
                    </span>
                    <span className="font-sans text-xs text-foreground tracking-wide">
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* UPI ID Input */}
              <div className="space-y-2 mb-5">
                <label
                  htmlFor="upi-id"
                  className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                >
                  UPI ID
                </label>
                <Input
                  id="upi-id"
                  data-ocid="checkout.upi_input"
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="rounded-none font-sans text-sm border-border focus-visible:ring-1 focus-visible:ring-primary"
                  autoComplete="off"
                />
                {upiId.length > 0 && !isValidUpiId(upiId) && (
                  <p className="font-sans text-xs text-destructive">
                    Enter a valid UPI ID (e.g. name@okaxis)
                  </p>
                )}
              </div>

              <Button
                data-ocid="checkout.pay_button"
                onClick={handlePay}
                disabled={!isValidUpiId(upiId) || !isShipmentValid()}
                size="lg"
                className="w-full font-sans text-sm tracking-widest uppercase rounded-none"
              >
                Pay ${subtotal.toFixed(2)} via UPI
              </Button>

              <p className="font-sans text-xs text-muted-foreground text-center mt-3">
                This is a simulated UPI payment — no real transaction will occur
              </p>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="checkout.loading_state"
          >
            <div className="mb-6 relative">
              <div className="w-20 h-20 rounded-full border-2 border-border flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">
              Processing your payment...
            </h2>
            <p className="font-sans text-sm text-muted-foreground">
              Please do not close this window
            </p>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="checkout.success_state"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="mb-6"
            >
              <CheckCircle className="w-20 h-20 text-accent mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                Payment Successful!
              </h1>
              <p className="font-sans text-sm text-muted-foreground mb-6">
                Your UPI payment of{" "}
                <span className="text-foreground font-semibold">
                  ${paidAmount.toFixed(2)}
                </span>{" "}
                has been confirmed.
              </p>

              {/* Transaction Reference */}
              <div className="bg-card border border-border px-6 py-4 mb-5 inline-block">
                <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-1">
                  Transaction Reference
                </p>
                <p className="font-display text-lg text-foreground tracking-wider">
                  {mockRef}
                </p>
              </div>

              {/* Delivering To */}
              {savedShipment.fullName && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.35 }}
                  className="bg-card border border-border px-6 py-5 mb-8 text-left w-full"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground">
                      Delivering To
                    </p>
                  </div>
                  <p className="font-sans text-sm font-semibold text-foreground mb-0.5">
                    {savedShipment.fullName}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {savedShipment.address1}
                    {savedShipment.address2
                      ? `, ${savedShipment.address2}`
                      : ""}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">
                    {savedShipment.city}, {savedShipment.state} —{" "}
                    {savedShipment.pincode}
                  </p>
                  <p className="font-sans text-xs text-muted-foreground mt-1.5">
                    {savedShipment.phone}
                  </p>
                </motion.div>
              )}

              <div>
                <Button
                  asChild
                  className="font-sans text-xs tracking-widest uppercase rounded-none px-10"
                >
                  <Link to="/">Continue Shopping</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export function CheckoutSuccessPage() {
  return (
    <main className="container mx-auto px-4 md:px-8 py-20 text-center max-w-lg">
      <div className="mb-6">
        <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="font-display text-3xl text-foreground mb-3">
          Order Placed Successfully!
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          Thank you for your purchase. You will receive a confirmation email
          shortly.
        </p>
      </div>
      <Button
        asChild
        data-ocid="checkout.success_button"
        className="font-sans text-xs tracking-widest uppercase rounded-none px-8"
      >
        <Link to="/">Continue Shopping</Link>
      </Button>
    </main>
  );
}

export function CheckoutCancelPage() {
  return (
    <main className="container mx-auto px-4 md:px-8 py-20 text-center max-w-lg">
      <div className="mb-6">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="font-display text-3xl text-foreground mb-3">
          Payment Cancelled
        </h1>
        <p className="font-sans text-sm text-muted-foreground">
          Your order was not completed. Your cart has been preserved.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button
          asChild
          data-ocid="checkout.cancel_button"
          className="font-sans text-xs tracking-widest uppercase rounded-none px-8"
        >
          <Link to="/checkout">Try Again</Link>
        </Button>
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
