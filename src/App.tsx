import {useMemo, useRef, useState, type CSSProperties} from 'react';
import {Player} from '@remotion/player';
import {projects} from './project/catalog';
import {getDimensions, projectFrames} from './project/schema';
import {VideoComposition} from './remotion/VideoComposition';
import {RenderPanel} from './render/RenderPanel';

export const App = () => {
  const [projectId, setProjectId] = useState(projects[0].id);
  const [query, setQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const libraryRef = useRef<HTMLElement>(null);
  const project = useMemo(
    () => projects.find((item) => item.id === projectId) ?? projects[0],
    [projectId],
  );
  const dimensions = getDimensions(project.format);
  const durationInFrames = projectFrames(project);
  const durationSeconds = durationInFrames / project.fps;
  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();
    return projects.filter((item) =>
      (formatFilter === 'all' || item.format === formatFilter) &&
      (!search || `${item.title} ${item.template} ${item.format}`.toLowerCase().includes(search)),
    );
  }, [query, formatFilter]);
  const playerStyle = {
    aspectRatio: `${dimensions.width} / ${dimensions.height}`,
    '--preview-fit-width': `${(58 * dimensions.width / dimensions.height).toFixed(2)}dvh`,
  } as CSSProperties;

  const selectProject = (id: string) => {
    setProjectId(id);
    setLibraryOpen(false);
    if (window.matchMedia('(max-width: 1100px)').matches) {
      window.requestAnimationFrame(() => libraryRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'}));
    }
  };

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
        <aside className="sidebar" ref={libraryRef}>
          <button
            className="library-toggle"
            type="button"
            aria-expanded={libraryOpen}
            aria-controls="project-library"
            onClick={() => setLibraryOpen((open) => !open)}
          >
            <span><small>Selected video</small><strong>{project.title}</strong></span>
            <span className="library-toggle-action">{libraryOpen ? "Close library ↑" : "Change video ↓"}</span>
          </button>
          <div id="project-library" className={libraryOpen ? "library-body is-open" : "library-body"}>
          <div className="panel-heading">
            <span>Projects</span>
            <span className="count">{filteredProjects.length}/{projects.length}</span>
          </div>

          <div className="project-controls">
            <label className="sr-only" htmlFor="project-search">Search projects</label>
            <input id="project-search" type="search" placeholder="Search videos…" value={query} onChange={(event) => setQuery(event.target.value)} />
            <label className="sr-only" htmlFor="project-format">Filter by video format</label>
            <select id="project-format" value={formatFilter} onChange={(event) => setFormatFilter(event.target.value)}>
              <option value="all">All formats</option>
              <option value="vertical">Vertical 9:16</option>
              <option value="landscape">Landscape 16:9</option>
              <option value="square">Square 1:1</option>
              <option value="appstore-header">App Store header</option>
              <option value="appstore-search">App Store search</option>
            </select>
          </div>

          <nav className="project-list" aria-label="Available videos">
            {filteredProjects.map((item) => (
              <button
                className={item.id === project.id ? 'project-button active' : 'project-button'}
                key={item.id}
                onClick={() => selectProject(item.id)}
                aria-current={item.id === project.id ? "true" : undefined}
                type="button"
              >
                <span className="project-title">{item.title}</span>
                <span className="project-meta">{item.format} · {item.scenes.length} scenes</span>
              </button>
            ))}
            {filteredProjects.length === 0 ? <p className="project-empty">No videos match your search.</p> : null}
          </nav>

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
          </div>
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
              style={playerStyle}
            >
              <Player
                key={project.id}
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

          <RenderPanel key={project.id} project={project} />

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
