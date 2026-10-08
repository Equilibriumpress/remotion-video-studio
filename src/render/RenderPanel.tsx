import {useEffect, useRef, useState} from 'react';
import {canRenderMediaOnWeb, renderMediaOnWeb} from '@remotion/web-renderer';
import type {VideoProject} from '../project/schema';
import {getDimensions, projectFrames, projectHasAudio} from '../project/schema';
import {VideoComposition} from '../remotion/VideoComposition';
import {checkProjectAssets, type AssetCheck} from './preflight';
import {renderProfiles, type RenderProfile} from './profiles';

type Props = {
  project: VideoProject;
};

type RenderState = 'idle' | 'checking' | 'rendering' | 'done' | 'error';

export const RenderPanel = ({project}: Props) => {
  const usesMapLibre = project.scenes.some((scene) => scene.type === 'maplibre-route');
  const usesThree = project.scenes.some((scene) => scene.type === 'three-globe');
  const usesExperimentalCanvas = usesThree;
  const [profile, setProfile] = useState<RenderProfile>('draft');
  const [state, setState] = useState<RenderState>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(
    usesThree
      ? 'Experimental 3D/WebGL export · Chromium recommended'
      : usesMapLibre
        ? 'MapLibre snapshot export · WebGL is released before frame capture'
        : 'Ready for browser render',
  );
  const [assets, setAssets] = useState<AssetCheck[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  // Switching videos unmounts the export panel. Stop an in-flight render.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const render = async () => {
    setState('checking');
    setProgress(0);
    setMessage('Checking browser and assets…');

    try {
      const checks = await checkProjectAssets(project);
      setAssets(checks);
      const failedAssets = checks.filter((item) => !item.ok);
      if (failedAssets.length > 0) {
        throw new Error(`${failedAssets.length} asset check${failedAssets.length === 1 ? '' : 's'} failed`);
      }

      const dimensions = getDimensions(project.format);
      const hasAudio = projectHasAudio(project);
      const scale = renderProfiles[profile].scale;
      const width = Math.round(dimensions.width * scale);
      const height = Math.round(dimensions.height * scale);

      const capability = await canRenderMediaOnWeb({
        width,
        height,
        container: 'mp4',
        videoCodec: 'h264',
        muted: !hasAudio,
      });

      if (!capability.canRender) {
        const reason = capability.issues
          .filter((issue) => issue.severity === 'error')
          .map((issue) => issue.message)
          .join(' ');
        throw new Error(reason || 'This browser cannot render H.264 MP4.');
      }

      const controller = new AbortController();
      controllerRef.current = controller;
      setState('rendering');
      setMessage(`Rendering ${width}×${height} MP4 on this device…`);

      const result = await renderMediaOnWeb({
        composition: {
          component: VideoComposition,
          durationInFrames: projectFrames(project),
          fps: project.fps,
          width: dimensions.width,
          height: dimensions.height,
          calculateMetadata: null,
          defaultProps: {project},
          id: project.id,
        },
        inputProps: {project},
        container: 'mp4',
        videoCodec: 'h264',
        muted: !hasAudio,
        scale,
        signal: controller.signal,
        allowHtmlInCanvas: usesExperimentalCanvas,
        onProgress: ({progress: value}) => setProgress(value),
      });

      const blob = await result.getBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${project.id}-${profile}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);

      setProgress(1);
      setState('done');
      setMessage('MP4 rendered on this device');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setState('idle');
        setMessage('Render cancelled');
      } else {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Render failed');
      }
    } finally {
      controllerRef.current = null;
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
  };

  return (
    <section className="render-panel">
      <div className="render-head">
        <div>
          <p className="eyebrow">Export</p>
          <h3>{usesThree ? 'Browser MP4 · experimental 3D' : usesMapLibre ? 'Browser MP4 · snapshot map' : 'Browser MP4'}</h3>
        </div>
        <span className={`render-state ${state}`}>{state}</span>
      </div>

      <div className="profile-switch">
        {(Object.keys(renderProfiles) as RenderProfile[]).map((key) => (
          <button
            className={profile === key ? 'profile active' : 'profile'}
            disabled={state === 'rendering'}
            key={key}
            onClick={() => setProfile(key)}
            type="button"
          >
            <strong>{renderProfiles[key].label}</strong>
            <small>{renderProfiles[key].description}</small>
          </button>
        ))}
      </div>

      <div className="progress-track" aria-label="Render progress">
        <span style={{width: `${Math.round(progress * 100)}%`}} />
      </div>
      <div className="render-message">
        <span>{message}</span>
        <strong>{Math.round(progress * 100)}%</strong>
      </div>

      {assets.length > 0 ? (
        <div className="asset-results">
          {assets.map((asset) => (
            <div key={asset.source} className={asset.ok ? 'asset-ok' : 'asset-fail'}>
              <span>{asset.ok ? '✓' : '×'}</span>
              <span>{asset.source}</span>
              <small>{asset.message}</small>
            </div>
          ))}
        </div>
      ) : null}

      {usesMapLibre ? (
        <p className="render-note">
          MapLibre is used only to prepare one bounded static basemap snapshot. After the style reaches idle,
          the WebGL canvas is converted to an image and released; route reveal and follow motion then use
          Remotion/SVG + CSS. Map exports therefore use the normal DOM compositor instead of experimental HTML-in-canvas capture.
        </p>
      ) : null}
      {usesThree ? (
        <p className="render-note">
          Three.js preview uses WebGL. MP4 export enables Remotion HTML-in-canvas for the 3D canvas.
          Chromium is the preferred export path; unsupported preview devices receive a lightweight 2D globe fallback.
        </p>
      ) : null}

      <div className="render-actions">
        <button className="primary-button" disabled={state === 'checking' || state === 'rendering'} onClick={render} type="button">
          Render MP4
        </button>
        {state === 'rendering' ? (
          <button className="secondary-button" onClick={cancel} type="button">Cancel</button>
        ) : null}
      </div>
    </section>
  );
};
