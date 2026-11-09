"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Btn, Field } from "@/components/ui";
import { logout, setState, toast, useApp, type AvailabilityRow } from "@/lib/store";

function NeedLogin() {
  return (
    <div className="panel panel--center">
      <h2 className="display display--sm">This part of the forest is yours.</h2>
      <p>Log in to see your profile and availability.</p>
      <Btn href="/login" magnetic={false}>Log in</Btn>
    </div>
  );
}

export function ProfileView() {
  const user = useApp((s) => s.user);
  const joined = useApp((s) => s.joined.length);
  const planted = useApp((s) => s.planted);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  if (!user) return <NeedLogin />;

  const toggle = () => {
    if (editing) {
      setState({ user: { ...user, ...draft } });
      toast("Profile saved.");
    } else {
      setDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone });
    }
    setEditing(!editing);
  };
  const value = (k: keyof typeof draft) => (editing ? draft[k] : user[k]);
  const change = (k: keyof typeof draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [k]: e.target.value });

  return (
    <div className="profile">
      <section className="panel profile__main" aria-label="My profile">
        <div className="profile__pic" aria-hidden="true">{user.firstName.charAt(0).toUpperCase()}</div>
        <div className="form__two">
          <Field id="p-first" label="First name"><input id="p-first" autoComplete="given-name" value={value("firstName")} onChange={change("firstName")} disabled={!editing} /></Field>
          <Field id="p-last" label="Last name"><input id="p-last" autoComplete="family-name" value={value("lastName")} onChange={change("lastName")} disabled={!editing} /></Field>
        </div>
        <Field id="p-email" label="Email"><input id="p-email" type="email" autoComplete="email" value={value("email")} onChange={change("email")} disabled={!editing} /></Field>
        <Field id="p-phone" label="Phone"><input id="p-phone" type="tel" autoComplete="tel" value={value("phone")} onChange={change("phone")} disabled={!editing} /></Field>
        <label className="check">
          <input type="checkbox" checked={user.emailAlerts} onChange={(e) => setState({ user: { ...user, emailAlerts: e.target.checked } })} /> Email alerts
        </label>
        <div className="row">
          <button type="button" className="btn btn--solid" onClick={toggle}><span>{editing ? "Save" : "Edit"}</span></button>
          <button type="button" className="btn btn--ghost" onClick={() => logout()}><span>Log out</span></button>
        </div>
      </section>
      <aside className="profile__side">
        <div className="panel panel--leaf">
          <h2 className="eyebrow">Your participations</h2>
          <p className="bigstat">{joined}</p>
          <Link className="more" href="/campaigns">Find a campaign</Link>
        </div>
        <div className="panel panel--moss">
          <h2 className="eyebrow">Trees you planted on the home page</h2>
          <p className="bigstat">{planted}</p>
        </div>
        <div className="panel">
          <h2 className="eyebrow">Availability</h2>
          <p>Change when you are free to plant and water.</p>
          <Btn href="/profile/availability" magnetic={false}>Availability</Btn>
        </div>
      </aside>
    </div>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AvailabilityView() {
  const user = useApp((s) => s.user);
  const rows = useApp((s) => s.availability);
  const [day, setDay] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  if (!user) return <NeedLogin />;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || !from || !to) return setError("Choose a day, a start time and an end time.");
    if (from >= to) return setError("The end time must be after the start time.");
    setError("");
    const row: AvailabilityRow = { id: `${day}-${from}-${Date.now()}`, day, from, to };
    setState({ availability: [...rows, row].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.from.localeCompare(b.from)) });
    setDay(""); setFrom(""); setTo("");
    toast("Availability added.");
  };

  return (
    <div className="panel">
      <div className="tablewrap" tabIndex={0} role="region" aria-label="Weekly availability">
        <table className="table">
          <caption className="sr">Your weekly availability</caption>
          <thead><tr><th scope="col">Day</th><th scope="col">From</th><th scope="col">To</th><th scope="col">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={4}>Nothing yet. Add your first slot below.</td></tr> : null}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.day}</td><td>{r.from}</td><td>{r.to}</td>
                <td>
                  <button type="button" className="iconbtn" aria-label={`Remove ${r.day} ${r.from} to ${r.to}`} onClick={() => setState({ availability: rows.filter((x) => x.id !== r.id) })}>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="avail" onSubmit={add} noValidate>
        <Field id="a-day" label="Day">
          <select id="a-day" value={day} onChange={(e) => setDay(e.target.value)}>
            <option value="">Select a day</option>
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
        <Field id="a-from" label="From"><input id="a-from" type="time" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field id="a-to" label="To"><input id="a-to" type="time" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
        <button type="submit" className="btn btn--solid"><span>Add availability</span></button>
      </form>
      {error ? <p className="field__err" role="alert">{error}</p> : null}
    </div>
  );
}
