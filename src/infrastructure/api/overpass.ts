export const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

export const OVERPASS_QUERY_TEMPLATE = `
[out:json][timeout:25];
(
  node(around:{radius},{lat},{lon})
    ["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream"]
    ["name"];
  node(around:{radius},{lat},{lon})
    ["tourism"~"museum|gallery|attraction|artwork"]
    ["name"];
);
out center tags 100;
`;

export const OVERPASS_VALID_AMENITIES = [
  "restaurant",
  "cafe",
  "bar",
  "pub",
  "fast_food",
  "ice_cream"
];

export const OVERPASS_VALID_TOURISM = [
  "museum",
  "gallery",
  "attraction",
  "artwork"
];

export const CACHE_DURATION = 5 * 60 * 1000;