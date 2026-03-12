import { PicturesGrid } from "./picture";
import type { PortfolioImage } from "./picture";
import type { TransitionKey } from "./picture/picture-grid/picture-grid.utils";

const GALLERY_ANIMATION_DURATION_MS = 800;
const GALLERY_ITEM_STAGGER_MS = 300;
const GALLERY_EASING: TransitionKey = "easeInOut";

type GalleryProps = {
  portfolios: PortfolioImage[];
};

export const Gallery = ({ portfolios }: GalleryProps): React.JSX.Element => {
  return (
    <PicturesGrid
      items={portfolios}
      duration={GALLERY_ANIMATION_DURATION_MS}
      staggerDelayMs={GALLERY_ITEM_STAGGER_MS}
      transition={GALLERY_EASING}
    />
  );
};
