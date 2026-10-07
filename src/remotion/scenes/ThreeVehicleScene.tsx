import {ThreeCanvas} from '@remotion/three';
import {useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import type {ThreeVehicleScene, VideoProject} from '../../project/schema';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const canUseWebGl = () => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

const vehiclePath = (style: ThreeVehicleScene['pathStyle']) => {
  if (style === 'straight') {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.6, -0.2, 0),
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(3.6, 0.25, 0),
    ]);
  }
  if (style === 's-curve') {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.6, -0.3, 0.8),
      new THREE.Vector3(-1.8, 0.15, -0.8),
      new THREE.Vector3(0, 0.05, 0.65),
      new THREE.Vector3(1.8, 0.3, -0.55),
      new THREE.Vector3(3.6, 0.2, 0.3),
    ]);
  }
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.6, -0.3, 0.65),
    new THREE.Vector3(-1.8, 0.05, 0.2),
    new THREE.Vector3(0, 0.2, -0.45),
    new THREE.Vector3(1.8, 0.25, -0.15),
    new THREE.Vector3(3.6, 0.35, 0.5),
  ]);
};

const Material = ({color, emissive = false}: {color: string; emissive?: boolean}) => (
  <meshStandardMaterial
    color={color}
    emissive={emissive ? color : '#000000'}
    emissiveIntensity={emissive ? 0.45 : 0}
    metalness={0.24}
    roughness={0.3}
  />
);

const Train = ({color, accent}: {color: string; accent: string}) => (
  <group rotation={[0, 0, 0]}>
    <mesh scale={[1.55, 0.28, 0.34]}>
      <boxGeometry args={[1, 1, 1]} />
      <Material color={color} />
    </mesh>
    <mesh position={[0.88, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[0.34, 0.75, 24]} />
      <Material color={color} />
    </mesh>
    <mesh position={[0.2, 0.13, 0.345]} scale={[0.72, 0.05, 0.02]}>
      <boxGeometry args={[1, 1, 1]} />
      <Material color={accent} emissive />
    </mesh>
    {[-0.8, 0, 0.72].map((x) => (
      <mesh key={x} position={[x, -0.31, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.08, 18]} />
        <Material color="#17202A" />
      </mesh>
    ))}
  </group>
);

const Plane = ({color, accent}: {color: string; accent: string}) => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]} scale={[0.22, 1.2, 0.22]}>
      <cylinderGeometry args={[0.5, 0.5, 1, 24]} />
      <Material color={color} />
    </mesh>
    <mesh position={[0.25, 0, 0]} scale={[1.6, 0.07, 0.46]}>
      <boxGeometry args={[1, 1, 1]} />
      <Material color={color} />
    </mesh>
    <mesh position={[-0.86, 0.24, 0]} scale={[0.45, 0.48, 0.08]}>
      <boxGeometry args={[1, 1, 1]} />
      <Material color={accent} emissive />
    </mesh>
    <mesh position={[0.92, 0, 0]}>
      <coneGeometry args={[0.22, 0.58, 20]} />
      <Material color={color} />
    </mesh>
  </group>
);

const Car = ({color, accent}: {color: string; accent: string}) => (
  <group>
    <mesh scale={[0.95, 0.22, 0.48]}>
      <boxGeometry args={[1, 1, 1]} />
      <Material color={color} />
    </mesh>
    <mesh position={[-0.08, 0.24, 0]} scale={[0.48, 0.24, 0.42]}>
      <boxGeometry args={[1, 1, 1]} />
      <Material color={accent} />
    </mesh>
    {[[-0.55, -0.23, 0.42], [0.55, -0.23, 0.42], [-0.55, -0.23, -0.42], [0.55, -0.23, -0.42]].map((p, index) => (
      <mesh key={index} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 18]} />
        <Material color="#111827" />
      </mesh>
    ))}
  </group>
);

