import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-xl border shadow-lg p-4 backdrop-blur bg-white text-slate-900 flex items-start gap-3",
            t.variant === "destructive" && "border-red-300 bg-red-50 text-red-900"
          )}
        >
          <div className="flex-1 min-w-0">
            {t.title && <div className="font-medium text-sm">{t.title}</div>}
            {t.description && <div className="text-xs text-slate-600 mt-0.5">{t.description}</div>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-700 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
