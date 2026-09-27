import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';
import './index.css';

// Read the Clerk Publishable Key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Helpful fallback screen if user has not yet configured their Clerk key
if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.includes('replace_with_your')) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <div style={{ maxWidth: '640px', margin: '60px auto', padding: '32px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ color: '#1E40AF', marginTop: 0 }}>⚠️ Clerk Publishable Key Required</h2>
        <p style={{ color: '#1E3A8A', lineHeight: 1.6 }}>
          To enable authentication in StudyTrack, add your Clerk Publishable Key:
        </p>
        <ol style={{ color: '#1E3A8A', lineHeight: 1.8, paddingLeft: '20px' }}>
          <li>Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 600 }}>dashboard.clerk.com</a></li>
          <li>Select your application &rarr; <strong>API Keys</strong></li>
          <li>Copy the <strong>Publishable key</strong> (starts with <code>pk_test_...</code>)</li>
          <li>Open <code>client/.env</code> and set:
            <pre style={{ background: '#DBEAFE', padding: '10px', borderRadius: '6px', marginTop: '6px' }}>
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
            </pre>
          </li>
          <li>Restart the client dev server!</li>
        </ol>
      </div>
    </div>
  );
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
