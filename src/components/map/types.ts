export type MapSearchResult = {
  id: string;
  name: string;
  placeName: string;
  longitude: number;
  latitude: number;
};

export type MapboxFeature = {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
};

export type MapboxGeocodingResponse = {
  features: MapboxFeature[];
};

export type RouteGeometry = {
  type: "LineString";
  coordinates: [number, number][];
};

export type RouteInfo = {
  distance: number;
  duration: number;
  geometry: RouteGeometry;
};

export type DirectionsResponse = {
  routes: RouteInfo[];
  code: string;
};
