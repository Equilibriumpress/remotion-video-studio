import maplibregl, {type GeoJSONSource, type Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useDelayRender,
  useVideoConfig,
} from 'remotion';
import type {MapLibreRouteScene, VideoProject} from '../../project/schema';
import {GeoRouteSceneFrame, sliceGeoRouteByProgress} from './GeoRouteScene';

type Position = [number, number];

const pointFeature = (coordinates: Position) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'Point' as const,
    coordinates,
  },
});

const lineFeature = (coordinates: Position[]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: {
    type: 'LineString' as const,
    coordinates,
  },
});

const last = <T,>(items: ReadonlyArray<T>) => items[items.length - 1];

const cameraOptions = ({
  map,
  route,
  progress,
  altitude,
}: {
  map: Map;
  route: ReadonlyArray<Position>;
  progress: number;
  altitude: number;
}) => {
  const targetSlice = sliceGeoRouteByProgress(route, 0, Math.max(0.001, progress));
  const cameraSlice = sliceGeoRouteByProgress(route, 0, Math.max(0.001, progress - 0.055));
  const target = last(targetSlice) as Position;
  const camera = last(cameraSlice) as Position;

  return map.calculateCameraOptionsFromTo(
    new maplibregl.LngLat(camera[0], camera[1]),
    altitude,
    new maplibregl.LngLat(target[0], target[1]),
  );
};

const sourceData = (route: ReadonlyArray<Position>, progress: number) =>
  lineFeature(sliceGeoRouteByProgress(route, 0, Math.max(0.001, progress)));

