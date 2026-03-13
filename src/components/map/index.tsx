"use client";

import { useState } from "react";
import Map, { NavigationControl, ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MapBox = (): React.JSX.Element => {
  const [viewState, setViewState] = useState({
    longitude: -88.9,
    latitude: 13.7,
    zoom: 7.5
  });

  return (
    <div className="h-96 w-full">
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={["clusters", "unclustered", "depto-fill"]}
      >
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
};

export default MapBox;
