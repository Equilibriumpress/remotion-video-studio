import {ThreeCanvas} from '@remotion/three';
import {useMemo, useRef} from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import * as THREE from 'three';
import type {Group} from 'three';
import type {ThreeGlobeScene, VideoProject} from '../../project/schema';
import {
  globeProgressPoint,
  latLonToVector3,
  multiStopGlobeArc,
} from '../three/globe';

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const canUseWebGl = () => {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
};

const RouteTube = ({
  points,
  color,
  opacity = 1,
  radius,
}: {
  points: THREE.Vector3[];
  color: string;
  opacity?: number;
  radius: number;
}) => {
  if (points.length < 2) return null;

  const curve = new THREE.CatmullRomCurve3(points);
  return (
    <mesh>
      <tubeGeometry
        args={[
          curve,
          Math.max(12, Math.min(180, points.length * 2)),
          radius,
          8,
          false,
        ]}
      />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={opacity === 1 ? 0.3 : 0}
        opacity={opacity}
        transparent={opacity < 1}
        roughness={0.35}
      />
    </mesh>
  );
};

const GlobeModel = ({
  scene,
}: {
  scene: ThreeGlobeScene;
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const groupRef = useRef<Group>(null);

  const routePoints = useMemo(
    () => multiStopGlobeArc({
      stops: scene.stops.map((stop) => stop.coordinates),
      radius: 1.2,
      arcHeight: scene.arcHeight,
      samplesPerLeg: 52,
    }),
    [scene.arcHeight, scene.stops],
  );

  const progress = interpolate(
    frame,
    [fps * 0.15, Math.max(fps * 0.8, durationInFrames * 0.82)],
    [0, 1],
    clamp,
  );
  const visibleCount = Math.max(
    2,
    Math.min(routePoints.length, Math.ceil(progress * routePoints.length)),
  );
  const visiblePoints = routePoints.slice(0, visibleCount);
  const marker = globeProgressPoint(routePoints, progress);

  const rotationY =
    scene.globeRotation * Math.PI / 180 +
    (frame / fps) * scene.autoRotate;

  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[3.5, 2.4, 4.5]} intensity={2.2} />
      <pointLight position={[-3, -1.5, 2]} intensity={0.8} color={scene.atmosphereColor} />

      <group
        ref={groupRef}
        rotation={[-0.14, rotationY, 0]}
      >
        <mesh>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshStandardMaterial
            color={scene.globeColor}
            metalness={0.08}
            roughness={0.78}
          />
        </mesh>

        {scene.showGrid ? (
          <mesh>
            <sphereGeometry args={[1.207, 32, 24]} />
            <meshBasicMaterial
              color={scene.atmosphereColor}
              opacity={0.18}
              transparent
              wireframe
            />
          </mesh>
        ) : null}

        <mesh>
          <sphereGeometry args={[1.245, 48, 48]} />
          <meshBasicMaterial
            color={scene.atmosphereColor}
            opacity={0.07}
            side={THREE.BackSide}
            transparent
          />
        </mesh>

        <RouteTube
          points={routePoints}
          color={scene.routeColor}
          opacity={0.16}
          radius={0.012}
        />
        <RouteTube
          points={visiblePoints}
          color={scene.routeColor}
          radius={0.023}
        />

        {scene.stops.map((stop, index) => {
          const position = latLonToVector3(stop.coordinates, 1.225);
          const passed = index / Math.max(1, scene.stops.length - 1) <= progress + 0.03;

          return (
            <mesh
              key={`${stop.label}-${index}`}
              position={[position.x, position.y, position.z]}
            >
              <sphereGeometry args={[passed ? 0.043 : 0.029, 18, 18]} />
              <meshStandardMaterial
                color={passed ? scene.markerColor : scene.routeColor}
                emissive={passed ? scene.markerColor : scene.routeColor}
                emissiveIntensity={passed ? 0.65 : 0.2}
              />
            </mesh>
          );
        })}

        <mesh position={[marker.x, marker.y, marker.z]}>
          <sphereGeometry args={[0.052, 20, 20]} />
          <meshStandardMaterial
            color={scene.markerColor}
            emissive={scene.markerColor}
            emissiveIntensity={1.25}
          />
        </mesh>
      </group>
    </>
  );
};

