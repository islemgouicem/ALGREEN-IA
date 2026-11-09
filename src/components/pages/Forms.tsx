"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Send } from "lucide-react";
import { Field } from "@/components/ui";
import { getState, setState, toast, useApp } from "@/lib/store";

const EMAIL = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const NAME = /^[\p{L}][\p{L}\s'-]{1,39}$/u;

export function validEmail(v: string) {
  if (!v.trim()) return "Email cannot be empty.";
  return EMAIL.test(v.trim()) ? "" : "Please enter a valid email address.";
}

function passwordProblem(v: string) {
  if (v.length < 8) return "Password must contain at least 8 characters.";
  if (!/[a-z]/.test(v)) return "Password must contain at least 1 lowercase letter.";
  if (!/[A-Z]/.test(v)) return "Password must contain at least 1 uppercase letter.";
  if (!/\d/.test(v)) return "Password must contain at least 1 number.";
  return "";
}

type Errors = Record<string, string>;

function focusFirstError(errs: Errors) {
  const first = Object.keys(errs).find((k) => errs[k]);
  if (first) requestAnimationFrame(() => document.getElementById(first)?.focus());
  return !first;
}

const describe = (id: string, err?: string) => (err ? { "aria-invalid": true, "aria-describedby": `${id}-err` } : {});

function Password({ id, value, onChange, error, label, autoComplete, hint }: {
  id: string; value: string; onChange: (v: string) => void; error?: string; label: string; autoComplete: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <div className="pw">
        <input id={id} type={show ? "text" : "password"} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} {...describe(id, error)} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
          {show ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
    </Field>
  );
}

function finishLogin(router: ReturnType<typeof useRouter>) {
  const next = getState().afterLogin ?? "/profile";
  setState({ afterLogin: null, loginReason: null });
  router.push(next);
}

export function LoginForm() {
  const router = useRouter();
  const reason = useApp((s) => s.loginReason);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { "login-email": validEmail(email), "login-password": password ? "" : "Password cannot be empty." };
    setErrors(errs);
    if (!focusFirstError(errs)) return;
    const name = email.split("@")[0].replace(/[._-]+/g, " ");
    setState({ user: { firstName: name.charAt(0).toUpperCase() + name.slice(1), lastName: "", email: email.trim(), phone: "", emailAlerts: false } });
    toast("Welcome back.");
    finishLogin(router);
  };

  return (
    <form onSubmit={submit} noValidate className="form">
      {reason === "join" ? <p className="form__note" role="status">You must log in to join a campaign.</p> : null}
      {reason === "create" ? <p className="form__note" role="status">You must log in to create a campaign.</p> : null}
      <Field id="login-email" label="Email" error={errors["login-email"]}>
        <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...describe("login-email", errors["login-email"])} />
      </Field>
      <Password id="login-password" label="Password" value={password} onChange={setPassword} error={errors["login-password"]} autoComplete="current-password" />
      <div className="form__row">
        <label className="check"><input type="checkbox" /> Remember me</label>
        <Link href="/forgot">Forgot password?</Link>
      </div>
      <button type="submit" className="btn btn--solid form__submit"><span>Log in</span></button>
      <p className="form__alt">Don&rsquo;t have an account? <Link href="/signup">Register</Link></p>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [v, setV] = useState({ first: "", last: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof typeof v) => (val: string) => setV((o) => ({ ...o, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Errors = {
      "s-first": !v.first.trim() ? "First name is required." : NAME.test(v.first.trim()) ? "" : "Please use letters only.",
      "s-last": !v.last.trim() ? "Last name is required." : NAME.test(v.last.trim()) ? "" : "Please use letters only.",
      "s-email": validEmail(v.email),
      "s-password": passwordProblem(v.password),
      "s-confirm": v.confirm === v.password ? "" : "Passwords do not match.",
    };
    setErrors(errs);
    if (!focusFirstError(errs)) return;
    setState({ user: { firstName: v.first.trim(), lastName: v.last.trim(), email: v.email.trim(), phone: "", emailAlerts: false } });
    toast(`Welcome to the forest, ${v.first.trim()}.`);
    finishLogin(router);
  };

  return (
    <form onSubmit={submit} noValidate className="form">
      <div className="form__two">
        <Field id="s-first" label="First name" error={errors["s-first"]}>
          <input id="s-first" autoComplete="given-name" value={v.first} onChange={(e) => set("first")(e.target.value)} {...describe("s-first", errors["s-first"])} />
        </Field>
        <Field id="s-last" label="Last name" error={errors["s-last"]}>
          <input id="s-last" autoComplete="family-name" value={v.last} onChange={(e) => set("last")(e.target.value)} {...describe("s-last", errors["s-last"])} />
        </Field>
      </div>
      <Field id="s-email" label="Email" error={errors["s-email"]}>
        <input id="s-email" type="email" autoComplete="email" value={v.email} onChange={(e) => set("email")(e.target.value)} {...describe("s-email", errors["s-email"])} />
      </Field>
      <Password id="s-password" label="Password" value={v.password} onChange={set("password")} error={errors["s-password"]} autoComplete="new-password" hint="At least 8 characters, with upper case, lower case and a number." />
      <Password id="s-confirm" label="Confirm password" value={v.confirm} onChange={set("confirm")} error={errors["s-confirm"]} autoComplete="new-password" />
      <label className="check"><input type="checkbox" /> Remember me</label>
      <button type="submit" className="btn btn--solid form__submit"><span>Sign up</span></button>
      <p className="form__alt">Already have an account? <Link href="/login">Log in</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  if (sent) return <p className="form__note" role="status">If an account exists for {email}, a reset link will be sent once email delivery is connected.</p>;
  return (
    <form className="form" noValidate onSubmit={(e) => {
      e.preventDefault();
      const err = validEmail(email);
      setError(err);
      if (err) document.getElementById("f-email")?.focus();
      else setSent(true);
    }}>
      <Field id="f-email" label="Email" error={error}>
        <input id="f-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} {...describe("f-email", error)} />
      </Field>
      <button type="submit" className="btn btn--solid form__submit"><span>Send reset link</span></button>
      <p className="form__alt"><Link href="/login">Back to log in</Link></p>
    </form>
  );
}

export function ContactForm() {
  const [v, setV] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="form__done" role="status">
        <h2 className="display display--sm">Thank you, {v.name.split(" ")[0]}.</h2>
        <p>Your message is ready to go. Sending will be switched on with the backend, so for now please also write to us directly.</p>
        <button type="button" className="linklike" onClick={() => { setSent(false); setV({ name: "", email: "", message: "" }); }}>Write another message</button>
      </div>
    );
  }
  return (
    <form className="form" noValidate onSubmit={(e) => {
      e.preventDefault();
      const errs: Errors = {
        "c-name": !v.name.trim() ? "Full name cannot be empty." : NAME.test(v.name.trim()) ? "" : "Name must only contain letters.",
        "c-email": validEmail(v.email),
        "c-message": v.message.trim() ? "" : "Message cannot be empty.",
      };
      setErrors(errs);
      if (focusFirstError(errs)) setSent(true);
    }}>
      <Field id="c-name" label="Full name" error={errors["c-name"]}>
        <input id="c-name" autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} {...describe("c-name", errors["c-name"])} />
      </Field>
      <Field id="c-email" label="Email" error={errors["c-email"]}>
        <input id="c-email" type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} {...describe("c-email", errors["c-email"])} />
      </Field>
      <Field id="c-message" label="Your message" error={errors["c-message"]}>
        <textarea id="c-message" value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} {...describe("c-message", errors["c-message"])} />
      </Field>
      <button type="submit" className="btn btn--solid form__submit"><span>Send</span><Send size={17} aria-hidden="true" /></button>
    </form>
  );
}
