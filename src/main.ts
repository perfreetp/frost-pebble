// Register leaf components before the shell so nested custom elements are
// upgraded the moment their parent renders them.
import './ui/stage-view';
import './ui/timeline-view';
import './ui/projects-view';
import './ui/workbench-view';
import './ui/review-view';
import './ui/compare-view';
import './ui/app-shell';

window.addEventListener('error', (e) => {
  console.error('[farm] runtime error', e.error ?? e.message);
});

const boot = document.querySelector('farm-app');
if (!boot) {
  document.body.insertAdjacentHTML('beforeend', '<farm-app></farm-app>');
}

if (!location.hash) location.hash = '#/projects';
