"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface CursorDecoratorProps {
  color: string;
}

interface Point {
  x: number;
  y: number;
}

const CURSOR_SIZE = 30;
const OUTER_OFFSET = CURSOR_SIZE / 2;
const OUTER_LERP = 0.18;

const CursorDecorator = ({
  children,
  color
}: PropsWithChildren<CursorDecoratorProps>): React.JSX.Element => {
  const animationFrameRef = useRef<number | null>(null);

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<HTMLDivElement | null>(null);

  const pointerPositionRef = useRef<Point>({ x: 0, y: 0 });
  const outerPositionRef = useRef<Point>({ x: 0, y: 0 });

  const isActiveRef = useRef<boolean>(false);
  const hasMovedRef = useRef<boolean>(false);
  const [hasMoved, setHasMoved] = useState<boolean>(false);

  useEffect((): (() => void) => {
    const handleMouseMove = (event: MouseEvent): void => {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setHasMoved(true);
        outerPositionRef.current = {
          x: event.clientX - OUTER_OFFSET,
          y: event.clientY - OUTER_OFFSET
        };
      }

      pointerPositionRef.current = { x: event.clientX, y: event.clientY };
    };

    document.addEventListener("mousemove", handleMouseMove);

    return (): void => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect((): (() => void) => {
    const animate = (): void => {
      const cursorEl = cursorRef.current;
      const pointerEl = pointerRef.current;

      if (!cursorEl || !pointerEl) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const outer = outerPositionRef.current;
      const pointer = pointerPositionRef.current;
      const isActive = isActiveRef.current;
      const visible = hasMovedRef.current;

      const targetX = pointer.x - OUTER_OFFSET;
      const targetY = pointer.y - OUTER_OFFSET;
      outer.x += (targetX - outer.x) * OUTER_LERP;
      outer.y += (targetY - outer.y) * OUTER_LERP;

      cursorEl.style.transform = isActive
        ? `translate3d(${outer.x}px, ${outer.y}px, 0) scale(3)`
        : `translate3d(${outer.x}px, ${outer.y}px, 0)`;
      cursorEl.style.opacity = visible ? (isActive ? "0.2" : "1") : "0";
      cursorEl.style.border = isActive ? "none" : `1px solid ${color}`;
      cursorEl.style.backgroundColor = isActive ? color : "transparent";

      pointerEl.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate3d(-50%, -50%, 0)`;
      pointerEl.style.opacity = visible ? "1" : "0";
      pointerEl.style.backgroundColor = color;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return (): void => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [color]);

  useEffect((): (() => void) => {
    const selector = "a, button, [role='button']";

    const handleMouseOver = (event: MouseEvent): void => {
      const target = event.target as Element | null;
      if (target?.closest(selector)) {
        isActiveRef.current = true;
      }
    };

    const handleMouseOut = (event: MouseEvent): void => {
      const target = event.target as Element | null;
      if (target?.closest(selector)) {
        isActiveRef.current = false;
      }
    };

    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target as Element | null;
      if (target?.closest(selector)) {
        isActiveRef.current = true;
      }
    };

    const handleMouseUp = (): void => {
      isActiveRef.current = false;
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return (): void => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="magicCursor">
      <div ref={cursorRef} className={cn("mouse", { cursor: hasMoved })} />
      <div ref={pointerRef} className={cn("mouse", { magicPointer: hasMoved })} />
      {children}
    </div>
  );
};

export default CursorDecorator;
