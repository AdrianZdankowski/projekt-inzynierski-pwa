//import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import appLogo from '/favicon.svg'
import PWABadge from './PWABadge.tsx'
import Header from './components/header.tsx'
import ConnectionStatus from './components/ConnectionStatus.tsx'
import ModeMessage from './components/ModeMessage.tsx'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Header/>
      <ConnectionStatus/>
      <ModeMessage/>
      <PWABadge />
    </>
  )
}

export default App
