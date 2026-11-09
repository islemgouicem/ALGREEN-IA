import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/pages/Forms";
import { Split } from "@/components/ui";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <section className="auth auth--sand">
      <div className="auth__art">
        <Image src="/img/photos/auth-login.jpg" alt="" fill sizes="50vw" priority />
      </div>
      <div className="auth__form">
        <Split as="h1" text="Welcome back" className="display display--lg" />
        <p className="auth__lead">Your trees have been waiting.</p>
        <LoginForm />
        <p className="note">Demo mode. There is no backend yet, and passwords are never stored.</p>
      </div>
    </section>
  );
}
