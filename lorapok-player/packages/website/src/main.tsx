import React, { Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'lorapok-player/style.css'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class RootErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Lorapok App Uncaught Error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'monospace' }}>
                    <div style={{ maxWidth: '600px', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,243,255,0.3)', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem', color: '#00F3FF', textTransform: 'uppercase' }}>Lorapok Player Recovery Mode</h1>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            An unexpected initialization error occurred. Please refresh or load default presets.
                        </p>
                        <pre style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '0.75rem', color: '#ff6b6b', overflowX: 'auto', textAlign: 'left', marginBottom: '1.5rem' }}>
                            {this.state.error?.stack || this.state.error?.message || 'Unknown runtime error'}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            style={{ background: '#00F3FF', color: '#050510', fontWeight: 'bold', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer' }}
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RootErrorBoundary>
            <App />
        </RootErrorBoundary>
    </React.StrictMode>,
)


