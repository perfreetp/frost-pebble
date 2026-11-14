import { render } from 'solid-js/web';
import './styles.css';
import App from './App';
import { initStore } from './lib/store';

const root = document.getElementById('root') as HTMLElement;

async function boot() {
  await initStore();
  render(() => <App />, root);
}

void boot();
