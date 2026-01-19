import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const Root = () => {
  try {
    return (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (e) {
    console.error('CRITICAL_REACT_ERROR', e);
    return <div style={{ color: 'white', background: 'red', padding: '20px' }}>CRITICAL_UI_ERROR: {String(e)}</div>
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />)

// Use contextBridge safely
if (window.ipcRenderer) {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
}
