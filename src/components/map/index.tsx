"use client";

import { MagnifierPlus } from "@gravity-ui/icons";
import { useCallback, useState } from "react";
import Map, { Marker, NavigationControl, Popup, ViewStateChangeEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import { SCHOOL_DATA } from "./school-data";
import type { SchoolCenter } from "./types";
import { Button } from "@heroui/react";

type SchoolPopupProps = {
  school: SchoolCenter;
};

const SchoolPopup = ({ school }: SchoolPopupProps): React.JSX.Element => (
  <div className="min-w-48 space-y-1 p-1 text-xs">
    <p className="font-semibold text-text-primary">{school.name}</p>
    <p className="text-text-secondary">
      <span className="font-medium">Código:</span> {school.code}
    </p>
    <p className="text-text-secondary">
      <span className="font-medium">Departamento:</span> {school.department}
    </p>
    <p className="text-text-secondary">
      <span className="font-medium">Municipio:</span> {school.municipality}
    </p>
    <p className="text-text-secondary">
      <span className="font-medium">Dirección:</span> {school.address}
    </p>
    <p className="text-text-secondary">
      <span className="font-medium">Coordenadas:</span> {school.latitude.toFixed(4)}°N,{" "}
      {Math.abs(school.longitude).toFixed(4)}°W
    </p>
  </div>
);

const MapBox = (): React.JSX.Element => {
  const [viewState, setViewState] = useState({
    longitude: -88.9,
    latitude: 13.7,
    zoom: 7.5
  });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SchoolCenter[]>([]);
  const [hoveredSchool, setHoveredSchool] = useState<SchoolCenter | null>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>): void => {
      e.preventDefault();
      const q = query.trim().toLowerCase();
      if (!q) {
        setSearchResults([]);
        return;
      }
      const results = SCHOOL_DATA.filter(
        (school) => school.name.toLowerCase().includes(q) || school.code.toLowerCase().includes(q)
      );
      setSearchResults(results);
      if (results.length > 0) {
        setViewState((prev) => ({
          ...prev,
          longitude: results[0].longitude,
          latitude: results[0].latitude,
          zoom: 13
        }));
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
          placeholder="Buscar centro escolar por nombre o código…"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button aria-label="Buscar" isDisabled={!query.trim()} type="submit">
          <MagnifierPlus className="size-4" />
          Buscar
        </Button>
      </form>

      {searchResults.length > 0 && (
        <p className="text-xs text-text-secondary">
          {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado
          {searchResults.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="h-96 w-full rounded-md overflow-hidden">
        <Map
          {...viewState}
          interactiveLayerIds={["clusters", "unclustered", "depto-fill"]}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/light-v11"
          onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        >
          <NavigationControl position="top-right" />

          {searchResults.map((school) => (
            <Marker key={school.id} latitude={school.latitude} longitude={school.longitude}>
              <div
                aria-label={school.name}
                className="relative cursor-pointer"
                role="img"
                onMouseEnter={() => setHoveredSchool(school)}
                onMouseLeave={() => setHoveredSchool(null)}
              >
                <span className="absolute inline-flex size-4 animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-4 rounded-full border-2 border-white bg-red-500 shadow-md" />
              </div>
            </Marker>
          ))}

          {hoveredSchool && (
            <Popup
              anchor="bottom"
              closeButton={false}
              latitude={hoveredSchool.latitude}
              longitude={hoveredSchool.longitude}
              offset={16}
            >
              <SchoolPopup school={hoveredSchool} />
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};

export default MapBox;
