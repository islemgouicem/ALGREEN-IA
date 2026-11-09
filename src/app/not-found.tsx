import { Btn, RingArt } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="nf">
      <RingArt seed={404} count={24} className="nf__ring" />
      <h1 className="display display--xl">Nothing grows here</h1>
      <p className="lead">This page was never planted.</p>
      <Btn href="/" magnetic={false}>Back to the forest</Btn>
    </section>
  );
}
