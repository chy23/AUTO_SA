import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* 
 * 網站建立自楊家驊老師 
 * The website was created by Teacher ChiahuaYang 
 */
import './index.css'
import App from './App.jsx'

console.log("Triggering new deployment");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
