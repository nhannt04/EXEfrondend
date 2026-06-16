import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const clientId = (envClientId ? envClientId.trim() : null) || '557476564724-ipec9o4fh2gi1bmr8in3fof2q33hfma5.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
