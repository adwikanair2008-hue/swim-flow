
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Service Worker registration disabled to prevent origin mismatch errors 
 * and ensure stable execution across all mobile browser environments.
 * Data persistence continues via LocalStorage within the App component.
 */

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
