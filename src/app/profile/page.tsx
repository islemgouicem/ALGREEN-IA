import type { Metadata } from "next";
import { ProfileView } from "@/components/pages/Profile";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "My profile" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Account" title="My profile" tone="cobalt" seed={81} />
      <div className="wrap pagebody"><ProfileView /></div>
    </>
  );
}
