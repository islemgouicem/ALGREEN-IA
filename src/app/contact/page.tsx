import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/pages/Forms";
import { PageHero } from "@/components/ui";
import { CONTACT } from "@/lib/data";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to the forest" lead="Volunteers, associations and companies who want to fund or join a planting: we would love to hear from you." tone="clay" seed={31} />
      <section className="wrap contact" data-reveal-group>
        <ul className="contact__info">
          <li data-reveal-item><MapPin aria-hidden="true" /><div><h2 className="eyebrow">Address</h2><p>{CONTACT.address}</p></div></li>
          <li data-reveal-item><Phone aria-hidden="true" /><div><h2 className="eyebrow">Phone</h2><p><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a></p></div></li>
          <li data-reveal-item><Mail aria-hidden="true" /><div><h2 className="eyebrow">Email</h2><p><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p></div></li>
        </ul>
        <div className="panel" data-reveal-item>
          <h2 className="display display--sm contact__h">Send a message</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
