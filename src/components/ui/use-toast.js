import { useEffect, useState } from "react";

let listeners = [];
let toastState = { toasts: [] };
let idCounter = 0;

function emit() {
  listeners.forEach((l) => l(toastState));
}

export function toast({ title, description, variant = "default", duration = 4000 }) {
  const id = String(++idCounter);
  toastState = { toasts: [...toastState.toasts, { id, title, description, variant }] };
  emit();
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
  return id;
}

export function dismiss(id) {
  toastState = { toasts: toastState.toasts.filter((t) => t.id !== id) };
  emit();
}

export function useToast() {
  const [state, setState] = useState(toastState);
  useEffect(() => {
    listeners.push(setState);
    return () => { listeners = listeners.filter((l) => l !== setState); };
  }, []);
  return { toasts: state.toasts, toast, dismiss };
}
