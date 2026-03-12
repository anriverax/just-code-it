import { animate } from "popmotion";

import { Coords, ItemCachePosition, PositionCoordinates, PositionGridChild } from "../picture-grid.type";

import { GRID_ITEM_KEY, TransitionKey, popmotionEasing } from "../picture-grid.utils";
import { registerPositions } from "./picture-grid.position";

const applyTransform = (el: HTMLElement, { translateX, translateY, scaleX, scaleY }: Coords): void => {
  const isFinished = translateX === 0 && translateY === 0 && scaleX === 1 && scaleY === 1;

  el.style.transform = isFinished
    ? ""
    : `translateX(${translateX}px) translateY(${translateY}px) scaleX(${scaleX}) scaleY(${scaleY})`;

  const firstChild = el.children[0] as HTMLElement;
  if (firstChild) {
    // Counter-scale the inner child to neutralise the parent's scale,
    // preserving the visual size of content during the FLIP animation.
    firstChild.style.transform = isFinished ? "" : `scaleX(${1 / scaleX}) scaleY(${1 / scaleY})`;
  }
};

export const startAnimation = (
  cache: ItemCachePosition,
  gridBoundingClientRect: PositionCoordinates,
  positionGridChildren: PositionGridChild[],
  transition: TransitionKey,
  duration: number,
  staggerDelayMs: number,
  onAllComplete?: () => void
): void => {
  if (!popmotionEasing[transition]) {
    throw new Error(`"${transition}" is not a valid easing name`);
  }

  const totalAnimations = positionGridChildren.length;
  let completedAnimations = 0;

  positionGridChildren.forEach(
    ({ el, currentPositionChildElement: { top, left, width, height } }, i) => {
      const firstChild = el.children[0] as HTMLElement;
      const position = cache[el.dataset[GRID_ITEM_KEY] as string];
      const coords: Coords = {
        scaleX: position.childElement.width / width,
        scaleY: position.childElement.height / height,
        translateX: position.childElement.left - left,
        translateY: position.childElement.top - top
      };

      el.style.transformOrigin = "0 0";

      if (firstChild) {
        firstChild.style.transformOrigin = "0 0";
      }

      applyTransform(el, coords);

      let animationInstance: { stop: () => void } | null = null;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      const init = (): void => {
        animationInstance = animate({
          from: coords,
          to: { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 },
          duration,
          ease: popmotionEasing[transition],
          onUpdate: (transforms: Coords): void => {
            applyTransform(el, transforms);
          },
          onComplete: (): void => {
            registerPositions(cache, gridBoundingClientRect, [el]);
            animationInstance = null;
            completedAnimations++;
            if (completedAnimations === totalAnimations && onAllComplete) {
              onAllComplete();
            }
          }
        });
      };

      timeoutId = setTimeout((): void => {
        requestAnimationFrame(init);
      }, staggerDelayMs * i);

      position.stop = (): void => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (animationInstance) {
          animationInstance.stop();
          animationInstance = null;
        }
      };
    }
  );
};

export const stopCurrentTransitions = (
  cache: ItemCachePosition,
  container: HTMLElement
): HTMLElement[] => {
  const childrenElements = Array.from(container.children) as HTMLElement[];

  childrenElements.forEach((el) => {
    const position = cache[el.dataset[GRID_ITEM_KEY] as string];
    if (position?.stop) {
      position.stop();
      delete position.stop;
    }
  });

  childrenElements.forEach((el) => {
    el.style.transform = "";
    const firstChild = el.children[0] as HTMLElement;
    if (firstChild) firstChild.style.transform = "";
  });

  return childrenElements;
};
