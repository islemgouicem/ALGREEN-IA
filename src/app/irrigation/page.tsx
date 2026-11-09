import type { Metadata } from "next";
import { IrrigationView } from "@/components/pages/Irrigation";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Irrigation" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Irrigation tracker" title="Water by the forecast" lead="Monitor and manage irrigation schedules for newly planted trees." tone="rain" seed={41} />
      <IrrigationView />
    </>
  );
}
