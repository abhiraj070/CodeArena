import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Card } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { cn } from "@/lib/utils.js";

const EMPTY_LOGIN_FORM = {
  email: "",
  password: "",
};

const EMPTY_SIGNUP_FORM = {
  fullName: "",
  email: "",
  password: "",
  profilePicture: null,
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN_FORM);
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [profilePreview, setProfilePreview] = useState("");

  useEffect(() => {
    if (!signupForm.profilePicture) {
      setProfilePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(signupForm.profilePicture);
    setProfilePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [signupForm.profilePicture]);

  const updateLoginField = (field) => (event) => {
    setLoginForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const updateSignupField = (field) => (event) => {
    const value = field === "profilePicture" ? event.target.files?.[0] ?? null : event.target.value;

    setSignupForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFeedback({ type: "", text: "" });
    setShowPassword(false);
  };

  const getErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message || error?.response?.data?.error || error?.message || fallbackMessage;

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setFeedback({ type: "", text: "" });

    try {
      const response = await axios.post("/feature/v1/user/login", {
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      const user = response?.data?.data?.user ?? null;
      if (user) {
        localStorage.setItem("codearena-auth-user", JSON.stringify(user));
      }

      setFeedback({
        type: "success",
        text: "Signed in successfully. Redirecting to CodeArena.",
      });
      navigate("/");
    } catch (error) {
      setFeedback({
        type: "error",
        text: getErrorMessage(error, "Unable to sign in right now."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();

    if (!signupForm.profilePicture) {
      setFeedback({ type: "error", text: "Profile picture is required." });
      return;
    }

    setLoading(true);
    setFeedback({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("fullName", signupForm.fullName.trim());
      payload.append("email", signupForm.email.trim());
      payload.append("password", signupForm.password);
      payload.append("profilePicture", signupForm.profilePicture);

      const response = await axios.post("/feature/v1/user/register", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const user = response?.data?.data?.user ?? null;
      if (user) {
        localStorage.setItem("codearena-registered-user", JSON.stringify(user));
      }

      setLoginForm({
        email: signupForm.email.trim(),
        password: "",
      });
      setSignupForm(EMPTY_SIGNUP_FORM);
      setShowPassword(false);
      setMode("login");
      setFeedback({
        type: "success",
        text: "Account created successfully. You can sign in now.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: getErrorMessage(error, "Unable to create your account right now."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between gap-12 px-6 py-8 sm:px-10 lg:px-12 lg:py-12">
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm">
              <Code2 className="h-4 w-4" />
            </span>
            Back to CodeArena
          </Link>

          <div className="max-w-xl space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Built for problem solving
              </div>
              <div className="space-y-3">
                <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  Join the workspace where code, questions, and people stay connected.
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Use the same account for practice, collaboration, and session invites. Login needs your email and password. Signup also needs your full name and a profile picture.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure access",
                  text: "Connect through the feature-service auth endpoints.",
                },
                {
                  icon: CheckCircle2,
                  title: "Fast setup",
                  text: "Create an account in one pass and sign in immediately.",
                },
                {
                  icon: Code2,
                  title: "Same stack",
                  text: "Uses the existing React, Tailwind, and Radix primitives.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className="border-border/70 bg-card/80 p-4 backdrop-blur">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="hidden items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 px-5 py-4 backdrop-blur lg:flex">
            <div>
              <p className="text-sm font-medium">Already part of the Arena?</p>
              <p className="text-xs text-muted-foreground">Log back in and continue where you left off.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/auth">Open auth page</Link>
            </Button>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 pb-10 pt-0 sm:px-6 lg:px-12 lg:py-12">
          <Card className="w-full max-w-lg border-border/80 bg-card/90 p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Authentication
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <div className="flex rounded-full border border-border bg-background p-1">
                <Button
                  type="button"
                  variant={mode === "login" ? "default" : "ghost"}
                  className="h-9 rounded-full px-4"
                  onClick={() => switchMode("login")}
                  aria-pressed={mode === "login"}
                >
                  Login
                </Button>
                <Button
                  type="button"
                  variant={mode === "signup" ? "default" : "ghost"}
                  className="h-9 rounded-full px-4"
                  onClick={() => switchMode("signup")}
                  aria-pressed={mode === "signup"}
                >
                  Sign up
                </Button>
              </div>
            </div>

            {feedback.text ? (
              <div
                className={cn(
                  "mb-5 rounded-xl border px-4 py-3 text-sm",
                  feedback.type === "success"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                {feedback.text}
              </div>
            ) : null}

            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <Field label="Email" icon={Mail}>
                  <Input
                    type="email"
                    value={loginForm.email}
                    onChange={updateLoginField("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-11 rounded-xl bg-background/60"
                  />
                </Field>

                <Field label="Password" icon={LockKeyhole}>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={updateLoginField("password")}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      className="h-11 rounded-xl bg-background/60 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Use the same feature-service account you created for CodeArena.</span>
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-primary transition hover:text-primary/80"
                  >
                    Need an account?
                  </button>
                </div>

                <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <Field label="Full name" icon={User}>
                  <Input
                    type="text"
                    value={signupForm.fullName}
                    onChange={updateSignupField("fullName")}
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                    required
                    className="h-11 rounded-xl bg-background/60"
                  />
                </Field>

                <Field label="Email" icon={Mail}>
                  <Input
                    type="email"
                    value={signupForm.email}
                    onChange={updateSignupField("email")}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-11 rounded-xl bg-background/60"
                  />
                </Field>

                <Field label="Password" icon={LockKeyhole}>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={signupForm.password}
                      onChange={updateSignupField("password")}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      required
                      className="h-11 rounded-xl bg-background/60 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="Profile picture" icon={Upload}>
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 transition hover:border-primary/50 hover:bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={profilePreview} alt={signupForm.fullName || "Profile preview"} />
                        <AvatarFallback className="bg-muted text-xs uppercase">
                          {signupForm.fullName ? signupForm.fullName.slice(0, 2) : "UP"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Upload an image</p>
                        <p className="text-xs text-muted-foreground">
                          Required by the register controller.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                      Choose file
                    </span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={updateSignupField("profilePicture")}
                      required
                      className="hidden"
                    />
                  </label>
                  {signupForm.profilePicture ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Selected: {signupForm.profilePicture.name}
                    </p>
                  ) : null}
                </Field>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Registration sends a multipart form request to the feature service.</span>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-primary transition hover:text-primary/80"
                  >
                    Already have an account?
                  </button>
                </div>

                <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to the CodeArena workflow for challenges and collaboration.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="grid gap-2">
      <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </label>
      {children}
    </div>
  );
}