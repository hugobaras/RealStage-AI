import { useCallback, useEffect, useRef, useState } from "react";

export default function LandingCompareSlider({
  beforeSrc,
  afterSrc,
  className = "",
  aspectClass = "aspect-[4/3]",
  autoAnimate = false,
  kenBurns = false,
}) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const autoRef = useRef(null);
  const directionRef = useRef(1);

  const setPositionFromClientX = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const ratio = (clientX - rect.left) / rect.width;
    setPosition(Math.min(100, Math.max(0, ratio * 100)));
  }, []);

  useEffect(() => {
    const stopDrag = () => {
      draggingRef.current = false;
      setIsDragging(false);
    };

    const onPointerMove = (event) => {
      if (!draggingRef.current) return;
      event.preventDefault();
      setPositionFromClientX(event.clientX);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };
  }, [setPositionFromClientX]);

  useEffect(() => {
    if (!autoAnimate || isDragging || isHovered) return undefined;

    autoRef.current = setInterval(() => {
      setPosition((prev) => {
        const next = prev + directionRef.current * 0.6;
        if (next >= 72) directionRef.current = -1;
        if (next <= 28) directionRef.current = 1;
        return next;
      });
    }, 30);

    return () => clearInterval(autoRef.current);
  }, [autoAnimate, isDragging, isHovered, beforeSrc, afterSrc]);

  const startDrag = (event) => {
    draggingRef.current = true;
    setIsDragging(true);
    containerRef.current?.setPointerCapture(event.pointerId);
    setPositionFromClientX(event.clientX);
  };

  const transitionClass =
    isDragging || !autoAnimate
      ? ""
      : "transition-[width] duration-75 ease-linear";

  return (
    <div
      ref={containerRef}
      className={`group relative touch-none select-none overflow-hidden rounded-2xl border-4 border-white bg-surface shadow-[0_20px_60px_rgba(28,43,58,0.15)] ring-1 ring-line ${aspectClass} ${className}`}
      onPointerDown={startDrag}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={afterSrc}
        alt="Après"
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover ${kenBurns ? "animate-ken-burns" : ""}`}
      />

      <div
        className={`absolute inset-y-0 left-0 overflow-hidden ${transitionClass}`}
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeSrc}
          alt="Avant"
          draggable={false}
          className={`absolute inset-0 h-full w-full object-cover object-left ${kenBurns ? "animate-ken-burns" : ""}`}
          style={{ width: containerRef.current?.offsetWidth || "100%" }}
        />
      </div>

      <div
        className={`absolute inset-y-0 z-10 w-10 -translate-x-1/2 cursor-ew-resize ${transitionClass}`}
        style={{ left: `${position}%` }}
        aria-hidden
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_8px_rgba(28,43,58,0.3)]" />
        <div
          className={`absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-accent bg-white shadow-lg transition-all duration-200 ${
            isDragging
              ? "scale-125 ring-2 ring-accent/40"
              : autoAnimate
                ? "animate-pulse-glow"
                : "hover:scale-110"
          }`}
        >
          <div className="flex items-center gap-0.5">
            <span className="h-2 w-0.5 rounded-full bg-line" />
            <span className="h-4 w-0.5 rounded-full bg-navy" />
            <span className="h-2 w-0.5 rounded-full bg-line" />
          </div>
        </div>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-line bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-fg-muted shadow-sm backdrop-blur-sm">
        Avant
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-md border border-accent/30 bg-navy px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
        Après
      </span>

      {autoAnimate && !isDragging && (
        <span className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-line bg-white/90 px-3 py-1 text-[10px] text-fg-muted shadow-sm backdrop-blur-sm">
          Glissez pour comparer
        </span>
      )}
    </div>
  );
}
