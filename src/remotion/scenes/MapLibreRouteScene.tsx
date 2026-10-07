import {
  cutPath,
  getLength,
  getPointAtLength,
  getTangentAtLength,
} from '@remotion/paths';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useDelayRender,
  useRemotionEnvironment,
  useVideoConfig,
} from 'remotion';
import type {MapLibreRouteScene, VideoProject} from '../../project/schema';
import {GeoRouteSceneFrame} from './GeoRouteScene';
import {quantizeFrame} from '../timing';
import {canvasToObjectUrl, mapPlateDimensions, probeWebGl} from '../mapLibreSnapshot';

type Position = [number, number];
type Point = {x: number; y: number};

type Diagnostics = {
  webgl: boolean;
  workerConfigured: boolean;
  styleLoaded: boolean;
  idle: boolean;
  snapshotReady: boolean;
  maxRenderbufferSize: number;
  maxTextureSize: number;
  errors: string[];
};

maplibregl.setWorkerUrl(workerUrl);
maplibregl.setWorkerCount(1);

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const toPath = (points: ReadonlyArray<Point>) =>
  points.length < 2
    ? ''
    : `M ${points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' L ')}`;

const routeBounds = (coordinates: ReadonlyArray<Position>) =>
  coordinates.reduce(
    (bounds, coordinate) => bounds.extend(coordinate),
    new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
  );

const fallbackScene = (
  scene: MapLibreRouteScene,
  reason: string,
): Extract<VideoProject['scenes'][number], {type: 'geo-route'}> => ({
  id: scene.id,
  type: 'geo-route',
  duration: scene.duration,
  motionAmount: scene.motionAmount,
  transitionDuration: scene.transitionDuration,
  title: scene.title,
  routeId: scene.routeId,
  stops: scene.stops,
  progress: scene.progress,
  label: `MapLibre fallback · ${reason}`,
  mapRotation: 0,
  camera: scene.camera,
  cameraZoom: 1.28,
  style: 'clean',
  showDetails: scene.showDetails,
});

