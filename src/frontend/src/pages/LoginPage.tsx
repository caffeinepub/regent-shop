import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type Mode = "login" | "signup";

export function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!isValidEmail(loginEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!loginPassword) {
      toast.error("Please enter your password.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success("Welcome back! You are now signed in.");
    router.navigate({ to: "/" });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim() || !isValidEmail(signupEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (signupPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success("Account created! Welcome to Regent Shop.");
    router.navigate({ to: "/" });
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] flex items-stretch">
      {/* Decorative left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden bg-foreground flex-col justify-between p-12">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                oklch(var(--primary-foreground)) 0px,
                oklch(var(--primary-foreground)) 1px,
                transparent 1px,
                transparent 32px
              )
            `,
          }}
        />
        {/* Gold accent circle */}
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "oklch(var(--accent))" }}
        />
        <div
          className="absolute top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ background: "oklch(var(--accent))" }}
        />

        <div className="relative z-10">
          <Link
            to="/"
            data-ocid="login.back_to_shop_link"
            className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Shop
          </Link>
        </div>

        <div className="relative z-10">
          <span className="block font-display text-4xl xl:text-5xl text-primary-foreground leading-tight mb-6">
            Regent Shop
          </span>
          <p className="font-sans text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
            Curated clothing & accessories for those who appreciate timeless
            elegance.
          </p>
        </div>

        <div className="relative z-10">
          <p className="font-sans text-xs tracking-widest uppercase text-primary-foreground/30">
            Refinement since 2024
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background">
        {/* Mobile back link */}
        <div className="lg:hidden w-full max-w-sm mb-8">
          <Link
            to="/"
            data-ocid="login.back_to_shop_link"
            className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Shop
          </Link>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="font-sans text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to your Regent Shop account"
                : "Join Regent Shop today"}
            </p>
          </motion.div>

          {/* Mode toggle */}
          <div
            data-ocid="login.toggle_tab"
            className="flex border border-border mb-8"
          >
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 font-sans text-xs tracking-widest uppercase transition-colors duration-200 ${
                mode === "login"
                  ? "bg-foreground text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 font-sans text-xs tracking-widest uppercase transition-colors duration-200 ${
                mode === "signup"
                  ? "bg-foreground text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLogin}
                noValidate
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-email"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      data-ocid="login.email_input"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-9 font-sans text-sm rounded-none border-border focus-visible:ring-foreground"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="login-password"
                      className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      data-ocid="login.forgot_password_link"
                      className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      data-ocid="login.password_input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-9 font-sans text-sm rounded-none border-border focus-visible:ring-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  data-ocid="login.submit_button"
                  disabled={loading}
                  className="w-full font-sans text-xs tracking-widest uppercase rounded-none mt-2"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <Separator className="flex-1" />
                  <span className="font-sans text-xs text-muted-foreground tracking-wider whitespace-nowrap">
                    or continue with
                  </span>
                  <Separator className="flex-1" />
                </div>

                <p className="font-sans text-xs text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-foreground hover:text-accent transition-colors underline underline-offset-2"
                  >
                    Sign up
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSignup}
                noValidate
                className="space-y-5"
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-name"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      data-ocid="login.name_input"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Jane Doe"
                      className="pl-9 font-sans text-sm rounded-none border-border focus-visible:ring-foreground"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-email"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      data-ocid="login.email_input"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-9 font-sans text-sm rounded-none border-border focus-visible:ring-foreground"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-password"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      data-ocid="login.password_input"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="pl-9 pr-9 font-sans text-sm rounded-none border-border focus-visible:ring-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-confirm"
                    className="font-sans text-xs tracking-widest uppercase text-muted-foreground"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="signup-confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      data-ocid="login.confirm_password_input"
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder="Repeat password"
                      className="pl-9 pr-9 font-sans text-sm rounded-none border-border focus-visible:ring-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirm ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  data-ocid="login.submit_button"
                  disabled={loading}
                  className="w-full font-sans text-xs tracking-widest uppercase rounded-none mt-2"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating account…
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <Separator className="flex-1" />
                  <span className="font-sans text-xs text-muted-foreground tracking-wider whitespace-nowrap">
                    or continue with
                  </span>
                  <Separator className="flex-1" />
                </div>

                <p className="font-sans text-xs text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-foreground hover:text-accent transition-colors underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
