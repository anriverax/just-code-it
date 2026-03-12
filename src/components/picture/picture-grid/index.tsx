"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { ItemCachePosition, ItemsProps, PositionCoordinates } from "./picture-grid.type";
import { getNewPositions, registerPositions } from "./animation/picture-grid.position";
import { startAnimation, stopCurrentTransitions } from "./animation/picture-grid.animation";

const ZOOMED_SIZES = "(max-width: 640px) 100vw, (max-width: 768px) 75vw, 50vw";
const DEFAULT_SIZES = "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw";
/** Number of images loaded eagerly as they are likely above the fold */
const EAGER_LOAD_COUNT = 6;

const PicturesGrid = ({ items, transition, duration, staggerDelayMs }: ItemsProps): React.JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<ItemCachePosition>({});
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const handleClick = useCallback(
    (ev: MouseEvent): void => {
      const grid = gridRef.current;
      if (!grid) return;

      const card = (ev.target as HTMLElement).closest<HTMLElement>("[data-index]");
      if (!card) return;

      const rawIndex = card.dataset.index;
      if (rawIndex === undefined) return;
      const index = parseInt(rawIndex, 10);
      if (isNaN(index)) return;

      const isZooming = !card.classList.contains("zoom");
      card.classList.toggle("zoom");
      setZoomedIndex(isZooming ? index : null);

      const cache = cacheRef.current;
      const gridBoundingRect: PositionCoordinates = grid.getBoundingClientRect();
      const childrenElements = stopCurrentTransitions(cache, grid);
      const newPositions = getNewPositions(cache, gridBoundingRect, childrenElements);
      if (newPositions) {
        startAnimation(cache, gridBoundingRect, newPositions, transition, duration, staggerDelayMs);
      }
    },
    [transition, duration, staggerDelayMs]
  );

  useEffect((): (() => void) => {
    const grid = gridRef.current;
    if (!grid) return () => {};

    const cache = cacheRef.current;
    const gridBoundingRect: PositionCoordinates = grid.getBoundingClientRect();

    registerPositions(cache, gridBoundingRect, grid.children as HTMLCollectionOf<HTMLElement>);

    const childrenElements = stopCurrentTransitions(cache, grid);

    const newPositions = getNewPositions(cache, gridBoundingRect, childrenElements);
    if (newPositions) {
      startAnimation(cache, gridBoundingRect, newPositions, transition, duration, staggerDelayMs);
    }

    grid.addEventListener("click", handleClick);

    return () => {
      stopCurrentTransitions(cache, grid);
      grid.removeEventListener("click", handleClick);
    };
  }, [items, transition, duration, staggerDelayMs, handleClick]);

  const getSizes = (index: number): string => {
    if (zoomedIndex === index) {
      return ZOOMED_SIZES;
    }
    return DEFAULT_SIZES;
  };

  return (
    <div ref={gridRef} className="picture-grid">
      {items.map((item, index) => (
        <div className="picture-grid-card" key={item.img} data-index={index}>
          <div className="picture-grid-item">
            <Image
              fill
              alt={item.name ?? ""}
              blurDataURL={item.blurDataURL}
              loading={index < EAGER_LOAD_COUNT ? "eager" : "lazy"}
              placeholder="blur"
              quality={75}
              sizes={getSizes(index)}
              src={item.img}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PicturesGrid;
