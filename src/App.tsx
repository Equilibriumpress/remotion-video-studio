import {useMemo, useState} from 'react';
import {Player} from '@remotion/player';
import {projects} from './project/catalog';
import {getDimensions, projectFrames} from './project/schema';
import {VideoComposition} from './remotion/VideoComposition';
import {RenderPanel} from './render/RenderPanel';

export const App = () => {
  const [projectId, setProjectId] = useState(projects[0].id);
  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? projects[0],
    [projectId],
  );
  const dimensions = getDimensions(project.format);
  const durationInFrames = projectFrames(project);
  const durationSeconds = durationInFrames / project.fps;

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">GitHub → Pages → browser render</p>
          <h1>Remotion Video Studio</h1>
        </div>
        <div className="topbar-meta">
          <span>{project.template}</span>
          <span>{Math.round(durationSeconds * 10) / 10}s</span>
          <span>{project.fps} fps</span>
        </div>
      </header>

      <div className="studio-grid">
        <aside className="sidebar">
          <div className="panel-heading">
            <span>Projects</span>
            <span className="count">{projects.length}</span>
          </div>

          <div className="project-list">
            {projects.map((item) => (
              <button
                className={item.id === project.id ? 'project-button active' : 'project-button'}
                key={item.id}
                onClick={() => setProjectId(item.id)}
                type="button"
              >
                <span className="project-title">{item.title}</span>
                <span className="project-meta">{item.format} · {item.scenes.length} scenes</span>
              </button>
            ))}
          </div>

          <div className="project-facts">
            <div><span>Format</span><strong>{dimensions.width}×{dimensions.height}</strong></div>
            <div><span>Frames</span><strong>{durationInFrames}</strong></div>
            <div><span>Source</span><strong>{project.director ? 'Prompt → Director' : 'JSON'}</strong></div>
          </div>

          {project.director ? (
            <div className="director-card">
              <p className="eyebrow">Director input</p>
              <blockquote>{project.director.sourcePrompt}</blockquote>
              <div className="director-tags">
                <span>{project.director.visualLanguage}</span>
                <span>{project.director.pacing}</span>
                <span>{project.director.durationTarget}s target</span>
              </div>
              <p className="director-payoff">
                <strong>Payoff</strong>
                {project.director.payoff}
              </p>
            </div>
          ) : null}
        </aside>

        <section className="workspace">
          <div className="workspace-head">
            <div>
              <p className="eyebrow">Preview</p>
              <h2>{project.title}</h2>
            </div>
            <span className="live-badge"><i /> Live composition</span>
          </div>

          <div className="player-stage">
            <div
              className="player-wrap"
              style={{aspectRatio: `${dimensions.width} / ${dimensions.height}`}}
            >
              <Player
                component={VideoComposition}
                inputProps={{project}}
                durationInFrames={durationInFrames}
                compositionWidth={dimensions.width}
                compositionHeight={dimensions.height}
                fps={project.fps}
                controls
                style={{width: '100%', height: '100%'}}
              />
            </div>
          </div>

          <RenderPanel project={project} />

          <div className="scene-strip" aria-label="Scene overview">
            {project.scenes.map((scene, index) => (
              <div className="scene-chip" key={scene.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{scene.type}</strong>
                <small>{scene.role ? `${scene.role} · ` : ''}{scene.duration}s</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};
