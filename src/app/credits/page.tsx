import type { Metadata } from "next";
import { PageHero } from "@/components/ui";
import credits from "@/lib/credits.json";

export const metadata: Metadata = { title: "Photo credits" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Credits" title="Photo credits" lead="Photographs come from Wikimedia Commons under the licenses listed here. Team and contributor portraits are the Algreenia team's own." tone="moss" seed={101} />
      <div className="wrap pagebody">
        <div className="tablewrap" tabIndex={0} role="region" aria-label="Photo credits">
          <table className="table">
            <caption className="sr">Photographs used on this site</caption>
            <thead><tr><th scope="col">Used for</th><th scope="col">Photo</th><th scope="col">Author</th><th scope="col">License</th></tr></thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c.file}>
                  <td>{c.use}</td>
                  <td><a href={c.page} target="_blank" rel="noreferrer">{c.title}</a></td>
                  <td>{c.artist || "Unknown"}</td>
                  <td>{c.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
