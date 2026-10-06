import {useRef, useState} from 'react';
import {canRenderMediaOnWeb, renderMediaOnWeb} from '@remotion/web-renderer';
import type {VideoProject} from '../project/schema';
import {getDimensions, projectFrames} from '../project/schema';
import {VideoComposition} from '../remotion/VideoComposition';
import {checkProjectAssets, type AssetCheck} from './preflight';
import {renderProfiles, type RenderProfile} from './profiles';

type Props = {
  project: VideoProject;
};

type RenderState = 'idle' | 'checking' | 'rendering' | 'done' | 'error';

export const RenderPanel = ({project}: Props) => {
  const [profile, setProfile] = useState<RenderProfile>('draft');
  const [state, setState] = useState<RenderState>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Ready for browser render');
  const [assets, setAssets] = useState<AssetCheck[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

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
      const scale = renderProfiles[profile].scale;
      const width = Math.round(dimensions.width * scale);
      const height = Math.round(dimensions.height * scale);

      const capability = await canRenderMediaOnWeb({
        width,
        height,
        container: 'mp4',
        videoCodec: 'h264',
        muted: true,
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
          id: project.id,
        },
        inputProps: {project},
        container: 'mp4',
        videoCodec: 'h264',
        muted: true,
        scale,
        signal: controller.signal,
        allowHtmlInCanvas: false,
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
          <h3>Browser MP4</h3>
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
