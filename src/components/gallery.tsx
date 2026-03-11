import { PicturesGrid } from "./picture";
import type { Image } from "./picture/picture-grid/picture-grid.type";

type GalleryProps = {
  portfolios: Image[];
};

export const Gallery = ({ portfolios }: GalleryProps): React.JSX.Element => {
  return <PicturesGrid items={portfolios} transition="easeInOut" duration={800} timeOut={300} />;
};
