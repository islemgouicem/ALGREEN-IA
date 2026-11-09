import type { Metadata } from "next";
import { CampaignsView } from "@/components/pages/Campaigns";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Campaigns" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Campaigns" title="Explore and contribute" lead="Discover afforestation projects or create your own. Join the community-driven initiatives growing across Algeria." tone="canopy" seed={21} />
      <CampaignsView />
    </>
  );
}
