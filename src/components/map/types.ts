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
