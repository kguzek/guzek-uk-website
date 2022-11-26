import { LatLng } from "./models";

const EARTH_RADIUS = 6371;

const toRad = (degrees: number) => (Math.PI * degrees) / 180;
const toDeg = (radians: number) => (180 * radians) / Math.PI;

const fixLatLngType = (point: LatLng) =>
  Array.isArray(point) ? point : [point.lat, point.lng];

export function getDistanceBetweenTwoPoints(pointA: LatLng, pointB: LatLng) {
  let [latA, lngA] = fixLatLngType(pointA);
  let [latB, lngB] = fixLatLngType(pointB);

  if (latA === latB && lngA === lngB) {
    return 0;
  }

  latA = toRad(latA);
  latB = toRad(latB);

  const deltaLatitude = latB - latA;
  const deltaLongitude = toRad(lngB - lngA);

  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(deltaLongitude / 2) ** 2;
  const b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance_km = EARTH_RADIUS * b;

  // console.log("Distance from", pointA, "to", pointB, "is", distance_km, "km");
  return distance_km;
}
