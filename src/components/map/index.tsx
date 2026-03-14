"use client";

import { MagnifierPlus } from "@gravity-ui/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup, ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import type { MapSearchResult, MapboxGeocodingResponse } from "./types";
import { Button } from "@heroui/react";
import MapBoxDepartment from "./mapbox-department";

const DEFAULT_CENTER = { longitude: -88.9, latitude: 13.7 };
const DEFAULT_SEARCH_BOUNDS = {
  minLongitude: -90.2,
  minLatitude: 13.1,
  maxLongitude: -87.6,
  maxLatitude: 14.6
};
const EL_SALVADOR_DEPARTMENTS = [
  { label: "Ahuachapán", value: "ahuachapan" },
  { label: "Santa Ana", value: "santa ana" },
  { label: "Sonsonate", value: "sonsonate" },
  { label: "Chalatenango", value: "chalatenango" },
  { label: "La Libertad", value: "la libertad" },
  { label: "San Salvador", value: "san salvador" },
  { label: "Cuscatlán", value: "cuscatlan" },
  { label: "Cabañas", value: "cabanas" },
  { label: "La Paz", value: "la paz" },
  { label: "San Vicente", value: "san vicente" },
  { label: "Usulután", value: "usulutan" },
  { label: "San Miguel", value: "san miguel" },
  { label: "Morazán", value: "morazan" },
  { label: "La Unión", value: "la union" }
] as const;

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getDepartmentFromQuery(query: string): (typeof EL_SALVADOR_DEPARTMENTS)[number] | null {
  const normalizedQuery = normalizeText(query);

  return (
    EL_SALVADOR_DEPARTMENTS.find((department) => normalizedQuery.includes(department.value)) ?? null
  );
}

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
  const department = getDepartmentFromQuery(query);
  const params = new URLSearchParams({
    access_token: token,
    bbox: [
      DEFAULT_SEARCH_BOUNDS.minLongitude,
      DEFAULT_SEARCH_BOUNDS.minLatitude,
      DEFAULT_SEARCH_BOUNDS.maxLongitude,
      DEFAULT_SEARCH_BOUNDS.maxLatitude
    ].join(","),
    proximity: `${DEFAULT_CENTER.longitude},${DEFAULT_CENTER.latitude}`,
    limit: "5"
  });

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params.toString()}`;
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
    )
    .filter((result) => !department || normalizeText(result.placeName).includes(department.value));
}

async function logSchoolsWithCoordinates(token: string): Promise<void> {
  const schoolsWithCoordinates = [];

  for (const school of schools) {
    try {
      const results = await geocodeSearch(`${school.currentName}, ${school.department}`, token);
      const firstResult = results[0];

      schoolsWithCoordinates.push({
        id: school.id,
        code: school.code,
        currentName: school.currentName,
        excel: school.excel,
        department: school.department,
        municipality: school.municipality,
        district: school.district,
        latitude: firstResult?.latitude,
        longitude: firstResult?.longitude
      });
    } catch {
      schoolsWithCoordinates.push({
        id: school.id,
        code: school.code,
        currentName: school.currentName,
        excel: school.excel,
        department: school.department,
        municipality: school.municipality,
        district: school.district,
        latitude: null,
        longitude: null
      });
    }
  }

  console.log(JSON.stringify(schoolsWithCoordinates, null, 2));
}

const MapBox = (): React.JSX.Element => {
  const [viewState, setViewState] = useState({
    ...DEFAULT_CENTER,
    zoom: 7.8
  });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapSearchResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<MapSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoggedSchoolsRef = useRef(false);
  const detectedDepartment = getDepartmentFromQuery(query);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || hasLoggedSchoolsRef.current) return;

    hasLoggedSchoolsRef.current = true;
    void logSchoolsWithCoordinates(token);
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();
      setError(null);
      const q = query.trim();
      if (!q) {
        setSearchResults([]);
        setSelectedPlace(null);
        return;
      }

      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setError("No se ha configurado el token de Mapbox.");
        return;
      }

      setIsSearching(true);
      try {
        const results = await geocodeSearch(q, token);
        setSearchResults(results);
        setSelectedPlace(null);

        if (results.length > 0) {
          setViewState((prev) => ({
            ...prev,
            longitude: results[0].longitude,
            latitude: results[0].latitude,
            zoom: 14
          }));
        }
      } catch {
        setError("Error al buscar. Intente de nuevo.");
        setSearchResults([]);
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

      {error && <p className="text-xs text-red-500">{error}</p>}

      {searchResults.length > 0 && (
        <p className="text-xs text-text-secondary">
          {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado
          {searchResults.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="h-96 w-full overflow-hidden rounded-md">
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

          {searchResults.map((place) => (
            <Marker key={place.id} latitude={place.latitude} longitude={place.longitude}>
              <button
                aria-label={place.name}
                className="relative block cursor-pointer"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedPlace((current) => (current?.id === place.id ? null : place));
                }}
              >
                <span className="absolute inline-flex size-4 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-red-500 shadow-md" />
              </button>
            </Marker>
          ))}

          {selectedPlace && (
            <Popup
              anchor="bottom"
              closeOnClick={false}
              closeButton={true}
              latitude={selectedPlace.latitude}
              longitude={selectedPlace.longitude}
              offset={16}
              onClose={() => setSelectedPlace(null)}
            >
              <PlacePopup place={selectedPlace} />
            </Popup>
          )}
          <MapBoxDepartment selectedDepartment={detectedDepartment?.label ?? null} />
        </Map>
      </div>
    </div>
  );
};

export default MapBox;
