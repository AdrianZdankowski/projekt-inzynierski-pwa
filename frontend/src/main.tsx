import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeModeProvider } from './context/ThemeModeContext.tsx';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
        <ThemeModeProvider>
            <App />
        </ThemeModeProvider>
    </AuthProvider>
  </StrictMode>
)
