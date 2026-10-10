import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/amatic-sc/700.css';
import '@fontsource-variable/source-sans-3/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
