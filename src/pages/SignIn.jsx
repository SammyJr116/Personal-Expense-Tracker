import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { APP_NAME, APP_TAGLINE, COMPANY_DOMAIN, DEMO_ACCOUNTS } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import { isGoogleConfigured, promptGoogleSignIn } from "@/lib/google-signin";
import { cn } from "@/lib/utils";
import { ShieldCheck, Lock, ArrowRight, ChevronLeft } from "lucide-react";

// ACC-01..ACC-03: sign-in screen, company Google Workspace domain only.
// ACC-08: UI-level gate (no server enforcement). Simulated Google account picker.
// ACC-09: with a VITE_GOOGLE_CLIENT_ID configured, real GIS sign-in is used;
// without it the simulated picker remains and no GIS script loads.
export default function SignIn() {
  const { signIn } = useApp();
  const [step, setStep] = useState("intro"); // intro | picker | another
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const admit = (account) => {
    signIn(account);
  };

  const submitAnother = (e) => {
    e.preventDefault();
    setError("");
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain || domain !== COMPANY_DOMAIN) {
      setError(STRINGS.signIn.domainError(COMPANY_DOMAIN));
      return;
    }
    admit({ name: name.trim() || email.split("@")[0], email });
  };

  // ACC-09: real Google flow when a client ID exists; otherwise simulate.
  const goGoogle = async () => {
    setError("");
    if (!isGoogleConfigured()) {
      setStep("picker");
      return;
    }
    setConnecting(true);
    const res = await promptGoogleSignIn();
    setConnecting(false);
    if (res?.error) return; // prompt suppressed/canceled — leave state unchanged
    const domain = res.email.split("@")[1]?.toLowerCase();
    if (!domain || domain !== COMPANY_DOMAIN) {
      setError(STRINGS.signIn.domainError(COMPANY_DOMAIN));
      return;
    }
    admit({ name: res.name || res.email.split("@")[0], email: res.email });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:grid lg:grid-cols-2">
      {/* Left — editorial brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 7h16M4 12h10M4 17h7"/></svg>
          </div>
          <span className="font-display text-2xl font-semibold">{APP_NAME}</span>
        </div>
        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight xl:text-5xl" dangerouslySetInnerHTML={{ __html: STRINGS.signIn.editorialTitle }} />
          <p className="mt-4 max-w-md text-primary-foreground/70">
            {STRINGS.signIn.editorialBody.replaceAll("{DOMAIN}", COMPANY_DOMAIN)}
          </p>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {STRINGS.signIn.privateToYou}</div>
            <div className="flex items-center gap-2"><Lock className="h-4 w-4" /> {STRINGS.signIn.onDeviceOnly}</div>
          </div>
        </div>
        <div className="relative text-xs text-primary-foreground/50">{STRINGS.signIn.footer}</div>
      </div>

      {/* Right — sign-in flow */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {step === "intro" && (
            <div className="text-center">
              <div className="mb-6 flex items-center justify-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 7h16M4 12h10M4 17h7"/></svg>
                </div>
                <span className="font-display text-xl font-semibold">{APP_NAME}</span>
              </div>
              <h2 className="font-display text-2xl font-semibold">{STRINGS.signIn.brandSubtitle.replaceAll("{APP_NAME}", APP_NAME)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{APP_TAGLINE}</p>

              <button
                onClick={goGoogle}
                disabled={connecting}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm transition hover:shadow-md disabled:opacity-60"
              >
                <GoogleIcon />
                {connecting ? STRINGS.signIn.signingIn : STRINGS.signIn.signInGoogle}
              </button>

              {error && (
                <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}

              <p className="mt-5 text-xs text-muted-foreground">
                {STRINGS.signIn.onlyDomain(COMPANY_DOMAIN)}
              </p>
            </div>
          )}

          {step === "picker" && (
            <div>
              <button onClick={() => setStep("intro")} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" /> {STRINGS.signIn.back}
              </button>
              <h2 className="font-display text-xl font-semibold">{STRINGS.signIn.chooseAccount}</h2>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">{STRINGS.signIn.continueTo(APP_NAME)}</p>
              <div className="space-y-1.5">
                {DEMO_ACCOUNTS.map((a) => (
                  <button
                    key={a.email}
                    onClick={() => admit(a)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 text-left transition hover:border-foreground/30 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold">{a.name.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.email}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("another")}
                className="mt-3 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-foreground/80 transition hover:bg-secondary"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                {STRINGS.signIn.useAnother}
              </button>
            </div>
          )}

          {step === "another" && (
            <form onSubmit={submitAnother}>
              <button onClick={() => setStep("picker")} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" /> {STRINGS.signIn.back}
              </button>
              <h2 className="font-display text-xl font-semibold">{STRINGS.signIn.signInTitle}</h2>
              <p className="mb-5 mt-1 text-sm text-muted-foreground">{STRINGS.signIn.useDomain(COMPANY_DOMAIN)}</p>

              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{STRINGS.signIn.fullName}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={STRINGS.signIn.namePlaceholder}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{STRINGS.signIn.email}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={STRINGS.signIn.emailPlaceholder(COMPANY_DOMAIN)}
                    className={cn("w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/15", error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary")}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
              )}

              <button
                type="submit"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                {STRINGS.signIn.signInButton} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}