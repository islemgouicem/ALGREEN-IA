"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, ChevronDown, Menu, MessageCircle, Sprout, UserRound, X } from "lucide-react";
import { NAV, SERVICES } from "@/lib/data";
import { gsap, isTouch, MOTION_KEY, motionAllowed } from "@/lib/gsap";
import { logout, toast, useApp } from "@/lib/store";

export function Logo() {
  return (
    <Link href="/" className="seal" aria-label="Algreenia home">
      <Image src="/img/emblem.png" alt="" width={52} height={52} priority />
      <span>Algreenia</span>
    </Link>
  );
}

/**
 * The navbar is a branch across the top of the page. Every link hangs from it on a
 * string and answers to the wind: scroll speed pushes the tags, the pointer nudges them.
 */
export function Header() {
  const pathname = usePathname();
  const user = useApp((s) => s.user);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [reeled, setReeled] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!servicesOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && servicesRef.current?.contains(e.target as Node)) return;
      setServicesOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", close);
    };
  }, [servicesOpen]);

  useEffect(() => {
    setServicesOpen(false);
    setReeled(false);
    dialogRef.current?.close();
  }, [pathname]);

  // Tags reel up while reading, and drop back the moment you scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setReeled(y > last && y > 260);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = headerRef.current;
    if (!root || !motionAllowed()) return;
    const tags = Array.from(root.querySelectorAll<HTMLElement>(".twig"));
    const state = tags.map((_, i) => ({ set: gsap.quickTo(tags[i], "rotation", { duration: 0.7, ease: "power3.out" }), nudge: 0, k: 0.75 + ((i * 37) % 10) / 20 }));
    const enter = (i: number) => (e: PointerEvent) => {
      const r = tags[i].getBoundingClientRect();
      state[i].nudge = e.clientX < r.left + r.width / 2 ? 7 : -7;
    };
    const leave = (i: number) => () => { state[i].nudge = 0; };
    const off: (() => void)[] = [];
    if (!isTouch()) {
      tags.forEach((t, i) => {
        const a = enter(i);
        const b = leave(i);
        t.addEventListener("pointerenter", a);
        t.addEventListener("pointerleave", b);
        off.push(() => { t.removeEventListener("pointerenter", a); t.removeEventListener("pointerleave", b); });
      });
    }
    const tick = (time: number) => {
      const v = window.__lenis?.velocity ?? 0;
      state.forEach((s, i) => {
        const wind = Math.sin(time * 1.1 + i * 1.7) * 0.9;
        const push = Math.max(-11, Math.min(11, v * 0.55 * s.k));
        s.set(wind + push + s.nudge);
      });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); off.forEach((f) => f()); };
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const servicesActive = SERVICES.some((s) => isActive(s.href));

  const openMenu = () => {
    const d = dialogRef.current;
    if (!d) return;
    d.showModal();
    window.__lenis?.stop();
    if (motionAllowed()) {
      gsap.fromTo(d, { clipPath: "circle(0% at 92% 4%)" }, { clipPath: "circle(150% at 92% 4%)", duration: 0.8, ease: "expo.inOut" });
      gsap.fromTo(d.querySelector(".climb__stem path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, delay: 0.2, ease: "power3.out" });
      gsap.fromTo(d.querySelectorAll("[data-menu-item]"), { x: -34, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.055, delay: 0.3, duration: 0.8, ease: "power4.out" });
    }
  };

  const menuLinks = [...NAV, ...SERVICES.map((s) => ({ href: s.href, label: s.label })), { href: "/contact", label: "Contact" }];

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <header ref={headerRef} className="bough" data-reeled={(reeled && !servicesOpen) || undefined}>
        <svg className="bough__limb" viewBox="0 0 1600 64" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0H1600V6C1420 11 1290 7 1130 12S860 23 690 19 360 30 190 26 60 34 0 36Z" />
          <path d="M340 26c26 9 44 20 58 33M905 17c-18 9-30 18-42 30M1290 9c22 6 36 14 50 25" fill="none" strokeWidth="3" />
        </svg>
        <svg className="bough__leaves" viewBox="0 0 1600 64" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
          <path d="M398 59c-16-14-13-30 3-38 12 14 13 28-3 38Z" />
          <path d="M863 47c-18-8-20-24-7-36 15 10 20 23 7 36Z" />
          <path d="M1340 34c-14-14-10-28 6-34 11 14 10 26-6 34Z" />
        </svg>
        <div className="bough__row">
          <div className="twig twig--seal"><Logo /></div>
          <nav aria-label="Primary" className="bough__nav">
            <ul>
              {NAV.map((l, i) => (
                <li key={l.href} className="twig" style={{ "--drop": `${[26, 44, 30][i]}px` } as React.CSSProperties}>
                  <Link className="tag-link" href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>{l.label}</Link>
                </li>
              ))}
              <li ref={servicesRef} className="twig" style={{ "--drop": "52px" } as React.CSSProperties}>
                <button className="tag-link" type="button" aria-expanded={servicesOpen} aria-controls="services-menu" data-active={servicesActive || undefined} onClick={() => setServicesOpen((o) => !o)}>
                  Services <ChevronDown size={15} aria-hidden="true" />
                </button>
                <ul id="services-menu" className="vines" hidden={!servicesOpen}>
                  {SERVICES.map((s, i) => (
                    <li key={s.href} style={{ "--i": i } as React.CSSProperties}>
                      <Link href={s.href} aria-current={isActive(s.href) ? "page" : undefined}><b>{s.label}</b><small>{s.hint}</small></Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="twig" style={{ "--drop": "34px" } as React.CSSProperties}>
                <Link className="tag-link" href="/contact" aria-current={isActive("/contact") ? "page" : undefined}>Contact</Link>
              </li>
            </ul>
          </nav>
          <div className="bough__auth">
            {user ? (
              <div className="twig" style={{ "--drop": "24px" } as React.CSSProperties}>
                <Link className="tag-link tag-link--leaf" href="/profile"><UserRound size={16} aria-hidden="true" /> {user.firstName}</Link>
              </div>
            ) : (
              <>
                <div className="twig" style={{ "--drop": "20px" } as React.CSSProperties}><Link className="tag-link" href="/login">Log in</Link></div>
                <div className="twig" style={{ "--drop": "40px" } as React.CSSProperties}><Link className="tag-link tag-link--leaf" href="/signup">Sign up</Link></div>
              </>
            )}
          </div>
          <div className="twig twig--menu" style={{ "--drop": "22px" } as React.CSSProperties}>
            <button type="button" className="tag-link tag-link--leaf" onClick={openMenu} aria-haspopup="dialog"><Menu size={18} aria-hidden="true" /> Menu</button>
          </div>
        </div>
      </header>

      <dialog ref={dialogRef} className="climb" aria-label="Menu" onClose={() => window.__lenis?.start()}>
        <button type="button" className="climb__close" onClick={() => dialogRef.current?.close()} aria-label="Close menu"><X aria-hidden="true" /></button>
        <svg className="climb__stem" viewBox="0 0 60 800" preserveAspectRatio="none" aria-hidden="true">
          <path d="M30 800C8 660 54 540 26 400S46 140 30 0" pathLength={1} />
        </svg>
        <nav aria-label="Mobile">
          <ul className="climb__list">
            {menuLinks.map((l) => (
              <li key={l.href} data-menu-item>
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} onClick={() => dialogRef.current?.close()}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="climb__auth" data-menu-item>
          {user ? (
            <>
              <Link className="btn btn--leaf" href="/profile" onClick={() => dialogRef.current?.close()}><span>My profile</span></Link>
              <button type="button" className="btn btn--bone" onClick={() => { logout(); dialogRef.current?.close(); }}><span>Log out</span></button>
            </>
          ) : (
            <>
              <Link className="btn btn--leaf" href="/signup" onClick={() => dialogRef.current?.close()}><span>Sign up</span></Link>
              <Link className="btn btn--bone" href="/login" onClick={() => dialogRef.current?.close()}><span>Log in</span></Link>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}

export function BackToCanopy() {
  return (
    <button
      type="button"
      className="canopy-up"
      onClick={() => {
        if (window.__lenis) window.__lenis.scrollTo(0, { duration: 2.6 });
        else window.scrollTo(0, 0);
      }}
    >
      <ArrowUp size={18} aria-hidden="true" /> Back to the canopy
    </button>
  );
}

export function MotionToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(document.documentElement.classList.contains("has-motion"));
  }, []);
  return (
    <button
      type="button"
      className="linklike"
      aria-pressed={!on}
      onClick={() => {
        try { localStorage.setItem(MOTION_KEY, on ? "off" : "on"); } catch { /* ignore */ }
        location.reload();
      }}
    >
      {on ? "Pause animations" : "Play animations"}
    </button>
  );
}

export function Toasts() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => <p key={t.id}><Sprout size={18} aria-hidden="true" />{t.message}</p>)}
    </div>
  );
}

export function Inactivity() {
  const user = useApp((s) => s.user);
  useEffect(() => {
    if (!user) return;
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => logout("You have been logged out due to inactivity."), 5 * 60 * 1000);
    };
    const events = ["pointermove", "keydown", "click", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user]);
  return null;
}

