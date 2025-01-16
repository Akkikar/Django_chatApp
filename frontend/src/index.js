import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot from react-dom/client
 // Wrap the app with BrowserRouter here

import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root element

root.render(<App/>);