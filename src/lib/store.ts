"use client";

import { useSyncExternalStore } from "react";
import type { Campaign } from "./data";

/**
 * Local-only app state, standing in for the backend. No passwords are ever stored.
 */
export interface User { firstName: string; lastName: string; email: string; phone: string; emailAlerts: boolean }
export interface AvailabilityRow { id: string; day: string; from: string; to: string }
export interface Toast { id: number; message: string }

export interface AppState {
  user: User | null;
  joined: string[];
  created: Campaign[];
  irrigated: Record<string, number>;
  availability: AvailabilityRow[];
  planted: number;
  challenge: boolean;
  waitlist: boolean;
  loginReason: "join" | "create" | "profile" | null;
  afterLogin: string | null;
  toasts: Toast[];
}

const KEY = "algreenia:state:v1";
const DEFAULT: AppState = {
  user: null, joined: [], created: [], irrigated: {}, availability: [], planted: 0, challenge: false, waitlist: false,
  loginReason: null, afterLogin: null, toasts: [],
};

let state = DEFAULT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULT, ...JSON.parse(raw), toasts: [] };
  } catch {
    /* private mode: keep running in memory */
  }
}

function persist() {
  try {
    const { toasts: _t, ...rest } = state;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    /* storage unavailable */
  }
}

export function setState(patch: Partial<AppState>) {
  load();
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

export function getState() {
  load();
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!loaded) {
    load();
    queueMicrotask(l);
  }
  return () => listeners.delete(l);
}

export function useApp<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(subscribe, () => { load(); return select(state); }, () => select(DEFAULT));
}

let toastId = 1;
export function toast(message: string) {
  const id = toastId++;
  setState({ toasts: [...getState().toasts, { id, message }] });
  window.setTimeout(() => setState({ toasts: getState().toasts.filter((t) => t.id !== id) }), 4200);
}

export function logout(message = "You are logged out.") {
  setState({ user: null });
  toast(message);
}

export function toggleJoin(id: string) {
  const { joined } = getState();
  const isJoined = joined.includes(id);
  setState({ joined: isJoined ? joined.filter((x) => x !== id) : [...joined, id] });
  return !isJoined;
}
