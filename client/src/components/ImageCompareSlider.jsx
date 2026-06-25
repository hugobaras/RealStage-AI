import { useCallback, useEffect, useRef, useState } from "react";
import { getModeTheme } from "../utils/modeTheme";

export default function ImageCompareSlider({
  beforeSrc,
  afterSrc,
  mode = "meubler",
}) {
  const theme = getModeTheme(mode);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const afterRef = useRef(null);
  const draggingRef = useRef(false);

  const syncFrame = useCallback(() => {
    const img = afterRef.current;
    if (!img) return;
    setFrame({ width: img.offsetWidth, height: img.offsetHeight });
  }, []);

  useEffect(() => {
    syncFrame();
    const observer = new ResizeObserver(syncFrame);
    if (afterRef.current) observer.observe(afterRef.current);
    window.addEventListener("resize", syncFrame);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncFrame);
    };
  }, [syncFrame, beforeSrc, afterSrc]);

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

  const startDrag = (event) => {
    draggingRef.current = true;
    setIsDragging(true);
    containerRef.current?.setPointerCapture(event.pointerId);
    setPositionFromClientX(event.clientX);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex touch-none select-none items-center justify-center p-4"
      onPointerDown={startDrag}
    >
      <div className="relative" style={frame.width ? frame : undefined}>
        <img
          ref={afterRef}
          src={afterSrc}
          alt="Après"
          draggable={false}
          onLoad={syncFrame}
          className="block max-h-[calc(100dvh-14rem)] max-w-full object-contain lg:max-h-[calc(100vh-12rem)]"
        />

        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeSrc}
            alt="Avant"
            draggable={false}
            className="block max-w-none object-contain object-left"
            style={
              frame.width
                ? { width: frame.width, height: frame.height }
                : undefined
            }
          />
        </div>

        <div
          className="absolute inset-y-0 z-10 w-10 -translate-x-1/2 cursor-ew-resize"
          style={{ left: `${position}%` }}
          aria-hidden
        >
          <div className="absolute inset-y-2 left-1/2 w-1 -translate-x-1/2 rounded-full bg-white shadow-[0_0_16px_rgba(0,0,0,0.55)]" />

          <div
            className={`absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-zinc-600/80 bg-zinc-900/95 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition-transform duration-150 lg:h-14 lg:w-14 ${
              isDragging
                ? `scale-110 ${theme.border} ring-2 ${theme.ring}`
                : "hover:scale-105 hover:border-zinc-500"
            }`}
          >
            <div className="flex items-center gap-1">
              <span className="h-2 w-0.5 rounded-full bg-zinc-500" />
              <span className="h-5 w-0.5 rounded-full bg-white/90" />
              <span className="h-2 w-0.5 rounded-full bg-zinc-500" />
            </div>
          </div>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-md border border-zinc-700/80 bg-panel/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
          Avant
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-md border border-zinc-700/80 bg-panel/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
          Après
        </span>
      </div>
    </div>
  );
}