const ThreeGlobeFallback = ({
  scene,
  project,
}: {
  scene: ThreeGlobeScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0, 1],
    clamp,
  );
  const radius = Math.min(width, height) * 0.31;
  const cx = width / 2;
  const cy = height * 0.46;
  const routeStartX = cx - radius * 0.58;
  const routeEndX = cx + radius * 0.58;
  const routeY = cy + radius * 0.05;
  const controlY = cy - radius * 0.9;
  const routePath = `M ${routeStartX} ${routeY} Q ${cx} ${controlY} ${routeEndX} ${routeY}`;

  return (
    <AbsoluteFill style={{backgroundColor: project.theme.background}}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <circle cx={cx} cy={cy} r={radius} fill={scene.globeColor} />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={scene.atmosphereColor}
          strokeOpacity={0.35}
          strokeWidth={3}
        />
        {[-0.55, 0, 0.55].map((ratio) => (
          <ellipse
            key={ratio}
            cx={cx}
            cy={cy}
            rx={radius * Math.sqrt(1 - ratio * ratio)}
            ry={radius * 0.28}
            fill="none"
            stroke={scene.atmosphereColor}
            strokeOpacity={0.16}
            strokeWidth={2}
            transform={`translate(0 ${ratio * radius})`}
          />
        ))}
        <path
          d={routePath}
          fill="none"
          stroke={scene.routeColor}
          strokeOpacity={0.24}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d={routePath}
          fill="none"
          stroke={scene.routeColor}
          strokeWidth={12}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - progress}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: width * 0.07,
          right: width * 0.07,
          bottom: height * 0.08,
          color: project.theme.muted,
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: width * 0.02,
          textAlign: 'center',
        }}
      >
        WebGL unavailable · lightweight globe fallback
      </div>
    </AbsoluteFill>
  );
};

export const ThreeGlobeSceneFrame = ({
  scene,
  project,
}: {
  scene: ThreeGlobeScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const webGl = useMemo(canUseWebGl, []);
  const {background, foreground, muted, accent} = project.theme;

  if (!webGl) {
    return <ThreeGlobeFallback scene={scene} project={project} />;
  }

  const enter = interpolate(frame, [0, fps * 0.45], [0, 1], clamp);
  const progress = interpolate(
    frame,
    [fps * 0.15, Math.max(fps * 0.8, useVideoConfig().durationInFrames * 0.82)],
    [0, 1],
    clamp,
  );
  const activeIndex = Math.min(
    scene.stops.length - 1,
    Math.floor(progress * scene.stops.length),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: background,
        overflow: 'hidden',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{
          position: [0, 0, scene.cameraDistance],
          fov: 38,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        style={{position: 'absolute', inset: 0}}
      >
        <GlobeModel scene={scene} />
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.06) 68%, rgba(0,0,0,0.58) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: width * 0.065,
          right: width * 0.065,
          top: height * 0.06,
          color: foreground,
          opacity: enter,
          transform: `translateY(${(1 - enter) * height * 0.025}px)`,
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: width * 0.018,
            fontWeight: 850,
            letterSpacing: width * 0.0042,
          }}
        >
          EXPERIMENTAL 3D GLOBE
        </div>
        <div
          style={{
            marginTop: height * 0.012,
            fontSize: width * 0.052,
            fontWeight: 880,
            lineHeight: 1.02,
          }}
        >
          {scene.title}
        </div>
        {scene.subtitle ? (
          <div
            style={{
              marginTop: height * 0.012,
              maxWidth: width * 0.72,
              color: '#F1F5F9',
              fontSize: width * 0.023,
              fontWeight: 620,
            }}
          >
            {scene.subtitle}
          </div>
        ) : null}
      </div>

      {scene.showDetails ? (
        <div
          style={{
            position: 'absolute',
            left: width * 0.065,
            right: width * 0.065,
            bottom: height * 0.07,
            color: foreground,
            opacity: enter,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: width * 0.012,
              alignItems: 'center',
            }}
          >
            {scene.stops.map((stop, index) => (
              <div
                key={`${stop.label}-chip-${index}`}
                style={{
                  border: `1px solid ${index === activeIndex ? scene.routeColor : 'rgba(255,255,255,0.25)'}`,
                  borderRadius: 999,
                  padding: `${height * 0.008}px ${width * 0.014}px`,
                  color: index === activeIndex ? '#FFFFFF' : muted,
                  background: index === activeIndex
                    ? 'rgba(0,0,0,0.5)'
                    : 'rgba(0,0,0,0.24)',
                  fontSize: width * 0.017,
                  fontWeight: index === activeIndex ? 800 : 650,
                }}
              >
                {stop.label}
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: height * 0.014,
              color: muted,
              fontSize: width * 0.014,
              fontWeight: 560,
            }}
          >
            Great-circle visualization · not a navigable flight path
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
