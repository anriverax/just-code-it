"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ItemCachePosition, ItemsProps, PositionCoordinates } from "./picture-grid.type";
import { getNewPositions, registerPositions } from "./animation/picture-grid.position";
import { startAnimation, stopCurrentTransitions } from "./animation/picture-grid.animation";
import Image from "next/image";

const PicturesGrid = ({ items, transition, duration, timeOut }: ItemsProps): React.JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<ItemCachePosition>({});
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);

  const handleClick = useCallback(
    (ev: MouseEvent): void => {
      const grid = gridRef.current;
      if (!grid) return;

      const target = ev.target as HTMLElement;

      if (target.tagName === "IMG") {
        const elParent = target.parentElement?.parentElement;
        if (!elParent) return;

        const index = Number(elParent.dataset.index);
        const isZooming = !elParent.classList.contains("zoom");
        elParent.classList.toggle("zoom");
        setZoomedIndex(isZooming ? index : null);

        const cache = cacheRef.current;
        const gridsItemPosition: PositionCoordinates = grid.getBoundingClientRect();
        const childrenElements = stopCurrentTransitions(cache, grid);
        const newPositions = getNewPositions(cache, gridsItemPosition, childrenElements);
        if (newPositions) {
          startAnimation(cache, gridsItemPosition, newPositions, transition, duration, timeOut);
        }
      }
    },
    [transition, duration, timeOut]
  );

  useEffect((): (() => void) => {
    const grid = gridRef.current;
    if (!grid) return () => {};

    const cache = cacheRef.current;
    const gridsItemPosition: PositionCoordinates = grid.getBoundingClientRect();

    registerPositions(cache, gridsItemPosition, grid.children as HTMLCollectionOf<HTMLElement>);

    const childrenElements = stopCurrentTransitions(cache, grid);

    const newPositions = getNewPositions(cache, gridsItemPosition, childrenElements);
    if (newPositions) {
      startAnimation(cache, gridsItemPosition, newPositions, transition, duration, timeOut);
    }

    grid.addEventListener("click", handleClick);

    return () => {
      stopCurrentTransitions(cache, grid);
      grid.removeEventListener("click", handleClick);
    };
  }, [items, transition, duration, timeOut, handleClick]);

  const getSizes = useCallback(
    (index: number): string => {
      if (zoomedIndex === index) {
        return "(max-width: 640px) 100vw, (max-width: 768px) 75vw, 50vw";
      }
      return "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw";
    },
    [zoomedIndex]
  );

  return (
    <div ref={gridRef} className="picture-grid">
      {items.map((item, index) => (
        <div className="picture-grid-card" key={item.img} data-index={index}>
          <div className="picture-grid-item">
            <Image
              fill
              alt={item.name ?? ""}
              blurDataURL={item.blurDataURL}
              loading={index < 6 ? "eager" : "lazy"}
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
