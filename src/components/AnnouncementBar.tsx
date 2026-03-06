"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { STORAGE_KEYS } from "@/constants";

export function AnnouncementBar() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(Boolean(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENT_DISMISSED)));
    } catch {
      setHidden(false);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENT_DISMISSED, "1");
    } catch {
      // ignore
    }
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="relative flex items-center justify-center bg-gray-900 px-4 py-2.5 text-center text-sm text-white">
      <span>Livraison rapide à Meknès & partout au Maroc</span>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Fermer l'annonce"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
