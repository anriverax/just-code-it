"use client";

import { MagnifierPlus } from "@gravity-ui/icons";
import { useCallback, useEffect, useState } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  ViewStateChangeEvent
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import type { DirectionsResponse, MapSearchResult, MapboxGeocodingResponse, RouteInfo } from "./types";
import { Button } from "@heroui/react";

const DEFAULT_SEARCH_BOUNDS = {
  minLongitude: -90.2,
  minLatitude: 13.1,
  maxLongitude: -87.6,
  maxLatitude: 14.6
};

type PlacePopupProps = {
  place: MapSearchResult;
  label: string;
};

const PlacePopup = ({ place, label }: PlacePopupProps): React.JSX.Element => (
  <div className="min-w-48 space-y-1 p-1 text-xs">
    <p className="font-semibold text-text-primary">
      <span className="text-text-secondary">{label}:</span> {place.name}
    </p>
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
    bbox: [
      DEFAULT_SEARCH_BOUNDS.minLongitude,
      DEFAULT_SEARCH_BOUNDS.minLatitude,
      DEFAULT_SEARCH_BOUNDS.maxLongitude,
      DEFAULT_SEARCH_BOUNDS.maxLatitude
    ].join(","),
    proximity: `${(DEFAULT_SEARCH_BOUNDS.minLongitude + DEFAULT_SEARCH_BOUNDS.maxLongitude) / 2},${(DEFAULT_SEARCH_BOUNDS.minLatitude + DEFAULT_SEARCH_BOUNDS.maxLatitude) / 2}`,
    limit: "5"
  });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}&country=sv`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);

  const data: MapboxGeocodingResponse = await res.json();

  return data.features
    .map((f) => ({
      id: f.id,
      name: f.text,
      placeName: f.place_name,
      longitude: f.center[0],
      latitude: f.center[1]
    }))
    .filter(
      (result) =>
        result.longitude >= DEFAULT_SEARCH_BOUNDS.minLongitude &&
        result.longitude <= DEFAULT_SEARCH_BOUNDS.maxLongitude &&
        result.latitude >= DEFAULT_SEARCH_BOUNDS.minLatitude &&
        result.latitude <= DEFAULT_SEARCH_BOUNDS.maxLatitude
    );
}

async function fetchRoute(
  origin: MapSearchResult,
  destination: MapSearchResult,
  token: string
): Promise<RouteInfo | null> {
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const params = new URLSearchParams({
    access_token: token,
    geometries: "geojson",
    overview: "full"
  });

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) return null;

  const data: DirectionsResponse = await res.json();

  if (data.code !== "Ok" || data.routes.length === 0) return null;

  const route = data.routes[0];
  return {
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry
  };
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

type SearchFieldState = {
  query: string;
  results: MapSearchResult[];
  selectedPlace: MapSearchResult | null;
  isSearching: boolean;
};

const initialSearchFieldState: SearchFieldState = {
  query: "",
  results: [],
  selectedPlace: null,
  isSearching: false
};

function fitBounds(
  origin: MapSearchResult | null,
  destination: MapSearchResult | null
): { longitude: number; latitude: number; zoom: number } | null {
  if (origin && destination) {
    return {
      longitude: (origin.longitude + destination.longitude) / 2,
      latitude: (origin.latitude + destination.latitude) / 2,
      zoom: 10
    };
  }

  const place = origin ?? destination;
  if (place) {
    return { longitude: place.longitude, latitude: place.latitude, zoom: 14 };
  }

  return null;
}

const MapBox = (): React.JSX.Element => {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_SEARCH_BOUNDS.minLongitude,
    latitude: DEFAULT_SEARCH_BOUNDS.maxLatitude,
    zoom: 7.8
  });
  const [origin, setOrigin] = useState<SearchFieldState>(initialSearchFieldState);
  const [destination, setDestination] = useState<SearchFieldState>(initialSearchFieldState);
  const [popupPlace, setPopupPlace] = useState<{
    place: MapSearchResult;
    label: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    const originPlace = origin.selectedPlace;
    const destPlace = destination.selectedPlace;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!originPlace || !destPlace || !token) return;

    let cancelled = false;

    void fetchRoute(originPlace, destPlace, token)
      .then((info: RouteInfo | null): void => {
        if (!cancelled) setRouteInfo(info);
      })
      .catch((): void => {
        if (!cancelled) setRouteInfo(null);
      });

    return (): void => {
      cancelled = true;
    };
  }, [origin.selectedPlace, destination.selectedPlace]);

  const handleSearch = useCallback(
    async (
      field: "origin" | "destination",
      query: string,
      setState: React.Dispatch<React.SetStateAction<SearchFieldState>>,
      otherPlace: MapSearchResult | null
    ): Promise<void> => {
      setError(null);
      const q = query.trim();
      if (!q) {
        setState((prev) => ({ ...prev, results: [], selectedPlace: null }));
        setRouteInfo(null);
        return;
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setError("No se ha configurado el token de Mapbox.");
        return;
      }

      setState((prev) => ({ ...prev, isSearching: true }));
      try {
        const results = await geocodeSearch(q, token);
        setState((prev) => ({ ...prev, results, selectedPlace: null, isSearching: false }));
        setRouteInfo(null);

        if (results.length > 0) {
          const firstResult = results[0];
          const newPlace = field === "origin" ? firstResult : otherPlace;
          const newOther = field === "origin" ? otherPlace : firstResult;
          const bounds = fitBounds(newPlace ?? null, newOther ?? null);
          if (bounds) {
            setViewState((prev) => ({ ...prev, ...bounds }));
          }
        }
      } catch {
        setError("Error al buscar. Intente de nuevo.");
        setState((prev) => ({ ...prev, results: [], isSearching: false }));
      }
    },
    []
  );

  const handleSelectResult = useCallback(
    (
      place: MapSearchResult,
      field: "origin" | "destination",
      setState: React.Dispatch<React.SetStateAction<SearchFieldState>>,
      otherPlace: MapSearchResult | null
    ) => {
      setState((prev) => ({
        ...prev,
        query: place.name,
        selectedPlace: place,
        results: []
      }));

      const originPlace = field === "origin" ? place : otherPlace;
      const destPlace = field === "destination" ? place : otherPlace;
      const bounds = fitBounds(originPlace ?? null, destPlace ?? null);
      if (bounds) {
        setViewState((prev) => ({ ...prev, ...bounds }));
      }
    },
    []
  );

  const handleOriginSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      void handleSearch("origin", origin.query, setOrigin, destination.selectedPlace);
    },
    [handleSearch, origin.query, destination.selectedPlace]
  );

  const handleDestinationSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      void handleSearch("destination", destination.query, setDestination, origin.selectedPlace);
    },
    [handleSearch, destination.query, origin.selectedPlace]
  );

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Origin search */}
        <form className="flex items-center gap-2" onSubmit={handleOriginSubmit}>
          <div className="relative w-full">
            <input
              aria-label="Buscar lugar de origen"
              className="w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Buscar lugar de origen…"
              type="text"
              value={origin.query}
              onChange={(e) => setOrigin((prev) => ({ ...prev, query: e.target.value }))}
            />
            {origin.results.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border-primary bg-bg-primary shadow-lg">
                {origin.results.map((place) => (
                  <li key={place.id}>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary"
                      type="button"
                      onClick={() =>
                        handleSelectResult(place, "origin", setOrigin, destination.selectedPlace)
                      }
                    >
                      <p className="font-medium">{place.name}</p>
                      <p className="truncate text-xs text-text-secondary">{place.placeName}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            aria-label="Buscar origen"
            isDisabled={!origin.query.trim() || origin.isSearching}
            type="submit"
          >
            <MagnifierPlus className="size-4" />
            {origin.isSearching ? "Buscando…" : "Origen"}
          </Button>
        </form>

        {/* Destination search */}
        <form className="flex items-center gap-2" onSubmit={handleDestinationSubmit}>
          <div className="relative w-full">
            <input
              aria-label="Buscar lugar de destino"
              className="w-full rounded-md border border-border-primary bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="Buscar lugar de destino…"
              type="text"
              value={destination.query}
              onChange={(e) => setDestination((prev) => ({ ...prev, query: e.target.value }))}
            />
            {destination.results.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border-primary bg-bg-primary shadow-lg">
                {destination.results.map((place) => (
                  <li key={place.id}>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-secondary"
                      type="button"
                      onClick={() =>
                        handleSelectResult(place, "destination", setDestination, origin.selectedPlace)
                      }
                    >
                      <p className="font-medium">{place.name}</p>
                      <p className="truncate text-xs text-text-secondary">{place.placeName}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            aria-label="Buscar destino"
            isDisabled={!destination.query.trim() || destination.isSearching}
            type="submit"
          >
            <MagnifierPlus className="size-4" />
            {destination.isSearching ? "Buscando…" : "Destino"}
          </Button>
        </form>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {(origin.selectedPlace || destination.selectedPlace) && (
        <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
          {origin.selectedPlace && (
            <p>
              <span className="mr-1 inline-block size-2 rounded-full bg-blue-500" />
              <span className="font-medium">Origen:</span> {origin.selectedPlace.name}
            </p>
          )}
          {destination.selectedPlace && (
            <p>
              <span className="mr-1 inline-block size-2 rounded-full bg-red-500" />
              <span className="font-medium">Destino:</span> {destination.selectedPlace.name}
            </p>
          )}
          {routeInfo && (
            <p>
              📍 {formatDistance(routeInfo.distance)} · ⏱ {formatDuration(routeInfo.duration)}
            </p>
          )}
        </div>
      )}

      <div className="relative h-96 w-full overflow-hidden rounded-md">
        <Map
          {...viewState}
          initialViewState={{
            longitude: -88.9,
            latitude: 13.7,
            zoom: 7.5
          }}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          <NavigationControl position="top-right" />

          {origin.selectedPlace && (
            <Marker latitude={origin.selectedPlace.latitude} longitude={origin.selectedPlace.longitude}>
              <button
                aria-label={`Origen: ${origin.selectedPlace.name}`}
                className="relative block cursor-pointer"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPopupPlace((current) =>
                    current?.place.id === origin.selectedPlace?.id
                      ? null
                      : { place: origin.selectedPlace!, label: "Origen" }
                  );
                }}
              >
                <span className="absolute inline-flex size-4 animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
              </button>
            </Marker>
          )}

          {destination.selectedPlace && (
            <Marker
              latitude={destination.selectedPlace.latitude}
              longitude={destination.selectedPlace.longitude}
            >
              <button
                aria-label={`Destino: ${destination.selectedPlace.name}`}
                className="relative block cursor-pointer"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPopupPlace((current) =>
                    current?.place.id === destination.selectedPlace?.id
                      ? null
                      : { place: destination.selectedPlace!, label: "Destino" }
                  );
                }}
              >
                <span className="absolute inline-flex size-4 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-red-500 shadow-md" />
              </button>
            </Marker>
          )}

          {popupPlace && (
            <Popup
              anchor="bottom"
              closeOnClick={false}
              closeButton={true}
              latitude={popupPlace.place.latitude}
              longitude={popupPlace.place.longitude}
              offset={16}
              onClose={() => setPopupPlace(null)}
            >
              <PlacePopup label={popupPlace.label} place={popupPlace.place} />
            </Popup>
          )}

          {routeInfo && (
            <Source
              id="route"
              type="geojson"
              data={{
                type: "Feature",
                properties: {},
                geometry: routeInfo.geometry
              }}
            >
              <Layer
                id="route-outline"
                type="line"
                layout={{ "line-join": "round", "line-cap": "round" }}
                paint={{
                  "line-color": "#1d4ed8",
                  "line-width": 8,
                  "line-opacity": 0.3
                }}
              />
              <Layer
                id="route-line"
                type="line"
                layout={{ "line-join": "round", "line-cap": "round" }}
                paint={{
                  "line-color": "#3b82f6",
                  "line-width": 4,
                  "line-opacity": 0.9
                }}
              />
            </Source>
          )}
        </Map>

        {routeInfo && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2">
            <div className="pointer-events-auto rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-md">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span>🚗</span>
                <span>{formatDuration(routeInfo.duration)}</span>
              </p>
              <p className="text-center text-xs text-gray-500">{formatDistance(routeInfo.distance)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapBox;
