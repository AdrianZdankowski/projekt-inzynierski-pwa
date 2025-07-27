import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import PDFExamplePage from './pages/PDFExamplePage.tsx'
import TXTExamplePage from './pages/TXTExamplePage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
