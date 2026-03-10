import { PicturesGrid } from "@/components/picture";
import { Image } from "@/components/picture/picture-grid/picture-grid.type";
import { getPortfolioImages } from "@/components/picture/picture-grid/picture-grid.utils";
export default async function Home(): Promise<React.JSX.Element> {
  // https://alphacoders.com/pokemon-wallpapers
  const portfolios = await getPortfolioImages();

  return (
    <div>
      <PicturesGrid items={portfolios} transition="easeInOut" duration={0.8} timeOut={300} />
    </div>
  );
}
