import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import Unauthorized from './components/Unauthorized.tsx'
import UserFilesPage from './pages/UserFilesPage.tsx'
import { useAuth } from './context/AuthContext.tsx'
import VideoTestPage from './pages/VideoTestPage.tsx'
import AxiosInterceptorWrapper from './components/AxiosInterceptorWrapper.ts'
import Notification from './components/Notification.tsx'

function App() {
  const {isAuthenticated} = useAuth();

  return (
    <Router>
      <AxiosInterceptorWrapper/>
      <Notification/>
      <Routes>
        <Route path="/login" element={
            <LoginPage/>
        } />
        <Route path="/register" element={
            <RegisterPage/>
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/user-files" replace/> : <Navigate to="/login" replace/>
        } />
        
        <Route element={<MainLayout />}>
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
