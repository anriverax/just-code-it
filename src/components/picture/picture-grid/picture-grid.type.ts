import type { TransitionKey } from "./picture-grid.utils";

export interface PortfolioImage {
  img: string;
  name?: string;
  blurDataURL?: string;
}

export interface ItemsProps {
  items: PortfolioImage[];
  transition: TransitionKey;
  duration: number;
  staggerDelayMs: number;
}

export interface PositionCoordinates {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Positions {
  childElement: PositionCoordinates;
  parentElement: PositionCoordinates;
  stop?: () => void;
}

export interface ItemCachePosition {
  [key: string]: Positions;
}

export interface Coords {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
}

export type ChildCoordinates = Partial<Pick<PositionCoordinates, "top" | "left">>;

export interface PositionGridChild {
  childCoords: ChildCoordinates;
  el: HTMLElement;
  currentPositionChildElement: PositionCoordinates;
}
