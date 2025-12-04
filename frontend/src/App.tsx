import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/MainLayout.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import PublicRoute from './components/PublicRoute.tsx'
import UserFilesPage from './pages/UserFilesPage.tsx'
import { useAuth } from './context/AuthContext.tsx'
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
            <PublicRoute>
              <LoginPage/>
            </PublicRoute>
          } />
        <Route path="/register" element={
            <PublicRoute>
              <RegisterPage/>
            </PublicRoute>
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
        </Route>
        <Route path="*" element={isAuthenticated ? <Navigate to="/user-files" replace/> : <Navigate to="/login" replace/>}/>
      </Routes>
    </Router>
  )
}

export default App
