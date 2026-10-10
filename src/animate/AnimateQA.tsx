import {useState} from 'react';
import type {VideoProject} from '../project/schema';
import {inspectAnimateProject, type AnimateIssue} from './visualQA';

export function AnimateQA({project}: {project: VideoProject}) {
  const [issues, setIssues] = useState<AnimateIssue[] | null>(null);
  if (!project.scenes.some(scene => scene.type === 'animate-canvas')) return null;
  const report = () => {
    const issues = inspectAnimateProject(project);
    setIssues(issues);
  };
  return <section style={{marginTop: 14, padding: 14, border: '1px solid #66708555', borderRadius: 12}}>
    <h3 style={{fontSize: 16, margin: '0 0 9px'}}>Animation quality check</h3>
    <button type="button" className="secondary-button" onClick={report}>Run visual QA</button>
    {issues ? <div role="status" style={{marginTop: 10}}>
      {issues.length === 0 ? <p>No issues found by automated checks. Review final video manually.</p> :
        issues.map((issue, index) => <p key={index} style={{margin: '6px 0'}}>{issue.severity === 'error' ? '✕' : '!'} {issue.sceneId}: {issue.message}</p>)}
    </div> : null}
  </section>;
}
