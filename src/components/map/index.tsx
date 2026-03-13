"use client";

import { MagnifierPlus } from "@gravity-ui/icons";
import { useCallback, useState } from "react";
import Map, { Marker, NavigationControl, Popup, ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import type { MapSearchResult, MapboxGeocodingResponse } from "./types";
import { Button } from "@heroui/react";

const DEFAULT_CENTER = { longitude: -88.9, latitude: 13.7 };

type PlacePopupProps = {
  place: MapSearchResult;
};

const PlacePopup = ({ place }: PlacePopupProps): React.JSX.Element => (
  <div className="min-w-48 space-y-1 p-1 text-xs">
    <p className="font-semibold text-text-primary">{place.name}</p>
    <p className="text-text-secondary">
      <span className="font-medium">Dirección:</span> {place.placeName}
    </p>
    <p className="text-text-secondary">
      <span className="font-medium">Coordenadas:</span> {place.latitude.toFixed(4)}°N,{" "}
      {Math.abs(place.longitude).toFixed(4)}°W
    </p>
  </div>
);

async function geocodeSearch(query: string, token: string): Promise<MapSearchResult[]> {
  const params = new URLSearchParams({
    access_token: token,
    proximity: `${DEFAULT_CENTER.longitude},${DEFAULT_CENTER.latitude}`,
    limit: "5"
  });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) return [];

  const data: MapboxGeocodingResponse = await res.json();

  return data.features.map((f) => ({
    id: f.id,
    name: f.text,
    placeName: f.place_name,
    longitude: f.center[0],
    latitude: f.center[1]
  }));
}

const MapBox = (): React.JSX.Element => {
  const [viewState, setViewState] = useState({
    ...DEFAULT_CENTER,
    zoom: 7.5
  });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapSearchResult[]>([]);
  const [hoveredPlace, setHoveredPlace] = useState<MapSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      const q = query.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) return;

      setIsSearching(true);
      try {
        const results = await geocodeSearch(q, token);
        setSearchResults(results);

        if (results.length > 0) {
          setViewState((prev) => ({
            ...prev,
            longitude: results[0].longitude,
            latitude: results[0].latitude,
            zoom: 14
          }));
        }
      } finally {
        setIsSearching(false);
      }
    },
    [query]
  );

  return (
    <div className="w-full space-y-3">
      <form className="flex items-center gap-2" onSubmit={handleSearch}>
        <input
          aria-label="Buscar centro escolar"
          className="w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          placeholder="Escriba el nombre del centro escolar…"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button aria-label="Buscar" isDisabled={!query.trim() || isSearching} type="submit">
          <MagnifierPlus className="size-4" />
          {isSearching ? "Buscando…" : "Buscar"}
        </Button>
      </form>

      {searchResults.length > 0 && (
        <p className="text-xs text-text-secondary">
          {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado
          {searchResults.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="h-96 w-full overflow-hidden rounded-md">
        <Map
          {...viewState}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          <NavigationControl position="top-right" />

          {searchResults.map((place) => (
            <Marker key={place.id} latitude={place.latitude} longitude={place.longitude}>
              <div
                aria-label={place.name}
                className="relative cursor-pointer"
                role="img"
                onMouseEnter={() => setHoveredPlace(place)}
                onMouseLeave={() => setHoveredPlace(null)}
              >
                <span className="absolute inline-flex size-4 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-red-500 shadow-md" />
              </div>
            </Marker>
          ))}

          {hoveredPlace && (
            <Popup
              anchor="bottom"
              closeButton={false}
              latitude={hoveredPlace.latitude}
              longitude={hoveredPlace.longitude}
              offset={16}
            >
              <PlacePopup place={hoveredPlace} />
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapBox;