const ThreeVehicleModel = ({scene}: {scene: ThreeVehicleScene}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const curve = useMemo(() => vehiclePath(scene.pathStyle), [scene.pathStyle]);
  const progress = interpolate(
    frame,
    [fps * 0.12, Math.max(fps * 0.75, durationInFrames * 0.86)],
    [0, 1],
    {...clamp, easing: Easing.inOut(Easing.cubic)},
  );
  const point = curve.getPointAt(progress);
  const tangent = curve.getTangentAt(Math.min(1, progress + 0.004)).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    tangent.lengthSq() > 0 ? tangent : new THREE.Vector3(1, 0, 0),
  );
  const trailPoints = curve.getPoints(90);

  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight position={[2.5, 4, 4]} intensity={2.4} />
      <pointLight position={[-3, 1, 2]} intensity={1.2} color={scene.accentColor} />

      <mesh position={[0, -0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 5]} />
        <meshStandardMaterial color="#0B1118" roughness={0.9} />
      </mesh>

      {scene.showTrail ? (
        <mesh>
          <tubeGeometry args={[curve, 90, 0.025, 8, false]} />
          <meshStandardMaterial
            color={scene.accentColor}
            emissive={scene.accentColor}
            emissiveIntensity={0.5}
            opacity={0.8}
            transparent
          />
        </mesh>
      ) : null}

      {trailPoints.filter((_, index) => index % 12 === 0).map((p, index) => (
        <mesh key={index} position={[p.x, -0.54, p.z]}>
          <boxGeometry args={[0.045, 0.025, 0.32]} />
          <meshStandardMaterial color="#FFFFFF" opacity={0.18} transparent />
        </mesh>
      ))}

      <group position={[point.x, point.y, point.z]} quaternion={quaternion}>
        {scene.vehicle === 'train' ? (
          <Train color={scene.vehicleColor} accent={scene.accentColor} />
        ) : scene.vehicle === 'plane' ? (
          <Plane color={scene.vehicleColor} accent={scene.accentColor} />
        ) : (
          <Car color={scene.vehicleColor} accent={scene.accentColor} />
        )}
      </group>
    </>
  );
};

const ThreeVehicleFallback = ({scene, project}: {scene: ThreeVehicleScene; project: VideoProject}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const p = frame / Math.max(1, durationInFrames - 1);
  const x = width * (0.12 + p * 0.76);
  const y = height * (0.58 - Math.sin(p * Math.PI) * 0.08);
  return (
    <AbsoluteFill style={{backgroundColor: project.theme.background}}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <path
          d={`M ${width * 0.1} ${height * 0.62} Q ${width * 0.5} ${height * 0.42} ${width * 0.9} ${height * 0.58}`}
          fill="none"
          stroke={scene.accentColor}
          strokeWidth={8}
          opacity={0.55}
        />
        <g transform={`translate(${x} ${y})`}>
          <rect x={-42} y={-16} width={84} height={32} rx={12} fill={scene.vehicleColor} />
          <circle cx={-24} cy={18} r={8} fill={scene.accentColor} />
          <circle cx={24} cy={18} r={8} fill={scene.accentColor} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const ThreeVehicleSceneFrame = ({
  scene,
  project,
}: {
  scene: ThreeVehicleScene;
  project: VideoProject;
}) => {
  const {width, height} = useVideoConfig();
  const webGl = useMemo(canUseWebGl, []);
  const cameraPosition =
    scene.cameraAngle === 'low'
      ? [0, 0.65, 5.4]
      : scene.cameraAngle === 'side'
        ? [0, 2.2, 5.2]
        : [0.2, 2.7, 5.8];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: project.theme.background,
        overflow: 'hidden',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      {webGl ? (
        <ThreeCanvas
          width={width}
          height={height}
          dpr={1}
          camera={{position: cameraPosition as [number, number, number], fov: 42}}
        >
          <ThreeVehicleModel scene={scene} />
        </ThreeCanvas>
      ) : (
        <ThreeVehicleFallback scene={scene} project={project} />
      )}

      <div style={{position: 'absolute', left: width * 0.065, right: width * 0.065, top: height * 0.065}}>
        <div style={{color: scene.accentColor, fontSize: width * 0.018, fontWeight: 850, letterSpacing: 4}}>
          3D TRAVEL VEHICLE · {scene.vehicle.toUpperCase()}
        </div>
        <div style={{color: '#FFFFFF', fontFamily: 'Georgia, serif', fontSize: width * 0.055, fontWeight: 760, marginTop: height * 0.012}}>
          {scene.title}
        </div>
        {scene.subtitle ? (
          <div style={{color: '#CBD5E1', fontSize: width * 0.021, fontWeight: 600, marginTop: height * 0.014}}>
            {scene.subtitle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
