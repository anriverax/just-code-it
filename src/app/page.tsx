import Selectbox from "@/components/selectbox";
import { getPortfolioImages } from "@/components/picture/picture-grid/picture-grid.server";
import MapBox from "@/components/map";

export default async function Home(): Promise<React.JSX.Element> {
  // https://alphacoders.com/pokemon-wallpapers
  const portfolios = await getPortfolioImages();

  return (
    <div>
      <div className="mt-8 flex justify-center">
        <Selectbox portfolios={portfolios} />
        <MapBox />
      </div>
    </div>
  );
}
