import { PicturesGrid } from "@/components/picture";
import { getPortfolioImages } from "@/components/picture/picture-grid/picture-grid.server";
import HeroUIDemo from "@/components/heroui-demo";
import Selectbox from "@/components/selectbox";

export default async function Home(): Promise<React.JSX.Element> {
  // https://alphacoders.com/pokemon-wallpapers
  const portfolios = await getPortfolioImages();

  return (
    <div>
      <div className="mt-8 flex justify-center px-4">
        <HeroUIDemo />
      </div>

      <div className="mt-8 flex justify-center">
        <Selectbox />
      </div>

      <div className="flex h-screen w-full items-center justify-end p-8">
        <div className="h-full w-full max-w-4xl overflow-y-scroll">
          <PicturesGrid items={portfolios} transition="easeInOut" duration={0.8} timeOut={300} />
        </div>
      </div>
    </div>
  );
}
