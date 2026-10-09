import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { LearnerProvider } from './state/LearnerContext.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LearnerProvider>
      <App />
    </LearnerProvider>
  </React.StrictMode>
);
