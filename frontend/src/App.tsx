import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import DocumentExamplePage from './pages/DocumentExamplePage.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage/>} />
          <Route path="register" element={<RegisterPage/>} />
          <Route path="pdf-file" element={<DocumentExamplePage/>}/>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
