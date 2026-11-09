import type { Metadata } from "next";
import { AvailabilityView } from "@/components/pages/Profile";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Availability" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Account" title="Weekly availability" tone="rain" seed={91} />
      <div className="wrap pagebody"><AvailabilityView /></div>
    </>
  );
}
