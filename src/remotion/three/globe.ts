import * as THREE from 'three';

export type GlobeCoordinate = [number, number];

const degToRad = (value: number) => value * Math.PI / 180;

export const latLonToVector3 = (
  [lon, lat]: GlobeCoordinate,
  radius = 1,
) => {
  const latitude = degToRad(lat);
  const longitude = degToRad(lon);

  return new THREE.Vector3(
    Math.cos(latitude) * Math.sin(longitude) * radius,
    Math.sin(latitude) * radius,
    Math.cos(latitude) * Math.cos(longitude) * radius,
  );
};

export const greatCircleArc = ({
  start,
  end,
  radius = 1.2,
  arcHeight = 0.2,
  samples = 48,
}: {
  start: GlobeCoordinate;
  end: GlobeCoordinate;
  radius?: number;
  arcHeight?: number;
  samples?: number;
}) => {
  const from = latLonToVector3(start, 1).normalize();
  const to = latLonToVector3(end, 1).normalize();
  const rotation = new THREE.Quaternion().setFromUnitVectors(from, to);
  const identity = new THREE.Quaternion();

  return Array.from({length: Math.max(2, samples)}, (_, index) => {
    const t = index / Math.max(1, samples - 1);
    const q = new THREE.Quaternion().slerpQuaternions(identity, rotation, t);
    const altitude = Math.sin(Math.PI * t) * arcHeight;

    return from
      .clone()
      .applyQuaternion(q)
      .normalize()
      .multiplyScalar(radius + altitude);
  });
};

export const multiStopGlobeArc = ({
  stops,
  radius = 1.2,
  arcHeight = 0.2,
  samplesPerLeg = 48,
}: {
  stops: GlobeCoordinate[];
  radius?: number;
  arcHeight?: number;
  samplesPerLeg?: number;
}) => {
  const points: THREE.Vector3[] = [];

  for (let index = 0; index < stops.length - 1; index++) {
    const leg = greatCircleArc({
      start: stops[index],
      end: stops[index + 1],
      radius,
      arcHeight,
      samples: samplesPerLeg,
    });

    points.push(...(index === 0 ? leg : leg.slice(1)));
  }

  return points;
};

export const globeProgressPoint = (
  points: ReadonlyArray<THREE.Vector3>,
  progress: number,
) => {
  if (points.length === 0) return new THREE.Vector3(0, 0, 0);
  const clamped = Math.max(0, Math.min(1, progress));
  const exact = clamped * (points.length - 1);
  const leftIndex = Math.floor(exact);
  const rightIndex = Math.min(points.length - 1, leftIndex + 1);
  const mix = exact - leftIndex;

  return points[leftIndex].clone().lerp(points[rightIndex], mix);
};
