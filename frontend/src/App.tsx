import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import PDFExamplePage from './pages/PDFExamplePage.tsx'
import TXTExamplePage from './pages/TXTExamplePage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import Unauthorized from './components/Unauthorized.tsx'
import UserFileManagerPage from './pages/UserFilesPage.tsx'
import { useAuth } from './context/AuthContext.tsx'
import { ThemeProvider } from '@emotion/react'
import UserFilesTheme from './themes/UserFilesTheme.ts'

function App() {
  const {isAuthenticated} = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage/>} />
          <Route path="register" element={<RegisterPage/>} />
          <Route path="user-files" element={
            <ProtectedRoute>
              <ThemeProvider theme={UserFilesTheme}>
                <UserFileManagerPage/>   
              </ThemeProvider>
            </ProtectedRoute>
            }/>
          <Route path="pdf-file" element={
            <ProtectedRoute>
              <PDFExamplePage/>
            </ProtectedRoute>
            }/>
          <Route path="txt-file" element={<TXTExamplePage/>}/>
          <Route path="unauthorized" element={<Unauthorized/>}/>
          <Route path="*" element={isAuthenticated ? <Navigate to="/user-files" replace/> : <Navigate to="/login" replace/>}/>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
