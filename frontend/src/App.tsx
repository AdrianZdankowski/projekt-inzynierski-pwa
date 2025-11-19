import { useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import Unauthorized from './components/Unauthorized.tsx'
import UserFilesPage from './pages/UserFilesPage.tsx'
import { useAuth } from './context/AuthContext.tsx'
import { ThemeProvider } from '@emotion/react'
import VideoTestPage from './pages/VideoTestPage.tsx'
import { createAuthTheme } from './themes/auth/AuthTheme.ts'
import { useThemeMode } from './context/ThemeModeContext.tsx'
import AxiosInterceptorWrapper from './components/AxiosInterceptorWrapper.ts'

function App() {
  const {isAuthenticated} = useAuth();
  const {mode} = useThemeMode();
  const authTheme = useMemo(() => createAuthTheme(mode), [mode]);

  return (
    <Router>
      <AxiosInterceptorWrapper/>
      <Routes>
        {/* Strony auth bez MainLayout */}
        <Route path="/login" element={
          <ThemeProvider theme={authTheme}>
            <LoginPage/>
          </ThemeProvider>
        } />
        <Route path="/register" element={
          <ThemeProvider theme={authTheme}>
            <RegisterPage/>
          </ThemeProvider>
        } />
        
        {/* Pozostałe strony z MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="user-files" element={
            <ProtectedRoute>
                <UserFilesPage/>   
            </ProtectedRoute>
            }/>
          <Route path="unauthorized" element={<Unauthorized/>}/>
          <Route path="video" element={
            <ProtectedRoute>
                <VideoTestPage/>
            </ProtectedRoute>
            }/>
        </Route>
        
        <Route path="*" element={isAuthenticated ? <Navigate to="/user-files" replace/> : <Navigate to="/login" replace/>}/>
      </Routes>
    </Router>
  )
}

export default App
