import Selectbox from "@/components/selectbox";
import { getPortfolioImages } from "@/components/picture/picture-grid/picture-grid.server";
import MapBox from "@/components/map";

export default async function Home(): Promise<React.JSX.Element> {
  // https://alphacoders.com/pokemon-wallpapers
  const portfolios = await getPortfolioImages();

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mt-8 flex justify-center">
        <Selectbox portfolios={portfolios} />
      </div>
      <div className="mt-6">
        <MapBox />
      </div>
    </div>
  );
}
