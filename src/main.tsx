
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandler } from './lib/errorLogger.ts'

// Set up global error handling
setupGlobalErrorHandler();

// Add a simple way to access error logs from the console for debugging
import ErrorLogger from './lib/errorLogger.ts'
// @ts-ignore - Make ErrorLogger available in window for debugging
window.ErrorLogger = ErrorLogger;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