export const MapLibreRouteSceneFrame = ({
  scene,
  project,
}: {
  scene: MapLibreRouteScene;
  project: VideoProject;
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, height, width} = useVideoConfig();
  const {delayRender, continueRender} = useDelayRender();
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedRef = useRef(false);
  const [loadingHandle] = useState(() => delayRender('Loading MapLibre route scene'));
  const [map, setMap] = useState<Map | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const route = project.geoRoutes?.[scene.routeId];
  const coordinates = useMemo(
    () => (route?.coordinates ?? []) as Position[],
    [route],
  );

  const progress = interpolate(
    frame,
    [0, Math.max(1, durationInFrames - 1)],
    [0.001, Math.max(0.001, scene.progress)],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const altitude = interpolate(
    progress,
    [0, 0.14, 0.86, 1],
    [
      Math.max(900, scene.altitude * 0.52),
      scene.altitude,
      scene.altitude,
      Math.max(900, scene.altitude * 0.62),
    ],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );

  useEffect(() => {
    if (!containerRef.current || !route || coordinates.length < 2) {
      return;
    }

    const finishLoading = () => {
      if (!resolvedRef.current) {
        resolvedRef.current = true;
        continueRender(loadingHandle);
      }
    };

    let mapInstance: Map;
    try {
      mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: scene.mapStyleUrl,
        center: coordinates[0],
        zoom: 10,
        pitch: 62,
        bearing: 0,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        canvasContextAttributes: {
          preserveDrawingBuffer: true,
        },
      });
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'MapLibre failed to initialize');
      finishLoading();
      return;
    }

    const fail = (message: string) => {
      setLoadError(message);
      finishLoading();
    };

    mapInstance.on('error', (event) => {
      const message = event?.error?.message ?? 'MapLibre map error';
      fail(message);
    });

    mapInstance.on('load', () => {
      mapInstance.addSource('travel-route', {
        type: 'geojson',
        data: sourceData(coordinates, 0.001),
      });

      mapInstance.addLayer({
        id: 'travel-route-shadow',
        type: 'line',
        source: 'travel-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#ffffff',
          'line-opacity': 0.92,
          'line-width': 10,
        },
      });

      mapInstance.addLayer({
        id: 'travel-route-line',
        type: 'line',
        source: 'travel-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': scene.routeColor,
          'line-width': 6,
        },
      });

      mapInstance.addSource('travel-marker', {
        type: 'geojson',
        data: pointFeature(coordinates[0]),
      });

      mapInstance.addLayer({
        id: 'travel-marker-dot',
        type: 'circle',
        source: 'travel-marker',
        paint: {
          'circle-color': scene.markerColor,
          'circle-radius': 10,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 4,
        },
      });

      if (scene.camera === 'overview') {
        const bounds = coordinates.reduce(
          (acc, coordinate) => acc.extend(coordinate),
          new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
        );
        mapInstance.fitBounds(bounds, {
          padding: Math.round(Math.min(width, height) * 0.12),
          duration: 0,
          maxZoom: 12.5,
        });
      } else {
        mapInstance.jumpTo(
          cameraOptions({
            map: mapInstance,
            route: coordinates,
            progress: 0.001,
            altitude: Math.max(900, scene.altitude * 0.52),
          }),
        );
      }

      mapInstance.once('idle', () => {
        setMap(mapInstance);
        finishLoading();
      });
      mapInstance.triggerRepaint();
    });

    return () => {
      mapInstance.remove();
    };
  }, [
    continueRender,
    coordinates,
    height,
    loadingHandle,
    route,
    scene.altitude,
    scene.camera,
    scene.mapStyleUrl,
    scene.markerColor,
    scene.routeColor,
    width,
  ]);

  useEffect(() => {
    if (!map || loadError || coordinates.length < 2) {
      return;
    }

    const handle = delayRender('Rendering MapLibre frame');
    const partial = sourceData(coordinates, progress);
    const marker = last(partial.geometry.coordinates) as Position;

    map.getSource<GeoJSONSource>('travel-route')?.setData(partial);
    map.getSource<GeoJSONSource>('travel-marker')?.setData(pointFeature(marker));

    if (scene.camera === 'follow') {
      map.jumpTo(
        cameraOptions({
          map,
          route: coordinates,
          progress,
          altitude,
        }),
      );
    }

    let continued = false;
    const finish = () => {
      if (!continued) {
        continued = true;
        continueRender(handle);
      }
    };

    map.once('idle', finish);
    map.triggerRepaint();

    const timeout = window.setTimeout(finish, 2500);
    return () => {
      window.clearTimeout(timeout);
      finish();
    };
  }, [
    altitude,
    continueRender,
    coordinates,
    delayRender,
    loadError,
    map,
    progress,
    scene.camera,
  ]);

  if (!route) {
    return (
      <AbsoluteFill style={{backgroundColor: project.theme.background, color: project.theme.foreground, padding: 48}}>
        Missing geographic route: {scene.routeId}
      </AbsoluteFill>
    );
  }

  if (loadError) {
    return (
      <GeoRouteSceneFrame
        project={project}
        scene={{
          id: scene.id,
          type: 'geo-route',
          duration: scene.duration,
          motionAmount: scene.motionAmount,
          transitionDuration: scene.transitionDuration,
          title: scene.title,
          routeId: scene.routeId,
          stops: scene.stops,
          progress: scene.progress,
          label: scene.label ?? 'MapLibre unavailable · SVG fallback',
          mapRotation: 0,
          camera: scene.camera,
          cameraZoom: 1.28,
          style: 'clean',
          showDetails: scene.showDetails,
        }}
      />
    );
  }

  const {foreground, muted, accent} = project.theme;
  const start = scene.stops[0]?.label;
  const end = scene.stops[scene.stops.length - 1]?.label;

  return (
    <AbsoluteFill style={{backgroundColor: '#dbeafe', overflow: 'hidden'}}>
      <div ref={containerRef} style={{height, position: 'absolute', width}} />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 28%, rgba(0,0,0,0.06) 66%, rgba(0,0,0,0.62) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width * 0.065,
          right: width * 0.065,
          top: height * 0.06,
          color: '#ffffff',
          fontFamily: 'Inter, Arial, sans-serif',
          textShadow: '0 2px 18px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{fontSize: width * 0.018, fontWeight: 850, letterSpacing: width * 0.0045, color: accent}}>
          EXPERIMENTAL MAPLIBRE
        </div>
        <div style={{fontSize: width * 0.052, lineHeight: 1.04, fontWeight: 850, marginTop: height * 0.012}}>
          {scene.title}
        </div>
        {scene.label ? (
          <div style={{fontSize: width * 0.024, color: '#f4f4f4', fontWeight: 650, marginTop: height * 0.012}}>
            {scene.label}
          </div>
        ) : null}
      </div>

      {scene.showDetails ? (
        <div
          style={{
            position: 'absolute',
            left: width * 0.065,
            bottom: height * 0.095,
            color: '#ffffff',
            fontFamily: 'Inter, Arial, sans-serif',
          }}
        >
          <div style={{fontSize: width * 0.029, fontWeight: 820}}>
            {start}{start && end ? ' → ' : ''}{end}
          </div>
          <div style={{fontSize: width * 0.017, color: '#e5e7eb', marginTop: height * 0.012}}>
            Route: {route.source.name} · {route.source.license}
          </div>
          <div style={{fontSize: width * 0.015, color: muted, marginTop: height * 0.008}}>
            Basemap: OpenFreeMap · © OpenStreetMap contributors
          </div>
        </div>
      ) : null}

      <div
        style={{
          position: 'absolute',
          right: width * 0.065,
          bottom: height * 0.085,
          width: width * 0.11,
          height: width * 0.11,
          borderRadius: '50%',
          border: `2px solid ${foreground}`,
          display: 'grid',
          placeItems: 'center',
          color: foreground,
          background: 'rgba(0,0,0,0.28)',
          fontFamily: 'Inter, Arial, sans-serif',
          fontWeight: 850,
          fontSize: width * 0.024,
        }}
      >
        {Math.round(progress * 100)}%
      </div>
    </AbsoluteFill>
  );
};
