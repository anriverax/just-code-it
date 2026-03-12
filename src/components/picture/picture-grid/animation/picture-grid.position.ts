import {
  ItemCachePosition,
  PositionCoordinates,
  PositionGridChild,
  Positions
} from "../picture-grid.type";

import { GRID_ITEM_KEY, toArray } from "../picture-grid.utils";

let idCounter = 0;

const getCurrentPositionChildElement = (
  gridBoundingClientRect: PositionCoordinates,
  el: HTMLElement
): PositionCoordinates => {
  const { top, left, width, height } = el.getBoundingClientRect();
  const rect = { top, left, width, height };
  rect.top -= gridBoundingClientRect.top;
  rect.left -= gridBoundingClientRect.left;

  // If an element is display:none it can report top/left as 0.
  rect.top = Math.max(rect.top, 0);
  rect.left = Math.max(rect.left, 0);

  return rect;
};

export const registerPositions = (
  cache: ItemCachePosition,
  gridBoundingClientRect: PositionCoordinates,
  elements: HTMLCollectionOf<HTMLElement> | HTMLElement[]
): void => {
  const childrenElements = toArray(elements);
  childrenElements.forEach((el) => {
    if (!el.dataset[GRID_ITEM_KEY]) el.dataset[GRID_ITEM_KEY] = `grid-item-${idCounter++}`;

    const animatedGridId = el.dataset[GRID_ITEM_KEY] as string;

    if (!cache[animatedGridId]) cache[animatedGridId] = {} as Positions;

    const currentPositionChildElement = getCurrentPositionChildElement(gridBoundingClientRect, el);

    cache[animatedGridId].childElement = currentPositionChildElement;
    cache[animatedGridId].parentElement = gridBoundingClientRect;
  });
};

export const getNewPositions = (
  cache: ItemCachePosition,
  gridBoundingClientRect: PositionCoordinates,
  childrenElements: HTMLElement[]
): PositionGridChild[] | undefined => {
  const positionGridChildren: PositionGridChild[] = childrenElements.map((el) => ({
    childCoords: {},
    el,
    currentPositionChildElement: getCurrentPositionChildElement(gridBoundingClientRect, el)
  }));

  positionGridChildren.forEach(({ el }) => {
    const position = cache[el.dataset[GRID_ITEM_KEY] as string];

    if (!position) {
      registerPositions(cache, gridBoundingClientRect, [el]);
    }
  });

  positionGridChildren.forEach(({ el }) => {
    if (el.children.length > 1) {
      throw new Error(
        "Make sure every grid item has a single container element surrounding its children"
      );
    }
  });

  if (!positionGridChildren.length) return;

  positionGridChildren.forEach((data) => {
    const firstChild = data.el.children[0] as HTMLElement;

    if (firstChild) {
      data.childCoords = getCurrentPositionChildElement(gridBoundingClientRect, firstChild);
    }
  });

  return positionGridChildren;
};
