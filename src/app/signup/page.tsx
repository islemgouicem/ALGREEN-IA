import type { Metadata } from "next";
import Image from "next/image";
import { SignupForm } from "@/components/pages/Forms";
import { Split } from "@/components/ui";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return (
    <section className="auth auth--moss">
      <div className="auth__art">
        <Image src="/img/photos/auth-signup.jpg" alt="" fill sizes="50vw" priority />
      </div>
      <div className="auth__form">
        <Split as="h1" text="Put down roots" className="display display--lg" />
        <p className="auth__lead">Create an account to join campaigns and track what you grow.</p>
        <SignupForm />
        <p className="note">Demo mode. There is no backend yet, and passwords are never stored.</p>
      </div>
    </section>
  );
}
