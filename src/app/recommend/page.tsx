import type { Metadata } from "next";
import { Quiz } from "@/components/pages/Tools";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = { title: "Tree Matchmaker" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Tree matchmaker" title="Find your species" lead="Four questions about your land, and species that will actually survive on it." tone="moss" seed={71} />
      <div className="wrap"><Quiz /></div>
    </>
  );
}
