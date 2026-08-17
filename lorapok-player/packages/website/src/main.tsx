import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'lorapok-player/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

// Remove the HTML loading screen once React has hydrated
const loadingScreen = document.getElementById('loading-screen');
if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
        loadingScreen.remove();
    }, 600);
}
