import type { Metadata } from "next";
import Image from "next/image";
import { ForgotForm } from "@/components/pages/Forms";
import { Split } from "@/components/ui";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return (
    <section className="auth auth--sand">
      <div className="auth__art">
        <Image src="/img/photos/auth-forgot.jpg" alt="" fill sizes="50vw" priority />
      </div>
      <div className="auth__form">
        <Split as="h1" text="Lost the trail?" className="display display--lg" />
        <p className="auth__lead">Enter your email and we will help you find your way back.</p>
        <ForgotForm />
        <p className="note">Demo mode. There is no backend yet, and passwords are never stored.</p>
      </div>
    </section>
  );
}
