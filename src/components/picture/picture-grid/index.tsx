"use client";
import { useCallback, useEffect, useRef } from "react";
import { ItemCachePosition, ItemsProps, PositionCoordinates } from "./picture-grid.type";
import { getNewPositions, registerPositions } from "./animation/picture-grid.position";
import { startAnimation, stopCurrentTransitions } from "./animation/picture-grid.animation";

const PicturesGrid = ({ items, transition, duration, timeOut }: ItemsProps): React.JSX.Element => {
  const gridRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<ItemCachePosition>({});

  const handleClick = useCallback(
    (ev: MouseEvent): void => {
      const grid = gridRef.current;
      if (!grid) return;

      const target = ev.target as HTMLElement;

      if (target.tagName === "IMG") {
        const elParent = target.parentElement?.parentElement;
        if (!elParent) return;

        elParent.classList.toggle("zoom");

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

  useEffect((): (() => void) | void => {
    const grid = gridRef.current;
    if (!grid) return;

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
      grid.removeEventListener("click", handleClick);
    };
  }, [items, transition, duration, timeOut, handleClick]);

  return (
    <div ref={gridRef} className="picture-grid">
      {items.map((item, index) => (
        <div className="picture-grid-card" key={index}>
          <div className="picture-grid-item">
            <img src={item.img} alt={item.name} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PicturesGrid;
