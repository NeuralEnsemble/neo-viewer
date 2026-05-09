import React from 'react'
import { createRoot } from 'react-dom/client'
import '@ebrains/assets/styles/output.css'
import App from './App'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
