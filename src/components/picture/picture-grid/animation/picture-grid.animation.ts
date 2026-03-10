import sync from "framesync";
import { animate } from "popmotion";

import {
  Coords,
  ItemCachePosition,
  PositionCoordinates,
  PositionGridChild,
  Transition
} from "../picture-grid.type";

import { DATASET_KEY, popmotionEasing } from "../picture-grid.utils";
import { registerPositions } from "./picture-grid.position";

const applyTransform = (
  el: HTMLElement,
  { translateX, translateY, scaleX, scaleY }: Coords,
  { immediate }: { immediate?: boolean } = {}
): void => {
  const isFinished = translateX === 0 && translateY === 0 && scaleX === 1 && scaleY === 1;

  const styleEl = (): void => {
    el.style.transform = isFinished
      ? ""
      : `translateX(${translateX}px) translateY(${translateY}px) scaleX(${scaleX}) scaleY(${scaleY})`;
  };
  if (immediate) styleEl();
  else sync.render(styleEl);

  const firstChild = el.children[0] as HTMLElement;

  if (firstChild) {
    const styleChild = (): void => {
      firstChild.style.transform = isFinished ? "" : `scaleX(${1 / scaleX}) scaleY(${1 / scaleY})`;
    };

    if (immediate) styleChild();
    else sync.render(styleChild);
  }
};

export const startAnimation = (
  cache: ItemCachePosition,
  gridBoundingClientRect: PositionCoordinates,
  positionGridChildren: PositionGridChild[],
  transition: keyof Transition,
  duration: number,
  timeOut: number
): void => {
  positionGridChildren.forEach(
    ({ el, currentPositionChildElement: { top, left, width, height } }, i) => {
      const firstChild = el.children[0] as HTMLElement;
      const position = cache[el.dataset[DATASET_KEY] as string];
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

      applyTransform(el, coords, { immediate: true });

      if (!popmotionEasing[transition]) {
        throw new Error(`${transition} is not a valid easing name`);
      }

      const init = (): void => {
        const animation = animate({
          from: coords,
          to: { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 },
          duration,
          ease: popmotionEasing[transition],
          onUpdate: (transforms: Coords): void => {
            applyTransform(el, transforms);
            sync.postRender(() => registerPositions(cache, gridBoundingClientRect, [el]));
          }
        });

        position.stop = () => animation.stop;
      };

      const timeoutId = setTimeout((): void => {
        sync.update(init);
      }, timeOut * i);

      position.stop = () => clearTimeout(timeoutId);
    }
  );
};

export const stopCurrentTransitions = (
  cache: ItemCachePosition,
  container: HTMLElement
): HTMLElement[] => {
  const childrenElements = Array.from(container.children) as HTMLElement[];
  childrenElements.forEach((el) => {
    const position = cache[el.dataset[DATASET_KEY] as string];
    if (position && position.stop) {
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
