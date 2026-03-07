"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { CartCount } from "@/components/CartCount";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Over the home hero → semi-dark overlay, white text
  const overHero = isHome && !scrolled;
  // Scrolled on any page → opaque sand bg, dark text
  const isOpaque = scrolled;

  const bgClass = cn(
    "sticky top-0 z-40 transition-all duration-500",
    overHero && "bg-black/30 backdrop-blur-sm",
    isOpaque && "bg-sand/95 backdrop-blur-md border-b border-sand/60 shadow-sm",
    !overHero && !isOpaque && "bg-transparent"
  );

  const textClass = cn(
    "transition-colors duration-300",
    overHero || isOpaque
      ? overHero
        ? "text-white hover:text-white/80"
        : "text-gray-800 hover:text-terracotta"
      : "text-gray-800 hover:text-terracotta"
  );

  const cartClass = cn(
    "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
    overHero
      ? "text-white hover:bg-white/15 focus:ring-white/50"
      : "text-gray-800 hover:bg-gray-900/8 focus:ring-terracotta/50"
  );

  return (
    <header className={bgClass}>
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left nav */}
        <nav className="flex min-w-0 flex-1 items-center justify-start">
          <Link
            href="/#shop"
            className={cn(
              "text-xs font-medium uppercase tracking-widest",
              textClass
            )}
          >
            Catégories
          </Link>
        </nav>

        {/* Centered wordmark */}
        <Link
          href="/"
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0",
            "font-display text-xl font-medium tracking-tight sm:text-2xl",
            textClass
          )}
          aria-label="Retour à l'accueil"
        >
          Boutique
        </Link>

        {/* Right — cart */}
        <div className="flex min-w-0 flex-1 items-center justify-end">
          <Link href="/cart" className={cartClass} aria-label="Panier">
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
