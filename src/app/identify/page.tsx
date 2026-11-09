import type { Metadata } from "next";
import { ComingSoon, SamplePlate, SpecimenViewer } from "@/components/pages/Identify";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Tree Identification" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Tree identification" title="Name any tree" lead="Identify tree types from a single photo, using AI. It is coming soon." tone="bloom" seed={51} />
      <div className="wrap identify">
        <ComingSoon />
        <SpecimenViewer />
        <SamplePlate />
      </div>
    </>
  );
}
