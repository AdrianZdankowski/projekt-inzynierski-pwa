import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeModeProvider } from './context/ThemeModeContext.tsx';
import i18n from './i18n/config';
import './index.css'
import App from './App.tsx'

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
          <ThemeModeProvider>
              <App />
          </ThemeModeProvider>
      </AuthProvider>
    </StrictMode>
  )
};

if (i18n.isInitialized) {
  renderApp();
} else {
  i18n.on('initialized', () => {
    renderApp();
  });
}
