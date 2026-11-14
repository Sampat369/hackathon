import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { USE_MOCKS } from '@/lib/constants'

async function prepareApp() {
  if (USE_MOCKS) {
    const { worker } = await import('@/mocks/browser')
    await worker.start({
      onUnhandledFrame: 'bypass',
    })
  }
}

prepareApp().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
