import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PATHS } from "@/constants";

export function Hero() {
  return (
    <section
      className="relative grid min-h-[85vh] grid-cols-1 md:grid-cols-5"
      aria-label="Bienvenue"
    >
      {/* Left panel – warm brown, branding + CTA */}
      <div className="flex flex-col justify-center bg-hero-brown px-8 py-16 md:col-span-2 md:px-12 lg:px-16">
        <div className="mx-auto max-w-sm">
          <h1 className="font-display text-3xl font-medium tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Bienvenue dans notre Boutique
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
            Pièces sélectionnées avec soin. Découvrez nos univers.
          </p>
          <div className="mt-10">
            <Button
              asChild
              className="w-full bg-white text-hero-brown hover:bg-white/95 sm:w-auto sm:px-8"
            >
              <Link
                href="#shop"
                className="inline-flex items-center justify-center"
                aria-label="Découvrir les catégories"
              >
                Découvrir
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Right panel – hero banner image */}
      <div className="relative min-h-[50vh] md:col-span-3 md:min-h-[85vh]">
        <Image
          src={PATHS.HERO_BANNER}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      </div>
    </section>
  );
}