export function AskButton() {
  const [open, setOpen] = useState(false);
  const waitlist = useApp((s) => s.waitlist);
  return (
    <div className="ask">
      {open ? (
        <div className="ask__pop" id="ask-pop">
          <p className="eyebrow">Ask Algreenia</p>
          <p>Our AI assistant is still growing. It is coming soon.</p>
          <button type="button" className="linklike" disabled={waitlist} onClick={() => { import("@/lib/store").then(({ setState }) => setState({ waitlist: true })); toast("You are on the list. We will tell you when it is ready."); }}>
            {waitlist ? "You are on the list" : "Tell me when it is ready"}
          </button>
        </div>
      ) : null}
      <button type="button" className="ask__btn" aria-expanded={open} aria-controls="ask-pop" aria-label={open ? "Close assistant" : "Ask Algreenia, coming soon"} onClick={() => setOpen((o) => !o)}>
        {open ? <X aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}
      </button>
    </div>
  );
}

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed() || isTouch()) return;
    document.documentElement.classList.add("has-cursor");
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    const move = (e: PointerEvent) => { xTo(e.clientX); yTo(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest?.("a,button,[data-cursor-label],summary,label,select");
      const label = t?.getAttribute("data-cursor-label") ?? "";
      if (labelRef.current) labelRef.current.textContent = label;
      gsap.to(el, { scale: label ? 4 : t ? 2.2 : 1, duration: 0.4, ease: "power3.out" });
      el.classList.toggle("is-label", Boolean(label));
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    gsap.set(el, { autoAlpha: 1 });
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
    };
  }, []);
  return <div ref={ref} className="cursor" aria-hidden="true"><span ref={labelRef} /></div>;
}
