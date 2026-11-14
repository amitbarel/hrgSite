"use client";

// shadcn/ui Carousel: עטיפה של Embla. נותן את המבנה (חלון, מסילה, שקופיות),
// מקשי חיצים, ו-api (setApi) כדי לבנות ניווט משלנו מעליו.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

const CarouselContext = createContext(null);

export function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within a <Carousel />");
  return ctx;
}

export function Carousel({ opts, plugins, setApi, className, children, ...props }) {
  const [carouselRef, api] = useEmblaCarousel(opts, plugins);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(api => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  // בעברית החץ שמאלה מוביל קדימה
  const rtl = opts?.direction === "rtl";
  const handleKeyDown = useCallback(e => {
    if (e.key === "ArrowLeft") { e.preventDefault(); rtl ? scrollNext() : scrollPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); rtl ? scrollPrev() : scrollNext(); }
  }, [rtl, scrollPrev, scrollNext]);

  useEffect(() => { if (api && setApi) setApi(api); }, [api, setApi]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect).on("select", onSelect);
    return () => { api.off("reInit", onSelect).off("select", onSelect); };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider value={{ carouselRef, api, opts, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <section
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <div className={cn("flex", className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  );
}
