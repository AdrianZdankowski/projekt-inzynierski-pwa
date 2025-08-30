import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import PDFExamplePage from './pages/PDFExamplePage.tsx'
import TXTExamplePage from './pages/TXTExamplePage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import Unauthorized from './components/Unauthorized.tsx'
import VideoTestPage from './pages/VideoTestPage.tsx'
import VideoPlayerTheme from './themes/VideoPlayerTheme.ts'
import { ThemeProvider } from '@emotion/react'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage/>} />
          <Route path="register" element={<RegisterPage/>} />
          <Route path="pdf-file" element={
            <ProtectedRoute>
              <PDFExamplePage/>
            </ProtectedRoute>
            }/>
          <Route path="txt-file" element={<TXTExamplePage/>}/>
          <Route path="unauthorized" element={<Unauthorized/>}/>
          <Route path="video" element={
            <ProtectedRoute>
              <ThemeProvider theme={VideoPlayerTheme}>
                <VideoTestPage videoId="448cb6b1-6f01-408a-8f98-a49ef327f365"/>
              </ThemeProvider>
            </ProtectedRoute>
            }/>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
