"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { CartCount } from "@/components/CartCount";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = isHome && !scrolled;
  const textClass = "text-white hover:text-white/90";
  const bgClass = overHero
    ? "bg-black/40 backdrop-blur-sm"
    : "bg-black/50 backdrop-blur-md border-b border-white/10";

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${bgClass}`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex min-w-0 flex-1 items-center justify-start">
          <Link
            href="/#shop"
            className={`text-xs font-medium uppercase tracking-widest transition-colors sm:text-sm ${textClass}`}
          >
            Catégories
          </Link>
        </nav>
        <Link
          href="/"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 font-display text-xl font-medium tracking-tight transition-colors sm:text-2xl ${textClass}`}
          aria-label="Retour à l'accueil"
        >
          Boutique
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            aria-label="Panier"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            <span className="absolute -right-0.5 -top-0.5">
              <CartCount />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
