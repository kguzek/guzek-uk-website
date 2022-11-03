export type LatLng = {
  lat: number;
  lng: number;
};

const toRad = (degrees: number) => (Math.PI * degrees) / 180;
const toDeg = (radians: number) => (180 * radians) / Math.PI;

function getDistanceBetweenTwoPoints(pointA: LatLng, pointB: LatLng) {
  if (pointA.lat == pointB.lat && pointA.lng == pointB.lng) {
    return 0;
  }

  const latA = toRad(pointA.lat);
  const latB = toRad(pointB.lat);

  const theta = pointA.lng - pointB.lng;
  const radtheta = (Math.PI * theta) / 180;

  let dist =
    Math.sin(latA) * Math.sin(latB) +
    Math.cos(latA) * Math.cos(latB) * Math.cos(radtheta);

  dist = toDeg(Math.acos(Math.min(dist, 1))) * 60;
  dist = dist * 1.1515;

  return dist * 1.609344; // Convert miles to km
}