export const MapLibreRouteSceneFrame = ({
  scene,
  project,
}: {
  scene: MapLibreRouteScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps, height, width} = useVideoConfig();
  const {isRendering} = useRemotionEnvironment();
  const {delayRender, continueRender} = useDelayRender();

  const route = project.geoRoutes?.[scene.routeId];
  const cameraRoute = scene.cameraRouteId
    ? project.geoRoutes?.[scene.cameraRouteId]
    : route;
  const coordinates = useMemo(
    () => (route?.coordinates ?? []) as Position[],
    [route],
  );
  const cameraCoordinates = useMemo(
    () => (cameraRoute?.coordinates ?? route?.coordinates ?? []) as Position[],
    [cameraRoute, route],
  );

  const [webglProbe] = useState(probeWebGl);
  const {
    safeCameraZoom,
    safeLimit,
    plateScale,
    plateWidth,
    plateHeight,
  } = mapPlateDimensions({
    width,
    height,
    follow: scene.camera === 'follow',
    requestedZoom: scene.cameraZoom,
    webglLimit: Math.min(
      webglProbe.maxRenderbufferSize || 3072,
      webglProbe.maxTextureSize || 3072,
    ),
  });
  const plateLeft = (width - plateWidth) / 2;
  const plateTop = (height - plateHeight) / 2;

  const containerRef = useRef<HTMLDivElement>(null);
  const snapshotUrlRef = useRef<string | null>(null);
  const loadingResolvedRef = useRef(false);
  const [loadingHandle] = useState(() => delayRender('Loading fixed MapLibre plate'));
  const [projectedRoute, setProjectedRoute] = useState<Point[]>([]);
  const [projectedCameraRoute, setProjectedCameraRoute] = useState<Point[]>([]);
  const [projectedStops, setProjectedStops] = useState<Point[]>([]);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostics>(() => ({
    webgl: webglProbe.available,
    workerConfigured: Boolean(workerUrl),
    styleLoaded: false,
    idle: false,
    snapshotReady: false,
    maxRenderbufferSize: webglProbe.maxRenderbufferSize,
    maxTextureSize: webglProbe.maxTextureSize,
    errors: [],
  }));

  useEffect(() => {
    const finishLoading = () => {
      if (!loadingResolvedRef.current) {
        loadingResolvedRef.current = true;
        continueRender(loadingHandle);
      }
    };

    if (!route || coordinates.length < 2) {
      setFallbackReason('route unavailable');
      finishLoading();
      return;
    }

    if (!webglProbe.available) {
      setFallbackReason('WebGL unavailable');
      finishLoading();
      return;
    }

    if (!containerRef.current) {
      setFallbackReason('map container unavailable');
      finishLoading();
      return;
    }

    let disposed = false;
    let snapshotComplete = false;
    let mapInstance: maplibregl.Map | null = null;
    let mapCanvas: HTMLCanvasElement | null = null;

    const timeout = window.setTimeout(() => {
      if (disposed || loadingResolvedRef.current) return;
      setFallbackReason('map/style load timed out');
      mapCanvas?.removeEventListener('webglcontextlost', onContextLost);
      mapInstance?.remove();
      mapInstance = null;
      finishLoading();
    }, 8000);

    try {
      mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: scene.mapStyleUrl,
        center: coordinates[0],
        zoom: 5,
        pitch: 0,
        bearing: 0,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        pixelRatio: 1,
        maxCanvasSize: [safeLimit, safeLimit],
        maxTileCacheSize: 96,
        maxTileCacheZoomLevels: 1,
        cancelPendingTileRequestsWhileZooming: true,
        renderWorldCopies: false,
        localIdeographFontFamily: 'sans-serif',
        canvasContextAttributes: {
          preserveDrawingBuffer: true,
        },
      });
    } catch (error) {
      window.clearTimeout(timeout);
      setFallbackReason(error instanceof Error ? error.message : 'MapLibre initialization failed');
      finishLoading();
      return;
    }

    mapCanvas = mapInstance.getCanvas();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (disposed || snapshotComplete) return;
      setFallbackReason('WebGL context lost');
      mapInstance?.remove();
      mapInstance = null;
      finishLoading();
    };
    mapCanvas.addEventListener('webglcontextlost', onContextLost, {once: true});

    mapInstance.on('error', (event) => {
      const message = event?.error?.message ?? 'MapLibre resource error';
      if (!disposed && !snapshotComplete) {
        setDiagnostics((current) => ({
          ...current,
          errors: [...current.errors.slice(-3), message],
        }));
      }
    });

    mapInstance.on('load', () => {
      if (disposed || !mapInstance) return;

      setDiagnostics((current) => ({...current, styleLoaded: true}));

      mapInstance.fitBounds(routeBounds(coordinates), {
        padding: Math.round(Math.min(plateWidth, plateHeight) * 0.09),
        duration: 0,
        maxZoom: 11.5,
      });

      mapInstance.once('idle', async () => {
        if (disposed || !mapInstance) return;

        const routePoints = coordinates.map(([lon, lat]) => {
          const point = mapInstance!.project([lon, lat]);
          return {x: point.x, y: point.y};
        });
        const cameraPoints = cameraCoordinates.map(([lon, lat]) => {
          const point = mapInstance!.project([lon, lat]);
          return {x: point.x, y: point.y};
        });
        const stopPoints = scene.stops.map((stop) => {
          const point = mapInstance!.project(stop.coordinates);
          return {x: point.x, y: point.y};
        });

        try {
          const url = await canvasToObjectUrl(mapInstance.getCanvas());
          if (disposed) {
            URL.revokeObjectURL(url);
            return;
          }

          snapshotComplete = true;
          snapshotUrlRef.current = url;
          setProjectedRoute(routePoints);
          setProjectedCameraRoute(cameraPoints);
          setProjectedStops(stopPoints);
          setSnapshotUrl(url);
          setDiagnostics((current) => ({
            ...current,
            idle: true,
            snapshotReady: true,
          }));
          window.clearTimeout(timeout);
          mapCanvas?.removeEventListener('webglcontextlost', onContextLost);
          mapInstance.remove();
          mapInstance = null;
          finishLoading();
        } catch (error) {
          if (disposed) return;
          setFallbackReason(
            error instanceof Error ? error.message : 'MapLibre snapshot failed',
          );
          window.clearTimeout(timeout);
          mapCanvas?.removeEventListener('webglcontextlost', onContextLost);
          mapInstance.remove();
          mapInstance = null;
          finishLoading();
        }
      });

      mapInstance.triggerRepaint();
    });

    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      mapCanvas?.removeEventListener('webglcontextlost', onContextLost);
      finishLoading();

      if (!snapshotComplete && !isRendering && mapInstance) {
        // In the long-lived Player, abandoned map loads must release their WebGL
        // context. During Remotion rendering, delayRender keeps the scene mounted
        // until the snapshot path has completed, so cleanup removal is avoided.
        mapInstance.remove();
      }

      if (snapshotUrlRef.current) {
        URL.revokeObjectURL(snapshotUrlRef.current);
        snapshotUrlRef.current = null;
      }
    };
  }, [
    cameraCoordinates,
    continueRender,
    coordinates,
    isRendering,
    loadingHandle,
    plateHeight,
    plateWidth,
    route,
    safeLimit,
    scene.camera,
    scene.mapStyleUrl,
    scene.stops,
    webglProbe.available,
  ]);

  if (!route) {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: project.theme.background,
          color: project.theme.foreground,
          padding: 48,
        }}
      >
        Missing geographic route: {scene.routeId}
      </AbsoluteFill>
    );
  }

  if (fallbackReason) {
    return (
      <GeoRouteSceneFrame
        project={project}
        scene={fallbackScene(scene, fallbackReason)}
      />
    );
  }

  const graphicFrame = quantizeFrame(frame, fps, scene.graphicFps);
  const smoothProgress = interpolate(
    frame,
    [fps * 0.08, Math.max(fps * 0.6, durationInFrames * 0.86)],
    [0.001, Math.max(0.001, scene.progress)],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );
  const overlayProgress = interpolate(
    graphicFrame,
    [fps * 0.08, Math.max(fps * 0.6, durationInFrames * 0.86)],
    [0.001, Math.max(0.001, scene.progress)],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const path = toPath(projectedRoute);
  const cameraPath = toPath(projectedCameraRoute);
  const pathLength = path ? getLength(path) : 0;
  const cameraPathLength = cameraPath ? getLength(cameraPath) : 0;
  const visiblePath = pathLength > 0
    ? cutPath(path, pathLength * clamp01(overlayProgress))
    : '';
  const markerDistance = pathLength * clamp01(overlayProgress);
  const markerPoint = path
    ? getPointAtLength(path, markerDistance) ?? projectedRoute[0]
    : projectedRoute[0];
  const markerTangent = path
    ? getTangentAtLength(path, markerDistance) ?? {x: 1, y: 0}
    : {x: 1, y: 0};
  const markerBearing = Math.atan2(markerTangent.y, markerTangent.x) * 180 / Math.PI;

  // The route marker and the camera deliberately use separate progress values.
  // This follows the same principle as Remotion's Mapbox route example while
  // keeping our browser renderer on one already-loaded MapLibre plate.
  const cameraProgress = clamp01(smoothProgress + scene.cameraLead);
  const cameraDistance = cameraPathLength * cameraProgress;
  const cameraPoint = cameraPath
    ? getPointAtLength(cameraPath, cameraDistance) ?? projectedCameraRoute[0]
    : projectedCameraRoute[0] ?? markerPoint;

  const desiredX = width * 0.5;
  const desiredY = height * scene.cameraAnchorY;
  const rawDx = cameraPoint ? desiredX - (plateLeft + cameraPoint.x) : 0;
  const rawDy = cameraPoint ? desiredY - (plateTop + cameraPoint.y) : 0;
  const followStrength = scene.camera === 'follow'
    ? interpolate(
        frame,
        [fps * 0.12, Math.max(fps * 0.75, durationInFrames * 0.24)],
        [0, 1],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.inOut(Easing.cubic),
        },
      )
    : 0;
  const cameraScale = scene.camera === 'follow'
    ? 1 / safeCameraZoom + (1 - 1 / safeCameraZoom) * followStrength
    : 1;
  const marginX = Math.max(0, (plateWidth * cameraScale - width) / 2);
  const marginY = Math.max(0, (plateHeight * cameraScale - height) / 2);
  const dx = clamp(rawDx, -marginX, marginX) * followStrength;
  const dy = clamp(rawDy, -marginY, marginY) * followStrength;

  const {foreground, muted, accent} = project.theme;
  const start = scene.stops[0]?.label;
  const end = scene.stops[scene.stops.length - 1]?.label;
  const ready =
    projectedRoute.length >= 2 &&
    projectedCameraRoute.length >= 2 &&
    diagnostics.idle &&
    diagnostics.snapshotReady &&
    Boolean(snapshotUrl);

  return (
    <AbsoluteFill style={{backgroundColor: '#dbeafe', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: plateLeft,
          top: plateTop,
          width: plateWidth,
          height: plateHeight,
          opacity: ready ? 1 : 0,
          transform: `translate3d(${dx}px, ${dy}px, 0) scale(${cameraScale})`,
          transformOrigin: cameraPoint
            ? `${cameraPoint.x}px ${cameraPoint.y}px`
            : '50% 50%',
          willChange: scene.camera === 'follow' ? 'transform' : undefined,
        }}
      >
        {snapshotUrl ? (
          <img
            alt=""
            src={snapshotUrl}
            style={{
              position: 'absolute',
              inset: 0,
              width: plateWidth,
              height: plateHeight,
              objectFit: 'fill',
              userSelect: 'none',
            }}
          />
        ) : (
          <div
            ref={containerRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: plateWidth,
              height: plateHeight,
            }}
          />
        )}

        {ready ? (
          <svg
            width={plateWidth}
            height={plateHeight}
            viewBox={`0 0 ${plateWidth} ${plateHeight}`}
            style={{position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none'}}
          >
            <path
              d={path}
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity={0.92}
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={visiblePath}
              fill="none"
              stroke={scene.routeColor}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {projectedStops.map((point, index) => (
              <g key={`${scene.stops[index]?.label ?? 'stop'}-${index}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={index / Math.max(1, projectedStops.length - 1) <= overlayProgress + 0.02 ? 10 : 7}
                  fill={index / Math.max(1, projectedStops.length - 1) <= overlayProgress + 0.02
                    ? scene.markerColor
                    : '#94A3B8'}
                  stroke="#FFFFFF"
                  strokeWidth={4}
                />
              </g>
            ))}

            {markerPoint ? (
              <g
                transform={`translate(${markerPoint.x} ${markerPoint.y}) rotate(${markerBearing})`}
              >
                <circle r={16} fill={scene.markerColor} stroke="#FFFFFF" strokeWidth={5} />
                <path
                  d="M -5 -7 L 9 0 L -5 7 Z"
                  fill="#FFFFFF"
                  transform="translate(2 0)"
                />
              </g>
            ) : null}
          </svg>
        ) : null}
      </div>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.04) 30%, rgba(0,0,0,0.04) 66%, rgba(0,0,0,0.60) 100%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: width * 0.065,
          right: width * 0.065,
          top: height * 0.06,
          color: '#FFFFFF',
          fontFamily: 'Inter, Arial, sans-serif',
          textShadow: '0 2px 18px rgba(0,0,0,0.45)',
        }}
      >
        <div
          style={{
            fontSize: width * 0.018,
            fontWeight: 850,
            letterSpacing: width * 0.0045,
            color: accent,
          }}
        >
          MAPLIBRE · SNAPSHOT PLATE
        </div>
        <div
          style={{
            fontSize: width * 0.052,
            lineHeight: 1.04,
            fontWeight: 850,
            marginTop: height * 0.012,
          }}
        >
          {scene.title}
        </div>
        {scene.label ? (
          <div
            style={{
              fontSize: width * 0.024,
              color: '#F4F4F4',
              fontWeight: 650,
              marginTop: height * 0.012,
            }}
          >
            {scene.label}
          </div>
        ) : null}
      </div>

      {scene.showDetails ? (
        <div
          style={{
            position: 'absolute',
            left: width * 0.065,
            bottom: height * 0.085,
            color: '#FFFFFF',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          <div style={{fontSize: width * 0.029, fontWeight: 820}}>
            {start}{start && end ? ' → ' : ''}{end}
          </div>
          <div
            style={{
              fontSize: width * 0.016,
              color: '#E5E7EB',
              marginTop: height * 0.011,
            }}
          >
            Route: {route.source.name} · {route.source.license}
          </div>
          <div
            style={{
              fontSize: width * 0.014,
              color: muted,
              marginTop: height * 0.007,
            }}
          >
            Basemap: OpenFreeMap · © OpenStreetMap contributors
          </div>
        </div>
      ) : null}

      {!isRendering ? (
        <div
          style={{
            position: 'absolute',
            right: width * 0.035,
            bottom: height * 0.035,
            display: 'grid',
            gap: 5,
            padding: `${height * 0.012}px ${width * 0.014}px`,
            borderRadius: 12,
            background: 'rgba(5,10,18,0.76)',
            color: '#DDE7F0',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: Math.max(11, width * 0.011),
            lineHeight: 1.25,
            backdropFilter: 'blur(8px)',
          }}
        >
          <strong style={{color: '#FFFFFF'}}>MapLibre diagnostics</strong>
          <span>WebGL {diagnostics.webgl ? '✓' : '×'}</span>
          <span>Worker URL {diagnostics.workerConfigured ? '✓' : '×'}</span>
          <span>Style {diagnostics.styleLoaded ? '✓' : '…'}</span>
          <span>Idle plate {diagnostics.idle ? '✓' : '…'}</span>
          <span>Snapshot {diagnostics.snapshotReady ? '✓ WebGL released' : '…'}</span>
          <span>Canvas {plateWidth}×{plateHeight} · 1× DPR</span>
          <span>GPU limit {Math.min(diagnostics.maxRenderbufferSize || safeLimit, diagnostics.maxTextureSize || safeLimit)} px</span>
          <span>Errors {diagnostics.errors.length}</span>
          <span>Camera route {scene.cameraRouteId ? 'dedicated' : 'route + lead'}</span>
          <span>Lead {(scene.cameraLead * 100).toFixed(1)}% · safe zoom {safeCameraZoom.toFixed(2)}×</span>
          <span>Plate scale {plateScale.toFixed(2)}× · CSS scale ≤ 1</span>
          <span>Overlay cadence {scene.graphicFps.toFixed(0)} fps · camera smooth</span>
          {diagnostics.errors.length > 0 ? (
            <span style={{maxWidth: width * 0.34, color: '#FCA5A5'}}>
              {diagnostics.errors[diagnostics.errors.length - 1]}
            </span>
          ) : null}
        </div>
      ) : null}

      {!ready ? (
        <div
          style={{
            position: 'absolute',
            left: width * 0.065,
            bottom: height * 0.18,
            color: foreground,
            fontFamily: 'Inter, Arial, sans-serif',
            fontSize: width * 0.018,
            fontWeight: 700,
          }}
        >
          Preparing map snapshot…
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
