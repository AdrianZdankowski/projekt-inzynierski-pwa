import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css'
import App from './App.tsx'

const client = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={client}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
    
  </StrictMode>,
)
