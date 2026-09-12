"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerItem {
  id: number;
  image: string;
  alt: string;
  link: string;
}

const BANNERS: BannerItem[] = [
  {
    id: 1,
    image: "/banner/banner1.avif",
    alt: "Smartphone Special Collection Banner 1",
    link: "/products",
  },
  {
    id: 2,
    image: "/banner/banner2.webp",
    alt: "iPhone Used Mobiles Discounts Banner 2",
    link: "/products?brand=Apple",
  },
  {
    id: 3,
    image: "/banner/banner3.avif",
    alt: "Flagship Smartphones Banner 3",
    link: "/products",
  },
  {
    id: 4,
    image: "/banner/banner4.jpg",
    alt: "Mobile Shop Big Sales Banner 4",
    link: "/products",
  },
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const total = BANNERS.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Automatic slide rotation every 4.5s
  useEffect(() => {
    if (isPaused || isDragging) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, isDragging, goToNext]);

  // Touch Swipe (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -50) {
      goToNext();
    } else if (dragOffset > 50) {
      goToPrev();
    }
    setDragOffset(0);
  };

  // Mouse Drag (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle primary left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - dragStartX;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -60) {
      goToNext();
    } else if (dragOffset > 60) {
      goToPrev();
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
    setIsPaused(false);
  };

  return (
    <section
      className="w-full bg-white border-b border-slate-100"
      aria-label="Clean Promotional Banners"
    >
      <div className="w-full mx-auto">
        <div
          className="relative w-full overflow-hidden shadow-sm bg-slate-100 group select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Banner Slides Carousel Track */}
          <div
            className={`flex w-full ${
              isDragging
                ? "transition-none"
                : "transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1)"
            }`}
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {BANNERS.map((banner, index) => (
              <div
                key={banner.id}
                className="w-full flex-shrink-0 relative h-[280px] sm:h-[380px] md:h-[460px] lg:h-[520px] bg-white overflow-hidden"
              >
                <Link
                  href={banner.link}
                  onClick={(e) => {
                    if (Math.abs(dragOffset) > 10) {
                      e.preventDefault();
                    }
                  }}
                  className="block w-full h-full"
                >
                  <img
                    src={banner.image}
                    alt={banner.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-[1.01]"
                    loading={index === 0 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </Link>
              </div>
            ))}
          </div>

          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 focus:outline-none"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </button>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 z-20 focus:outline-none"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </button>

          {/* Clean Pagination Dots (Matching Reference Design) */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md shadow-sm z-20">
            {BANNERS.map((_, index) => {
              const isActive = currentIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(index);
                  }}
                  className={`transition-all duration-300 rounded-full focus:outline-none ${
                    isActive
                      ? "w-6 sm:w-7 h-2 sm:h-2.5 bg-slate-900 shadow-xs"
                      : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-400/80 hover:bg-slate-600"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
