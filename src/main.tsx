import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { AppDataProvider } from './context/AppDataContext'
import { ToastProvider } from './context/ToastContext'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'


const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppDataProvider>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </AppDataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
