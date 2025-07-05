import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import App from './App';

// Create a root
const root = createRoot(document.getElementById('root'));

// Render the app
root.render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
