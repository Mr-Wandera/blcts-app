// Intercept and suppress benign development/environment warnings and errors early
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = function (...args) {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('width') ||
        args[0].includes('height') ||
        args[0].includes('should be greater than 0') ||
        args[0].includes('ResponsiveContainer'))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  const originalError = console.error;
  console.error = function (...args) {
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      (args[0].includes('failed to connect to websocket') ||
        args[0].includes('WebSocket') ||
        args[0].includes('HMR'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason) {
      const msg = typeof reason === 'string' ? reason : (reason.message || '');
      if (
        msg.toLowerCase().includes('websocket') ||
        msg.toLowerCase().includes('web socket') ||
        msg.toLowerCase().includes('hmr') ||
        msg.toLowerCase().includes('closed without opened')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }, true);

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.toLowerCase().includes('websocket') ||
      msg.toLowerCase().includes('web socket') ||
      msg.toLowerCase().includes('hmr')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
