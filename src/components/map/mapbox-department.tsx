"use client";

import { Layer, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import departments from "./department.json";

type MapBoxDepartmentProps = {
  selectedDepartment?: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const MapBoxDepartment = ({ selectedDepartment = null }: MapBoxDepartmentProps): React.JSX.Element => (
  <Source id="departments" type="geojson" data={departments as any} generateId={true}>
    <Layer
      id="depto-fill"
      type="fill"
      paint={{
        "fill-color": [
          "case",
          ["==", ["get", "name"], selectedDepartment ?? ""],
          "#f97316",
          "rgba(79,134,247,0.1)"
        ],
        "fill-opacity": ["case", ["==", ["get", "name"], selectedDepartment ?? ""], 0.35, 0.12]
      }}
    />

    <Layer
      id="depto-border"
      type="line"
      paint={{
        "line-color": [
          "case",
          ["==", ["get", "name"], selectedDepartment ?? ""],
          "#ea580c",
          "#dbdbdb"
        ],
        "line-width": ["case", ["==", ["get", "name"], selectedDepartment ?? ""], 3, 2]
      }}
    />
  </Source>
);
/* eslint-enable @typescript-eslint/no-explicit-any */
export default MapBoxDepartment;
