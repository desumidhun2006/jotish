/**
 * Static Geocoding Dictionary
 * 
 * ARCHITECTURE NOTE: Relying on live Geocoding APIs (like Google Maps) during client-side 
 * rendering introduces severe rate-limiting risks, high latency, and API key exposure.
 * For a dashboard with a known geographic scope, a static dictionary is much more performant.
 */
export const CITY_COORDINATES = {
  "New York": { lat: 40.7128, lng: -74.0060 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  "London": { lat: 51.5074, lng: -0.1278 },
  "Austin": { lat: 30.2672, lng: -97.7431 },
  "Seattle": { lat: 47.6062, lng: -122.3321 }
};